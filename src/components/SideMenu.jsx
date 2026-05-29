import React from 'react'
import { Link } from 'react-router-dom'

const SideMenu = ({ isOpen, onClose }) => {
  return (
    <div className={`fixed top-0 left-0 h-full w-64 bg-black-custom bg-opacity-70 backdrop-blur-lg transform transition-transform duration-300 z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-red-custom text-xl font-bold">Menu</h2>
          <button onClick={onClose} className="text-gray-light hover:text-white">✕</button>
        </div>
        <nav className="space-y-2">
          <Link to="/dashboard" className="block text-gray-light hover:text-red-custom py-2">Dashboard</Link>
          <Link to="/editor" className="block text-gray-light hover:text-red-custom py-2">Video Editor</Link>
          <Link to="/subtitles" className="block text-gray-light hover:text-red-custom py-2">Subtitles</Link>
          <Link to="/render" className="block text-gray-light hover:text-red-custom py-2">Render</Link>
        </nav>
      </div>
    </div>
  )
}

export default SideMenu
