import React, { useState } from 'react'

const SubtitlesEditor = () => {
  const [subtitles, setSubtitles] = useState([
    { id: 1, start: 0, end: 3, text: "Welcome to the recap" },
    { id: 2, start: 3, end: 6, text: "This is an amazing scene" }
  ])

  return (
    <div className="min-h-screen bg-black-custom p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Video Preview */}
        <div className="bg-gray-dark rounded-lg p-4">
          <h3 className="text-red-custom mb-4 text-xl">Video Preview</h3>
          <div className="bg-gray-custom rounded-lg aspect-video flex items-center justify-center">
            <p className="text-gray-light">Video will appear here</p>
          </div>
        </div>

        {/* Subtitle List */}
        <div className="bg-gray-dark rounded-lg p-4">
          <h3 className="text-red-custom mb-4 text-xl">Subtitles Timeline</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {subtitles.map(sub => (
              <div key={sub.id} className="bg-gray-custom p-3 rounded cursor-move hover:bg-red-custom transition">
                <div className="flex justify-between text-sm text-gray-light">
                  <span>{sub.start}s</span>
                  <span>→</span>
                  <span>{sub.end}s</span>
                </div>
                <p className="text-white mt-1">{sub.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubtitlesEditor
