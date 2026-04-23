import { useNavigate } from 'react-router-dom'
import { ArrowRight, Calendar, Clock, ChevronRight, ChevronLeft } from 'lucide-react'
import { useAppContext } from '../../context/AppContext'
import { useEffect, useState } from 'react'
import timeFormat from '../lib/timeFormat'

const HeroSection = () => {
    const navigate = useNavigate()
    const { image_base_url, shows } = useAppContext()

    const [index, setIndex] = useState(0)

    useEffect(() => {
        if (!shows) return
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % shows.length)
        }, 4000)

        return () => clearInterval(interval)
    }, [shows])

    return (
        shows && (
            <div className="relative overflow-hidden">

                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                        transform: `translateX(-${index * 100}vw)`
                    }}
                >
                    {shows.map((show) => (
                        <div
                            key={show._id}
                            className="w-screen shrink-0 h-screen flex flex-col justify-center px-6 md:px-16 lg:px-24 bg-cover bg-center"
                            style={{
                                backgroundImage: `url(${image_base_url + show.backdrop_path})`
                            }}
                        >
                            <h1 className="text-5xl md:text-[70px] font-semibold max-w-xl">
                                {show.title}
                            </h1>

                            <div className="flex flex-col  gap-4 text-gray-300 mt-4">
                                <div className="flex flex-row max-sm:flex-col items-center gap-3">
                                    <div className="genre">
                                        | {show.genres?.map((genre) => (
                                            <span key={genre.id}>{genre.name} | </span>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4" />
                                        {show.release_date}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {timeFormat(show.runtime)}
                                    </div>

                                </div>
                                <div className="overview md:w-3xl mb-5">
                                    {show.overview}
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/movies')}
                                className="absolute justify-between  bottom-10 flex items-center w-40 px-3 py-3  bg-primary rounded-full"
                            >
                                Explore Movies
                                <ArrowRight />
                            </button>
                        </div>
                    ))}
                </div>

                <button
                    onClick={() =>
                        setIndex((prev) => (prev - 1 + shows.length) % shows.length)
                    }
                    className="absolute cursor-pointer left-5 top-1/2 -translate-y-1/2 bg-transparent "
                >
                    <ChevronLeft />
                </button>

                <button
                    onClick={() =>
                        setIndex((prev) => (prev + 1) % shows.length)
                    }
                    className="absolute cursor-pointer right-5 top-1/2 -translate-y-1/2 bg-transparent "
                >
                    <ChevronRight />
                </button>
            </div >
        )
    )
}

export default HeroSection