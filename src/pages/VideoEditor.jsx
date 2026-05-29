import React, { useState } from 'react'
import UploadProgress from '../components/UploadProgress'
import Timeline from '../components/Timeline'

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        setVideoFile(file)
        setIsUploading(false)
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-black-custom p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl text-white mb-6">Video Editor</h2>
        
        {/* Video Preview Area */}
        <div className="bg-gray-dark rounded-lg p-4 mb-6">
          {!videoFile ? (
            <label className="block border-2 border-dashed border-gray-custom rounded-lg p-12 text-center cursor-pointer hover:border-red-custom transition">
              <input type="file" accept="video/*" className="hidden" onChange={handleUpload} />
              {isUploading ? (
                <UploadProgress />
              ) : (
                <>
                  <div className="text-4xl mb-2">📹</div>
                  <p className="text-gray-light">Click to upload video</p>
                </>
              )}
            </label>
          ) : (
            <div>
              <video controls className="w-full rounded-lg" src={URL.createObjectURL(videoFile)} />
              <p className="text-gray-light mt-2 text-center">{videoFile.name}</p>
            </div>
          )}
        </div>

        {/* Timeline Controls */}
        <Timeline />
      </div>
    </div>
  )
}

export default VideoEditor
