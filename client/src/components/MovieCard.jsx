import { Dot, StarIcon, XIcon } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom"
import timeFormat from "../lib/timeFormat";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";

const MovieCard = ({ movie }) => {
    const { image_base_url, axios, getToken } = useAppContext()
    const navigate = useNavigate()

    const location = useLocation();
    const showSection = ['/upcoming', '/favourite'].includes(location.pathname)

    const handleRemove = async (movieId) => {
        try {
            const res = await axios.post('/api/user/removeFavourite', { headers: { Authorization: `Bearer ${await getToken()}` } }
                , { movieId });
            if (res.data.success) {
                toast.success(res.data.message);
            }
        } catch (error) {
            console.log(error.message);
            toast.error("Something went wrong")
        }
    }
    return (
        <div className='relative flex flex-col justify-between p-3 bg-gray-800 rounded-2xl hover:-translate-y-1 transition duration-300 w-62'>
            {showSection && <div className="w-7 absolute right-1 top-2"> <p className="bg-red-600 transition-all ease-in-out duration-300 rounded-full p-1 w-6 hover:scale-120 cursor-pointer flex justify-center items-center"><XIcon onClick={() => handleRemove(movie._id)} className=" h-4 w-4 text-white " /></p></div>}
            {!showSection && <img onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }} src={image_base_url + movie.poster_path} alt="" className="rounded-lg h-60 w-full object-cover object-top cursor-pointer" />}
            {showSection && <img src={image_base_url + movie.poster_path} alt="" className="rounded-lg h-60 w-full object-cover object-top cursor-pointer" />}

            <p className="font-semibold mt-2 truncate">{movie.title}</p>
            <p className="text-sm text-gray-400 mt-2 ">{movie.release_date}</p>



            <p>{movie.genres.slice(0, 2).map(genre => genre.name).join('|')} <Dot className="inline w-4 h-4" /> {timeFormat(movie.runtime)}</p>

            <div className="flex items-center justify-between mt-4 pb-3">
                {!showSection && <button onClick={() => { navigate(`/movies/${movie._id}`); scrollTo(0, 0) }} className="px-4 py-2 text-xs bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer">Buy Tickets</button>}
                <p className="flex items-center gap-1 text-sm text-gray-400 mt-1 pr-1">
                    <StarIcon className="w-4 h-4 text-primary fill-primary" />
                    {movie.vote_average.toFixed(1)}
                </p>
            </div>

        </div>
    )
}

export default MovieCard