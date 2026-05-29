import React from 'react'
import { Link } from 'react-router-dom'

const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-dark py-4">
      <div className="flex justify-center space-x-8">
        <Link to="/dashboard" className="text-gray-light hover:text-red-custom transition">Dashboard</Link>
        <Link to="/editor" className="text-gray-light hover:text-red-custom transition">Editor</Link>
        <Link to="/subtitles" className="text-gray-light hover:text-red-custom transition">Subtitles</Link>
        <Link to="/render" className="text-gray-light hover:text-red-custom transition">Render</Link>
      </div>
    </footer>
  )
}

export default Footer
