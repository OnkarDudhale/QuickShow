import express from 'express'
import { getFavourites, getUserBookings, removeFavourite, updateFavourite } from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.get('/bookings', getUserBookings);
userRouter.post('/update-favourite', updateFavourite)
userRouter.get('/favourites', getFavourites)
userRouter.post('/removeFavourite', removeFavourite)

export default userRouter
