import express from 'express'
import { addShow, getNowPlayingMovies, getShow, getShows, getSingleShow, showPoster, upcomingShows } from '../controllers/showController.js';
import { protectAdmin } from '../middleware/auth.js';

const showRouter = express.Router();

showRouter.get('/now-playing', protectAdmin, getNowPlayingMovies)
showRouter.post('/add', protectAdmin, addShow)
showRouter.get('/all', getShows)
showRouter.get('/movies', getSingleShow);
showRouter.get('/upcoming', upcomingShows);

showRouter.get('/:movieId', getShow)
showRouter.get('/poster/:movieId', showPoster);

export default showRouter