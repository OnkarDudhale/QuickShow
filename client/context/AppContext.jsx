import { useContext, useEffect, useState } from "react";
import { createContext } from "react";
import axios from 'axios';
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ children }) => {
    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
   
    const [favouriteMovies, setFavouriteMovies] = useState([])

    const image_base_url = import.meta.env.VITE_TMDB_IMAGE_BASE_URL;

    const { user } = useUser()
    const { getToken } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const [selectedMovie, setSelectedMovie] = useState(() => {
        return localStorage.getItem("selectedMovie") || null;
    });

    const [movie, setMovie] = useState(() => {
        return localStorage.getItem("movie") || null;
    })

    const fetchMovie = async () => {
        if (!selectedMovie) return;
        try {
            const res = await axios.get(`/api/show/poster/${selectedMovie}`);

            if (res.data.success) {
                setMovie(res.data.movie);
            }

        } catch (error) {
            console.log(error.message);
            toast.error("Something went wrong");
        }
    }



    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/is-admin', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('You are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all')
            if (data.success) {
                setShows(data.shows)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const fetchFavouriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favourites', {
                headers: { Authorization: `Bearer ${await getToken()}` }
            })

            if (data.success) {
                setFavouriteMovies(data.movies)
            }

        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchShows()
    }, [])

    useEffect(() => {
        if (user) {
            fetchIsAdmin()
            fetchFavouriteMovies()
        }
    }, [user])

    useEffect(() => {
        if (selectedMovie) {
            localStorage.setItem("selectedMovie", selectedMovie);
            fetchMovie()
        } else {
            localStorage.removeItem("selectedMovie");
        }
    }, [selectedMovie])

    const value = { axios, selectedMovie, fetchShows, fetchMovie, setSelectedMovie, movie, fetchIsAdmin, user, getToken, navigate, isAdmin, shows, favouriteMovies, fetchFavouriteMovies, image_base_url }
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)