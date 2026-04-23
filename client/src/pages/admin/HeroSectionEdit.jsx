import { useOutletContext } from "react-router-dom";
import Title from "../../components/admin/Title";
import Loading from "../../components/Loading";
import { useAppContext } from "../../../context/AppContext";
import { useEffect, useState } from "react";
import { CheckIcon } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const HeroSectionEdit = () => {

  const { image_base_url, setSelectedMovie, selectedMovie } = useAppContext()
  const [showMovies, setShowMovies] = useState([])

  const fetchPresentShow = async () => {
    try {
      const res = await axios.get('/api/show/movies');
      if (res.data.success) {
        setShowMovies(res.data.showMovies);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong");
    }
  }

  useEffect(() => {
    fetchPresentShow();
  }, [])

  return showMovies ? (
    <div>
      <Title text1='Update' text2='Hero-Section' />
      <p className="mt-10 text-lg font-medium">Now Playing Shows</p>
      <div className="overflow-x-auto pb-4">
        <div className="group flex gap-4 mt-4 w-max ">
          {showMovies.map((show) => (
            <div key={show._id} onClick={() => setSelectedMovie(show._id)} className='relative max-w-40 cursor-pointer group-hover:not-hover:opacity-40 hover:-translate-y-1 transition duration-300'>
              <div className="relative rounded-lg">
                <img src={image_base_url + show.poster_path} alt="" className="w-full object-cover brightness-90" />
              </div>
              {selectedMovie === show._id && (
                <div className="absolute top-2 right-2 flex items-center justify-center bg-primary h-6 w-6 rounded">
                  <CheckIcon className="w-4 h-4 text-white" strokeWidth={2.5} />
                </div>
              )}
              <p className="font-medium truncate">{show.title}</p>
              <p className="text-gray-400 text-sm">{show.release_date}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  ) : (
    <Loading />
  )
}

export default HeroSectionEdit