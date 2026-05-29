import React from 'react'
import { useNavigate } from 'react-router-dom'

const GetStarted = () => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-black-custom flex items-center justify-center">
      <div className="text-center animate-fadeIn">
        <h1 
          className="text-6xl font-bold text-red-custom transition-all duration-700 hover:scale-110"
        >
          MovieRecap Studio
        </h1>
        <p className="text-gray-light mt-4">Create stunning recaps with AI</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-8 bg-red-custom px-8 py-3 rounded-lg hover:bg-gray-custom transition-all"
        >
          Get Started →
        </button>
      </div>
    </div>
  )
}

export default GetStarted
