import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import LoadingAnimation from '../components/LoadingAnimation'
import Footer from '../components/Footer'

const Dashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [history] = useState([
    { id: 1, name: "Avengers Recap", date: "2024-01-15", status: "completed" },
    { id: 2, name: "Inception Edit", date: "2024-01-14", status: "processing" }
  ])

  return (
    <div className="min-h-screen bg-black-custom">
      {/* Hamburger Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-custom rounded-md hover:bg-red-custom transition-all duration-300 flex items-center justify-center"
      >
        <span className="text-xl">☰</span>
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu with Glassmorphism */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-black-custom bg-opacity-70 backdrop-blur-lg transform transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-red-custom text-xl font-bold">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-light hover:text-white">✕</button>
          </div>
          <nav className="space-y-2">
            <Link to="/dashboard" className="block text-gray-light hover:text-red-custom py-2">Dashboard</Link>
            <Link to="/editor" className="block text-gray-light hover:text-red-custom py-2">Video Editor</Link>
            <Link to="/subtitles" className="block text-gray-light hover:text-red-custom py-2">Subtitles</Link>
            <Link to="/render" className="block text-gray-light hover:text-red-custom py-2">Render</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 pt-20">
        <h2 className="text-2xl text-white mb-6">Your Projects</h2>
        <div className="space-y-4">
          {history.map(item => (
            <div key={item.id} className="bg-gray-dark p-4 rounded-lg hover:bg-gray-custom transition cursor-pointer">
              <div className="flex justify-between items-center">
                <span className="text-white">{item.name}</span>
                <span className="text-gray-light">{item.date}</span>
                {item.status === 'processing' && <LoadingAnimation type="wave" />}
                {item.status === 'completed' && <span className="text-green-400">✓</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard
