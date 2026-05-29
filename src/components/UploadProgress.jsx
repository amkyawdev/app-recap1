import React from 'react'

const UploadProgress = () => {
  return (
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-red-custom border-t-transparent">
      </div>
      <p className="text-gray-light mt-4">Uploading video...</p>
    </div>
  )
}

export default UploadProgress
