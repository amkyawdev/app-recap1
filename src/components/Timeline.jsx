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
    <div className="card">
      <div className="card-body">
        <h5 className="text-primary-custom mb-3">
          <i className="bi bi-film me-2"></i>Timeline
        </h5>
        
        {/* Time Display */}
        <div className="d-flex justify-content-between text-light-custom small mb-2">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Timeline Track */}
        <div className="position-relative" style={{ height: '30px', background: '#374151', borderRadius: '15px', overflow: 'hidden' }}>
          {/* Trim Region */}
          <div 
            className="position-absolute h-100"
            style={{ left: `${trimStartPercent}%`, width: `${trimEndPercent - trimStartPercent}%`, background: 'rgba(220, 38, 38, 0.3)', borderLeft: '2px solid #DC2626' }}
          />
          
          {/* Progress Bar */}
          <div 
            className="position-absolute h-100"
            style={{ width: `${progress}%`, background: '#DC2626' }}
          />
          
          {/* Playhead */}
          <div 
            className="position-absolute h-100"
            style={{ left: `${progress}%`, width: '4px', background: 'white', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
          />
          
          {/* Input Range */}
          <input
            type="range"
            min="0"
            max={duration}
            value={currentTime}
            onChange={(e) => onSeek(parseFloat(e.target.value))}
            className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
          />
        </div>

        {/* Trim Markers */}
        <div className="d-flex justify-content-between text-xs text-light-custom mt-2">
          <span className="text-primary-custom">In: {formatTime(trimStart)}</span>
          <span>Duration: {formatTime(trimEnd - trimStart)}</span>
          <span className="text-primary-custom">Out: {formatTime(trimEnd)}</span>
        </div>

        {/* Playback Controls */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button onClick={() => onSeek(0)} className="btn btn-sm btn-secondary">
            <i className="bi bi-skip-backward"></i> Restart
          </button>
          <button onClick={() => onSeek(Math.max(0, currentTime - 5))} className="btn btn-sm btn-secondary">
            <i className="bi bi-arrow-left"></i> -5s
          </button>
          <button onClick={() => onSeek(Math.min(duration, currentTime + 5))} className="btn btn-sm btn-secondary">
            +5s <i className="bi bi-arrow-right"></i>
          </button>
          <button onClick={() => onSeek(duration)} className="btn btn-sm btn-secondary">
            End <i className="bi bi-skip-forward"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Timeline
