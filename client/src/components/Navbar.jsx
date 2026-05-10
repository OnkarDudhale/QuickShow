import { NavLink, useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { MenuIcon, SearchIcon, TicketPlus, XIcon } from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import { useClerk, UserButton, useUser } from '@clerk/clerk-react'
import { useAppContext } from '../../context/AppContext'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user } = useUser()
  const { openSignIn } = useClerk()

  const navigate = useNavigate()

  const { favouriteMovies } = useAppContext()

  const menuRef = useRef()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <div className='fixed top-0 left-0 z-50 w-full flex items-center justify-between px-6 md:px-16 lg:px-24 py-5'>
      <NavLink to='/'>
        <img src={assets.logo} alt="" />
      </NavLink>
      <div ref={menuRef} className={`max-lg:absolute max-lg:top-0 max-lg:left-0 max-lg:font-medium max-lg:text-lg z-50 flex flex-col lg:flex-row items-center max-lg:justify-center gap-8 lg:px-8 py-3 max-lg:h-screen lg:rounded-full backdrop-blur bg-black/70 lg:bg-white/10 lg:border border-gray-300/20 overflow-hidden transition-[width] duration-300 ${isOpen ? 'max-lg:w-full' : 'max-lg:w-0'}`}>
        <XIcon className='lg:hidden absolute top-6 right-6 w-6 h-6 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
        <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Home</NavLink>
        <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/movies'>Movies</NavLink>
        <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/'>Theaters</NavLink>
        <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/upcoming'>Releases</NavLink>
        <div className='lg:hidden lg:rounded-full backdrop-blur bg-black/70 lg:bg-white/10 lg:border border-gray-300/20 overflow-hidden transition-[width] duration-300'>
          <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/admin'>admin</NavLink>
        </div>
        {favouriteMovies.length > 0 && <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/favourites'>Favourites</NavLink>}
      </div>
      <div className='max-lg:hidden px-5 py-3 lg:rounded-3xl backdrop-blur bg-black/70 lg:bg-white/10 lg:border border-gray-300/20 overflow-hidden transition-[width] duration-300'>
        <NavLink onClick={() => { scrollTo(0, 0); setIsOpen(false) }} to='/admin'>admin</NavLink>
      </div>
      <div className='flex items-center gap-8'>
        <SearchIcon className=' w-6 h-6 cursor-pointer' />
        {!user ? (<button onClick={openSignIn} className='px-4 py-1 sm:px-7 bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Login</button>) : (
          <UserButton>
            <UserButton.MenuItems>
              <UserButton.Action label='My Bookings' labelIcon={<TicketPlus width={15} />} onClick={() => navigate('/my-bookings')} />
            </UserButton.MenuItems>
          </UserButton>
        )}

      </div>
      <MenuIcon className='lg:hidden ml-4 w-8 h-8 cursor-pointer' onClick={() => setIsOpen(!isOpen)} />
    </div>
  )
}
export default Navbar