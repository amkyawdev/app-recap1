import React, { useState } from 'react'
import LoadingAnimation from '../components/LoadingAnimation'

const RenderPage = () => {
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)

  const startRender = () => {
    setIsRendering(true)
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsRendering(false)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  return (
    <div className="min-h-screen bg-black-custom p-8">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-3xl text-white mb-8 text-center">Render Video</h2>
        
        {/* Settings */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6 space-y-4">
          <select className="w-full bg-gray-custom text-white p-3 rounded">
            <option>1080p (Full HD)</option>
            <option>720p (HD)</option>
          </select>
          <select className="w-full bg-gray-custom text-white p-3 rounded">
            <option>MP4 (H.264)</option>
            <option>MOV</option>
          </select>
        </div>

        {/* Render Button & Progress */}
        {!isRendering ? (
          <button 
            onClick={startRender}
            className="w-full bg-red-custom py-3 rounded-lg hover:bg-gray-custom transition-all transform hover:scale-105 text-xl font-bold"
          >
            Start Rendering 🚀
          </button>
        ) : (
          <div className="space-y-4">
            <div className="w-full bg-gray-dark rounded-full h-4 overflow-hidden">
              <div 
                className="bg-red-custom h-full transition-all duration-300" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-gray-light text-xl">
              {progress}% - Rendering...
            </p>
            <LoadingAnimation type="bounce" />
          </div>
        )}
      </div>
    </div>
  )
}

export default RenderPage
