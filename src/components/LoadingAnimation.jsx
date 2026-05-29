import React from 'react'

const LoadingAnimation = ({ type = 'bounce' }) => {
  if (type === 'wave') {
    return (
      <div className="flex items-center justify-center space-x-1 h-8">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-red-custom rounded-full animate-wave"
            style={{ height: `${10 + i * 5}px`, animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex justify-center space-x-2">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="w-3 h-3 bg-red-custom rounded-full animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  )
}

export default LoadingAnimation
