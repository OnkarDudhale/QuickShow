import Show from '../models/Show.js'
import Booking from '../models/Booking.js'
import Stripe from 'stripe'
import { inngest } from '../inngest/index.js'

//to check availablity of selected seats for movie
const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);
        return !isAnySeatTaken;

    } catch (error) {
        console.log(error.message);
        return false;
    }
}

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;
        const { origin } = req.headers;

        const showData = await Show.findById(showId).populate('movie');

        if (!showData) {
            return res.json({ success: false, message: "Show not found" })
        }

        const isAvailable = selectedSeats.every(
            seat => !showData.occupiedSeats[seat] && !showData.pendingSeats?.[seat]
        );

        if (!isAvailable) {
            return res.json({ success: false, message: "Seats not available" })
        }

        const booking = await Booking.create({
            user: userId,
            show: showId,
            bookedSeats: selectedSeats,
            amount: showData.showPrice * selectedSeats.length,
            status: "pending",
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
        });

        // ✅ Lock seats temporarily
        selectedSeats.forEach(seat => {
            if (!showData.pendingSeats) showData.pendingSeats = {};
            showData.pendingSeats[seat] = {
                userId,
                expiresAt: booking.expiresAt
            };
        });

        showData.markModified('pendingSeats');
        await showData.save();

        //  Stripe session
        const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

        const session = await stripeInstance.checkout.sessions.create({
            mode: 'payment',
            success_url: `${origin}/loading/my-bookings`,
            cancel_url: `${origin}/my-bookings`,
            line_items: [{
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: showData.movie.title
                    },
                    unit_amount: Math.floor(booking.amount) * 100
                },
                quantity: 1
            }],
            metadata: {
                bookingId: booking._id.toString()
            },
            expires_at: Math.floor(Date.now() / 1000) + 30 * 60
        });

        booking.paymentLink = session.url;
        await booking.save();

        res.json({ success: true, url: session.url });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {
        const { showId } = req.params;
        const showData = await Show.findById(showId);
        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({ success: true, occupiedSeats })

    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}


export const stripeWebhooks = async (req, res) => {

    const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY)
    const sig = req.headers["stripe-signature"]

    let event;

    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {

            case "checkout.session.completed": {
                const session = event.data.object;
                const { bookingId } = session.metadata;

                const booking = await Booking.findById(bookingId);
                if (!booking || booking.status === "paid") break;

                const show = await Show.findById(booking.show);

                //  Move seats: pending → occupied
                booking.bookedSeats.forEach(seat => {
                    delete show.pendingSeats?.[seat];
                    show.occupiedSeats[seat] = booking.user;
                });

                show.markModified('pendingSeats');
                show.markModified('occupiedSeats');

                await show.save();

                booking.status = "paid";
                booking.isPaid = true;
                booking.paymentLink = '';

                booking.expiresAt = undefined;

                await booking.save();

                break;
            }

            case "checkout.session.expired": {
                const session = event.data.object;
                const { bookingId } = session.metadata;

                const booking = await Booking.findById(bookingId);
                if (!booking) break;

                const show = await Show.findById(booking.show);

                //  Release seats
                booking.bookedSeats.forEach(seat => {
                    delete show.pendingSeats?.[seat];
                });

                show.markModified('pendingSeats');
                await show.save();

                booking.status = "expired";
                await booking.save();

                break;
            }

            default:
                console.log("Unhandled event:", event.type);
        }

        res.json({ received: true });

    } catch (error) {
        console.log("Webhook error:", error);
        res.status(500).send("Server error");
    }
};

