import axios from 'axios'
import Movie from '../models/Movie.js'
import Show from '../models/Show.js'

//API to get now playing movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        const response = await axios.get('https://api.themoviedb.org/3/movie/now_playing', {
            headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
            params: {
                language: 'en-US',
                region: 'IN',
                page: 1
            }
        })
        const movies = response.data.results;
        res.json({ success: true, movies: movies })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })
    }
}


//API to add a new show to the database
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice, url } = req.body;
        let movie = await Movie.findById(movieId)

        if (!movie) {
            //fetch movie details and credits from TMDB
            const [movieDetailsResponse, movieCreditsResponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`,
                    {
                        headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                    }
                ),
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` }
                })
            ])

            const movieApiData = movieDetailsResponse.data;
            const movieCreditsdata = movieCreditsResponse.data;

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                genres: movieApiData.genres,
                casts: movieCreditsdata.cast,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
                trailer: url
            }
            //add movie to database
            movie = await Movie.create(movieDetails);
        }
        const showsToCreate = [];
        showsInput.forEach(show => {
            const showDate = show.date;
            const time = show.time;
            console.log(time);
            time.forEach((time) => {
                showsToCreate.push({
                    movie: movieId,
                    showDateTime: new Date(`${showDate} ${time}`),
                    showPrice,
                    occupiedSeats: {}
                })
            })
        });
        if (showsToCreate.length > 0) {
            await Show.insertMany(showsToCreate);
        }
        res.json({ success: true, message: 'Show Added Successfully.' })


    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message })

    }
}

//API to get all shows from the database
export const getShows = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        if (!shows || shows.length === 0) {
            return res.json({ success: false, message: "Shows not found" });
        }

        //filter unique shows
        const uniqueShows = Array.from(
            new Map(shows.map(s => [s.movie._id.toString(), s.movie])).values());

        res.json({ success: true, shows: uniqueShows })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;

        //get all upcoming shows for the movie
        const shows = await Show.find({ movie: movieId, showDateTime: { $gte: new Date() } })

        if (!shows || shows.length === 0) {
            return res.json({ success: false, message: "Shows not found" });
        }

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];
            if (!dateTime[date]) {
                dateTime[date] = []
            }
            dateTime[date].push({ time: show.showDateTime, showId: show._id })
        })
        res.json({ success: true, movie, dateTime })
    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}


//API to show poster on hero section
export const showPoster = async (req, res) => {
    try {
        const { movieId } = req.params;

        const show = await Show.findOne({ movie: movieId, showDateTime: { $gte: new Date() } });

        if (!show) {
            return res.json({ success: false, message: "Show not found" });
        }

        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.json({ success: false, message: "Movie not found" });
        }

        res.json({ success: true, movie, message: "Hero section updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

//API to get single show
export const getSingleShow = async (req, res) => {
    try {
        const shows = await Show.find({ showDateTime: { $gte: new Date() } }).populate('movie').sort({ showDateTime: 1 });

        if (!shows) {
            return res.json({ success: false, message: "Shows Not Found" });
        }
        const uniqueMovies = Array.from(
            new Map(
                shows.map(show => [show.movie._id.toString(), show.movie])
            ).values()
        );
        res.json({ success: true, showMovies: uniqueMovies })

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: error.message });
    }
}

//Api to get All Upcoming movies
export const upcomingShows = async (req, res) => {
    try {
        const shows = await axios.get('https://api.themoviedb.org/3/movie/upcoming',
            {
                headers: { Authorization: `Bearer ${process.env.TMDB_API_KEY}` },
                params: {
                    language: 'en-US',
                    region: 'IN',
                    page: 1
                }
            }
        )
        res.json({ success: true, shows: shows.data.results })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}