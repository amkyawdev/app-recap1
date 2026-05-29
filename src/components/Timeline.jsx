import React, { useState } from 'react'

const Timeline = () => {
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(120)

  return (
    <div className="bg-gray-dark rounded-lg p-4">
      <h3 className="text-red-custom mb-4">Timeline</h3>
      <div className="flex items-center space-x-4">
        <span className="text-gray-light text-sm">{Math.floor(currentTime)}s</span>
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          className="flex-1 h-2 bg-gray-custom rounded-lg appearance-none cursor-pointer accent-red-custom"
        />
        <span className="text-gray-light text-sm">{Math.floor(duration)}s</span>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">⏮</button>
        <button className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">▶</button>
        <button className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">⏭</button>
      </div>
    </div>
  )
}

export default Timeline
