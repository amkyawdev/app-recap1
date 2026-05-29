import React from 'react'
import { Link } from 'react-router-dom'

const Navbar = () => {
  return (
    <nav className="bg-gray-dark py-4 px-6 flex justify-between items-center">
      <Link to="/" className="text-red-custom text-xl font-bold">MovieRecap Studio</Link>
      <div className="flex space-x-4">
        <Link to="/dashboard" className="text-gray-light hover:text-white">Dashboard</Link>
        <Link to="/editor" className="text-gray-light hover:text-white">Editor</Link>
      </div>
    </nav>
  )
}

export default Navbar
