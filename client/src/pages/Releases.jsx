import MovieCard from '../components/MovieCard.jsx'
import BlurCircle from '../components/BlurCircle.jsx'
import { useAppContext } from '../../context/AppContext.jsx'
import { useState, useEffect } from 'react'

const Releases = () => {
    const [upcomingShows, setUpcomingShows] = useState([]);

    const { axios } = useAppContext()

    const fetchUpcomingMovies = async () => {
        try {
            const { data } = await axios.get('/api/show/upcoming');
            if (data.success) {
                setUpcomingShows(data.shows);
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchUpcomingMovies()
    }, [])


    return upcomingShows.length > 0 ? (
        <div className='relative mt-25 mb-60 md:px-16 lg:px-24 overflow-hidden min-h=[80vh]'>
            <BlurCircle top='150px' left='0px' />
            <BlurCircle bottom='50px' right='50px' />
            <h1 className='text-lg font-medium my-4 mx-4'>Upcoming Movies</h1>
            <div className='flex flex-wrap max-sm:justify-center gap-6 '>
                {upcomingShows.map((show) => (
                    <MovieCard movie={show} key={show.id} />
                ))}
            </div>
        </div>
    ) : (
        <div className='flex flex-col items-center justify-center h-screen'>
            <h1 className='text-3xl font-bold text-center'>No movies available</h1>
        </div>
    )
}

export default Releases;