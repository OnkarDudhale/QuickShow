import Booking from "../models/Booking.js";
import { clerkClient } from '@clerk/express'
import Movie from '../models/Movie.js'

//API controller function to get user bookings
export const getUserBookings = async (req, res) => {
    try {
        const user = req.auth().userId;
        const bookings = await Booking.find({ user }).populate({ path: 'show', populate: { path: 'movie' } }).sort({ createdAt: -1 })
        const validBookings = bookings.filter(
            b => b.show && b.show.movie
        );
        res.json({ success: true, bookings: validBookings })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message });
    }
}

//API Controller function to update favorite movie in clerk user metadata
export const updateFavourite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized user" });
        }
        const user = await clerkClient.users.getUser(userId);

        if (!user.privateMetadata.favourites) {
            user.privateMetadata.favourites = []
        }

        if (!user.privateMetadata.favourites.includes(movieId)) {
            user.privateMetadata.favourites.push(movieId)
        } else {
            user.privateMetadata.favourites = user.privateMetadata.favourites.filter(item => item !== movieId)
        }
        await clerkClient.users.updateUserMetadata(userId, { privateMetadata: user.privateMetadata })

        res.json({ success: true, message: 'favourite movies updated.' })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message });
    }
}


//API to get favourites
export const getFavourites = async (req, res) => {
    try {
        const user = await clerkClient.users.getUser(req.auth().userId)

        const favourites = user.privateMetadata.favourites;

        //Getting movies from database
        const movies = await Movie.find({ _id: { $in: favourites } })

        res.json({ success: true, movies })
    } catch (error) {
        console.error(error.message);
        res.json({ success: false, message: error.message })
    }
}

//Api to remove movie from favourite
export const removeFavourite = async (req, res) => {
    try {
        const { movieId } = req.body;
        const userId = req.auth().userId;

        if (!userId) {
            return res.json({ success: false, message: "Unauthorized user" });
        }

        const user = await clerkClient.users.getUser(userId);

        const favourites = user.privateMetadata?.favourites || [];

        const updatedFavourites = favourites.filter(id => id !== movieId);

        await clerkClient.users.updateUserMetadata(userId, {
            privateMetadata: {
                ...user.privateMetadata,
                favourites: updatedFavourites
            }
        })

        return res.json({ success: true, message: "Movie removed from favorites" });

    } catch (error) {
        console.log(error.message);
        return res.json({ success: false, message: error.message })
    }
}