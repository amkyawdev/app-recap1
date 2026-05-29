import React from 'react'

const Timeline = ({ currentTime, duration, onSeek, trimStart = 0, trimEnd = 0 }) => {
  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const trimStartPercent = duration > 0 ? (trimStart / duration) * 100 : 0
  const trimEndPercent = duration > 0 ? (trimEnd / duration) * 100 : 100

  return (
    <div className="bg-gray-dark rounded-lg p-4">
      <h3 className="text-red-custom mb-4">🎬 Timeline</h3>
      
      {/* Time Display */}
      <div className="flex justify-between text-gray-light text-sm mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>

      {/* Timeline Track */}
      <div className="relative h-8 bg-gray-custom rounded-full overflow-hidden">
        {/* Trim Region */}
        <div 
          className="absolute top-0 h-full bg-red-custom/30 border-l-2 border-red-custom"
          style={{ left: `${trimStartPercent}%`, width: `${trimEndPercent - trimStartPercent}%` }}
        />
        
        {/* Progress Bar */}
        <div 
          className="absolute top-0 h-full bg-red-custom/50"
          style={{ width: `${progress}%` }}
        />
        
        {/* Playhead */}
        <div 
          className="absolute top-0 h-full w-1 bg-white shadow-lg"
          style={{ left: `${progress}%` }}
        />
        
        {/* Input Range */}
        <input
          type="range"
          min="0"
          max={duration}
          value={currentTime}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>

      {/* Trim Markers */}
      <div className="flex justify-between text-xs text-gray-light mt-2">
        <span className="text-red-custom">Trim Start: {formatTime(trimStart)}</span>
        <span className="text-gray-light">Duration: {formatTime(trimEnd - trimStart)}</span>
        <span className="text-red-custom">Trim End: {formatTime(trimEnd)}</span>
      </div>

      {/* Playback Controls */}
      <div className="mt-4 flex justify-center space-x-4">
        <button 
          onClick={() => onSeek(0)} 
          className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition"
        >
          ⏮ Restart
        </button>
        <button 
          onClick={() => onSeek(Math.max(0, currentTime - 5))} 
          className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition"
        >
          ⏪ -5s
        </button>
        <button 
          onClick={() => onSeek(Math.min(duration, currentTime + 5))} 
          className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition"
        >
          +5s ⏩
        </button>
        <button 
          onClick={() => onSeek(duration)} 
          className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition"
        >
          End ⏭
        </button>
      </div>

      {/* Keyframe Markers (placeholder) */}
      <div className="mt-4 border-t border-gray-custom pt-4">
        <p className="text-gray-light text-xs">Keyframes & Markers</p>
        <div className="flex space-x-2 mt-2">
          <button className="bg-gray-custom px-2 py-1 rounded text-xs hover:bg-red-custom">📍 Add Marker</button>
          <button className="bg-gray-custom px-2 py-1 rounded text-xs hover:bg-red-custom">🖼️ Add Thumbnail</button>
        </div>
      </div>
    </div>
  )
}

export default Timeline
