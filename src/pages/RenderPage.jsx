import React, { useState } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import LoadingAnimation from '../components/LoadingAnimation'

const RenderPage = () => {
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [renderStatus, setRenderStatus] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [resolution, setResolution] = useState('1080p')
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('high')
  const [ffmpeg] = useState(new FFmpeg())
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)

  React.useEffect(() => {
    const loadFFmpeg = async () => {
      setRenderStatus('Loading FFmpeg...')
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        setIsFFmpegLoaded(true)
        setRenderStatus('Ready to render')
      } catch (error) {
        setRenderStatus('Error loading FFmpeg')
      }
    }
    loadFFmpeg()
  }, [ffmpeg])

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setRenderStatus(`Selected: ${file.name}`)
    }
  }

  const getResolutionSettings = () => {
    switch (resolution) {
      case '4k': return '3840:2160'
      case '1080p': return '1920:1080'
      case '720p': return '1280:720'
      case '480p': return '854:480'
      default: return '1920:1080'
    }
  }

  const getQualitySettings = () => {
    switch (quality) {
      case 'high': return { crf: 18, preset: 'slow' }
      case 'medium': return { crf: 23, preset: 'medium' }
      case 'low': return { crf: 28, preset: 'fast' }
      default: return { crf: 18, preset: 'slow' }
    }
  }

  const startRender = async () => {
    if (!videoFile) {
      setRenderStatus('Please select a video file')
      return
    }

    setIsRendering(true)
    setProgress(0)
    setRenderStatus('Starting render...')

    try {
      // Write input file
      setProgress(10)
      setRenderStatus('Loading video...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

      // Process video
      setProgress(30)
      setRenderStatus('Processing video...')
      const { crf, preset } = getQualitySettings()
      const scale = getResolutionSettings()

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `scale=${scale}`,
        '-c:v', 'libx264',
        '-preset', preset,
        '-crf', crf.toString(),
        '-c:a', 'aac',
        '-b:a', '192k',
        'output.mp4'
      ])

      // Read output
      setProgress(80)
      setRenderStatus('Finalizing...')
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)

      // Download
      setProgress(95)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-recap-${resolution}-${quality}.mp4`
      a.click()

      setProgress(100)
      setRenderStatus('Render complete!')
      setTimeout(() => {
        setIsRendering(false)
        setRenderStatus('Ready')
      }, 2000)

    } catch (error) {
      console.error('Render error:', error)
      setRenderStatus('Error during render')
      setIsRendering(false)
    }
  }

  return (
    <div className="min-h-screen bg-black-custom p-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl text-white mb-8 text-center">🎬 Render Video</h2>
        
        {/* Video Upload */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6">
          <label className="block border-2 border-dashed border-gray-custom rounded-lg p-8 text-center cursor-pointer hover:border-red-custom transition">
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-light">
              {videoFile ? videoFile.name : 'Click to select video file'}
            </p>
          </label>
        </div>

        {/* Settings */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6 space-y-4">
          <h3 className="text-red-custom text-lg">⚙️ Render Settings</h3>
          
          {/* Resolution */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Resolution</label>
            <select 
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              className="w-full bg-gray-custom text-white p-3 rounded"
            >
              <option value="4k">4K (3840x2160)</option>
              <option value="1080p">1080p (1920x1080)</option>
              <option value="720p">720p (1280x720)</option>
              <option value="480p">480p (854x480)</option>
            </select>
          </div>

          {/* Format */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Format</label>
            <select 
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full bg-gray-custom text-white p-3 rounded"
            >
              <option value="mp4">MP4 (H.264)</option>
              <option value="webm">WebM (VP9)</option>
              <option value="mov">MOV</option>
            </select>
          </div>

          {/* Quality */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Quality</label>
            <div className="flex space-x-2">
              {['high', 'medium', 'low'].map(q => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`flex-1 p-3 rounded capitalize ${
                    quality === q ? 'bg-red-custom' : 'bg-gray-custom'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Render Status */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-light">Status</span>
            <span className="text-white">{renderStatus}</span>
          </div>
          
          {/* Progress Bar */}
          {isRendering && (
            <div className="space-y-2">
              <div className="w-full bg-gray-custom rounded-full h-3 overflow-hidden">
                <div 
                  className="bg-red-custom h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-center text-gray-light">{progress}%</p>
              <LoadingAnimation type="wave" />
            </div>
          )}
        </div>

        {/* FFmpeg Status */}
        <div className="text-center text-gray-light text-sm mb-6">
          {isFFmpegLoaded ? (
            <span className="text-green-400">✅ FFmpeg Ready</span>
          ) : (
            <span className="text-yellow-400">⏳ Loading FFmpeg...</span>
          )}
        </div>

        {/* Render Button */}
        <button 
          onClick={startRender}
          disabled={isRendering || !videoFile || !isFFmpegLoaded}
          className="w-full bg-red-custom py-4 rounded-lg hover:bg-gray-custom transition-all transform hover:scale-105 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isRendering ? 'Rendering...' : '🚀 Start Rendering'}
        </button>
      </div>
    </div>
  )
}

export default RenderPage
