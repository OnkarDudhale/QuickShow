import MovieCard from '../components/MovieCard.jsx'
import BlurCircle from '../components/BlurCircle.jsx'
import { useAppContext } from '../../context/AppContext.jsx'

const Favourite = () => {
  const { favouriteMovies } = useAppContext()
  return favouriteMovies.length > 0 ? (
    <div className='relative pt-30  mb-60 md:px-16 lg:px-24 overflow-hidden min-h=[80vh]'>
      <BlurCircle top='150px' left='0px' />
      <BlurCircle bottom='50px' right='50px' />
      <h1 className='text-lg font-medium mx-4 my-4'>Your Favourite Movies</h1>
      <div className='flex flex-wrap max-sm:justify-center gap-7'>
        {favouriteMovies.map((movie) => (
          <MovieCard movie={movie} key={movie._id} />
        ))}
      </div>
    </div>
  ) : (
    <div className='flex flex-col items-center justify-center h-screen'>
      <h1 className='text-3xl font-bold text-center'>No movies available</h1>
    </div>
  )
}

export default Favourite