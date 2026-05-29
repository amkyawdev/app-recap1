import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import UploadProgress from '../components/UploadProgress'
import Timeline from '../components/Timeline'
import ToolBar from '../components/ToolBar'

const VideoEditor = () => {
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [trimStart, setTrimStart] = useState(0)
  const [trimEnd, setTrimEnd] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [activeTool, setActiveTool] = useState('select')
  const [ffmpeg] = useState(new FFmpeg())
  const videoRef = useRef(null)

  useEffect(() => {
    const loadFFmpeg = async () => {
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
    }
    loadFFmpeg()
  }, [ffmpeg])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        setVideoFile(file)
        setVideoUrl(URL.createObjectURL(file))
        setIsUploading(false)
        setTrimEnd(0)
      }, 1500)
    }
  }

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration)
    setTrimEnd(e.target.duration)
  }

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime)
  }

  const handlePlay = () => {
    videoRef.current?.play()
    setIsPlaying(true)
  }

  const handlePause = () => {
    videoRef.current?.pause()
    setIsPlaying(false)
  }

  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) {
      videoRef.current.volume = val
    }
  }

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate)
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
    }
  }

  const handleTrimVideo = async () => {
    if (!videoFile) return
    setIsProcessing(true)
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', trimStart.toString(),
        '-to', trimEnd.toString(),
        '-c', 'copy',
        'output.mp4'
      ])
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setVideoFile(new File([blob], 'trimmed.mp4', { type: 'video/mp4' }))
    } catch (error) {
      console.error('Trim error:', error)
    }
    setIsProcessing(false)
  }

  const handleExport = async () => {
    if (!videoFile) return
    setIsProcessing(true)
    try {
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-ss', trimStart.toString(),
        '-to', trimEnd.toString(),
        '-vf', 'scale=1920:1080',
        '-c:v', 'libx264',
        '-c:a', 'aac',
        'export.mp4'
      ])
      const data = await ffmpeg.readFile('export.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'movie-recap-export.mp4'
      a.click()
    } catch (error) {
      console.error('Export error:', error)
    }
    setIsProcessing(false)
  }

  const tools = [
    { id: 'select', icon: '👆', name: 'Select' },
    { id: 'trim', icon: '✂️', name: 'Trim' },
    { id: 'speed', icon: '⏱️', name: 'Speed' },
    { id: 'crop', icon: '📐', name: 'Crop' },
    { id: 'volume', icon: '🔊', name: 'Volume' },
    { id: 'export', icon: '💾', name: 'Export' },
  ]

  return (
    <div className="min-h-screen bg-black-custom p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl text-white mb-6">🎬 Video Editor</h2>
        
        {/* Tool Bar */}
        <ToolBar tools={tools} activeTool={activeTool} onSelectTool={setActiveTool} />

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
                  <p className="text-gray-light text-sm mt-2">or drag and drop</p>
                </>
              )}
            </label>
          ) : (
            <div>
              <video 
                ref={videoRef}
                src={videoUrl} 
                controls 
                className="w-full rounded-lg"
                onLoadedMetadata={handleLoadedMetadata}
                onTimeUpdate={handleTimeUpdate}
              />
              <p className="text-gray-light mt-2 text-center">{videoFile.name}</p>
              
              {/* Playback Controls */}
              <div className="mt-4 flex items-center justify-center space-x-4">
                <button onClick={() => handleSeek(0)} className="bg-gray-custom p-2 rounded hover:bg-red-custom">⏮</button>
                {isPlaying ? (
                  <button onClick={handlePause} className="bg-red-custom p-2 rounded hover:bg-gray-custom">⏸</button>
                ) : (
                  <button onClick={handlePlay} className="bg-gray-custom p-2 rounded hover:bg-red-custom">▶</button>
                )}
                <button onClick={() => handleSeek(duration)} className="bg-gray-custom p-2 rounded hover:bg-red-custom">⏭</button>
              </div>

              {/* Volume Control */}
              <div className="mt-4 flex items-center space-x-2">
                <span className="text-gray-light">🔊</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-32"
                />
                <span className="text-gray-light text-sm">{Math.round(volume * 100)}%</span>
              </div>

              {/* Playback Speed */}
              <div className="mt-2 flex items-center space-x-2">
                <span className="text-gray-light text-sm">Speed:</span>
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button 
                    key={rate}
                    onClick={() => handlePlaybackRateChange(rate)}
                    className={`px-2 py-1 rounded text-sm ${playbackRate === rate ? 'bg-red-custom' : 'bg-gray-custom'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trim Controls */}
        {videoFile && (
          <div className="bg-gray-dark rounded-lg p-4 mb-6">
            <h3 className="text-red-custom mb-4">✂️ Trim Video</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-gray-light text-sm">Start Time (sec)</label>
                <input 
                  type="number" 
                  value={trimStart} 
                  onChange={(e) => setTrimStart(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={duration}
                  className="w-full bg-gray-custom text-white p-2 rounded mt-1"
                />
              </div>
              <div>
                <label className="text-gray-light text-sm">End Time (sec)</label>
                <input 
                  type="number" 
                  value={trimEnd} 
                  onChange={(e) => setTrimEnd(parseFloat(e.target.value) || 0)}
                  min="0"
                  max={duration}
                  className="w-full bg-gray-custom text-white p-2 rounded mt-1"
                />
              </div>
            </div>
            <button 
              onClick={handleTrimVideo}
              disabled={isProcessing}
              className="mt-4 bg-red-custom px-6 py-2 rounded hover:bg-gray-custom disabled:opacity-50"
            >
              {isProcessing ? 'Processing...' : 'Trim Video'}
            </button>
          </div>
        )}

        {/* Timeline */}
        {videoFile && (
          <Timeline 
            currentTime={currentTime} 
            duration={duration} 
            onSeek={handleSeek}
            trimStart={trimStart}
            trimEnd={trimEnd}
          />
        )}

        {/* Export Button */}
        {videoFile && (
          <div className="mt-6 text-center">
            <button 
              onClick={handleExport}
              disabled={isProcessing}
              className="bg-green-600 px-8 py-3 rounded-lg hover:bg-green-700 text-white font-bold disabled:opacity-50"
            >
              {isProcessing ? 'Exporting...' : '💾 Export Video'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoEditor
