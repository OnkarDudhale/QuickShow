import mongoose from 'mongoose'

const bookingSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
        ref: 'User'
    },

    show: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Show'
    },

    bookedSeats: {
        type: [String],
        required: true
    },

    amount: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'paid', 'expired'],
        default: 'pending'
    },

    isPaid: {
        type: Boolean,
        default: false
    },

    paymentLink: {
        type: String
    },

    expiresAt: {
        type: Date
    }

}, { timestamps: true })

bookingSchema.index(
    { expiresAt: 1 },
    { expireAfterSeconds: 0 }
)

const Booking = mongoose.model('Booking', bookingSchema)

export default Booking