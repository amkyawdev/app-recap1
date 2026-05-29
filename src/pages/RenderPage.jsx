import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import LoadingAnimation from '../components/LoadingAnimation'

const RenderPage = () => {
  // State
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [renderStatus, setRenderStatus] = useState('Ready')
  
  // Video state
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  
  // Settings state
  const [resolution, setResolution] = useState('1080p')
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('high')
  const [fps, setFps] = useState(30)
  
  // FFmpeg state
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(true)
  const ffmpegRef = useRef(null)

  // Initialize FFmpeg on mount
  useEffect(() => {
    const loadFFmpeg = async () => {
      setRenderStatus('Loading FFmpeg...')
      setIsLoadingFFmpeg(true)
      
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      const ffmpeg = new FFmpeg()
      
      ffmpeg.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })
      
      ffmpeg.on('progress', ({ progress: p }) => {
        console.log('[Progress]', Math.round(p * 100), '%')
      })
      
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        ffmpegRef.current = ffmpeg
        setIsFFmpegLoaded(true)
        setIsLoadingFFmpeg(false)
        setRenderStatus('Ready - Select a video to render')
      } catch (error) {
        console.error('FFmpeg load error:', error)
        setRenderStatus('Error loading FFmpeg')
        setIsLoadingFFmpeg(false)
      }
    }
    
    loadFFmpeg()
  }, [])

  // Resolution options
  const resolutions = {
    '4k': { width: 3840, height: 2160, label: '4K (3840x2160)' },
    '1080p': { width: 1920, height: 1080, label: '1080p (1920x1080)' },
    '720p': { width: 1280, height: 720, label: '720p (1280x720)' },
    '480p': { width: 854, height: 480, label: '480p (854x480)' },
    '360p': { width: 640, height: 360, label: '360p (640x360)' }
  }

  // Quality presets
  const qualityPresets = {
    high: { crf: 18, preset: 'slow', bitrate: '5000k', label: 'High Quality (slow)' },
    medium: { crf: 23, preset: 'medium', bitrate: '2500k', label: 'Medium Quality' },
    low: { crf: 28, preset: 'fast', bitrate: '1000k', label: 'Low Quality (fast)' }
  }

  // FPS options
  const fpsOptions = [24, 30, 60]

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setRenderStatus(`Selected: ${file.name} (${(file.size / (1024 * 1024)).toFixed(2)} MB)`)
    }
  }

  // Main render function
  const startRender = async () => {
    if (!videoFile || !ffmpegRef.current) {
      setRenderStatus('Please select a video file')
      return
    }

    setIsRendering(true)
    setProgress(0)
    setRenderStatus('Starting render...')

    try {
      const ffmpeg = ffmpegRef.current
      const res = resolutions[resolution]
      const qual = qualityPresets[quality]

      // Step 1: Write input file
      setProgress(5)
      setRenderStatus('Loading video...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))

      // Step 2: Build FFmpeg command
      setProgress(15)
      setRenderStatus('Building render command...')
      
      const args = [
        '-i', 'input.mp4',
        '-vf', `scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease,pad=${res.width}:${res.height}:(ow-iw)/2:(oh-ih)/2`,
        '-r', fps.toString(),
        '-c:v', 'libx264',
        '-preset', qual.preset,
        '-crf', qual.crf.toString(),
        '-b:v', qual.bitrate,
        '-c:a', 'aac',
        '-b:a', '192k',
        '-movflags', '+faststart'
      ]

      if (format === 'webm') {
        args.splice(4, 1, '-vf', `scale=${res.width}:${res.height}:force_original_aspect_ratio=decrease`)
        args[3] = '-c:v'
        args[4] = 'libvpx-vp9'
        args[5] = '-b:v'
        args[6] = qual.bitrate
        args.push('-f', 'webm')
      }

      args.push('output.mp4')

      // Step 3: Execute render
      setProgress(20)
      setRenderStatus('Rendering video...')
      
      await ffmpeg.exec(args, undefined, undefined, (p) => {
        const rendered = 20 + Math.round(p * 70)
        setProgress(Math.min(rendered, 90))
        setRenderStatus(`Rendering... ${Math.min(rendered, 90)}%`)
      })

      // Step 4: Read output
      setProgress(90)
      setRenderStatus('Finalizing...')
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })

      // Step 5: Download
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-recap-${resolution}-${quality}.${format}`
      a.click()

      setProgress(100)
      setRenderStatus('Render complete! File downloaded.')

      setTimeout(() => {
        setIsRendering(false)
      }, 2000)

    } catch (error) {
      console.error('Render error:', error)
      setRenderStatus('Render failed: ' + error.message)
      setIsRendering(false)
    }
  }

  // Render with subtitles
  const renderWithSubtitles = async (srtContent) => {
    if (!videoFile || !ffmpegRef.current) return

    setIsRendering(true)
    setProgress(0)
    setRenderStatus('Starting render with subtitles...')

    try {
      const ffmpeg = ffmpegRef.current
      const res = resolutions[resolution]
      const qual = qualityPresets[quality]

      // Write files
      setProgress(5)
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      await ffmpeg.writeFile('subtitles.srt', new TextEncoder().encode(srtContent))

      setProgress(15)
      setRenderStatus('Rendering with subtitles...')

      await ffmpeg.exec([
        '-i', 'input.mp4',
        '-vf', `scale=${res.width}:${res.height},subtitles=subtitles.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'`,
        '-c:v', 'libx264',
        '-preset', qual.preset,
        '-crf', qual.crf.toString(),
        '-c:a', 'aac',
        '-b:a', '192k',
        'output.mp4'
      ], undefined, undefined, (p) => {
        setProgress(15 + Math.round(p * 75))
      })

      setProgress(90)
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-recap-subtitled.${format}`
      a.click()

      setProgress(100)
      setRenderStatus('Render with subtitles complete!')

      setTimeout(() => setIsRendering(false), 2000)

    } catch (error) {
      console.error('Render error:', error)
      setRenderStatus('Render failed')
      setIsRendering(false)
    }
  }

  return (
    <div className="min-h-screen bg-black-custom p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl text-white mb-8 text-center">🎬 Render Video</h2>

        {/* FFmpeg Status */}
        <div className="text-center mb-6">
          {isFFmpegLoaded ? (
            <span className="text-green-400 text-lg">✅ FFmpeg Ready</span>
          ) : isLoadingFFmpeg ? (
            <span className="text-yellow-400 text-lg">⏳ Loading FFmpeg...</span>
          ) : (
            <span className="text-red-400 text-lg">❌ FFmpeg Failed to Load</span>
          )}
        </div>

        {/* Video Upload */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6">
          <label className="block border-2 border-dashed border-gray-custom rounded-lg p-8 text-center cursor-pointer hover:border-red-custom transition">
            <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} disabled={isRendering} />
            <div className="text-4xl mb-2">📁</div>
            <p className="text-gray-light">
              {videoFile ? videoFile.name : 'Click to select video file'}
            </p>
            {videoFile && (
              <p className="text-gray-light text-sm mt-1">
                Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            )}
          </label>
        </div>

        {/* Render Settings */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6 space-y-4">
          <h3 className="text-red-custom text-lg">⚙️ Render Settings</h3>

          {/* Resolution */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Resolution</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {Object.entries(resolutions).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setResolution(key)}
                  disabled={isRendering}
                  className={`p-2 rounded text-sm ${resolution === key ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
                >
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Format</label>
            <div className="flex space-x-2">
              {['mp4', 'webm', 'mov'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  disabled={isRendering}
                  className={`flex-1 p-3 rounded capitalize ${format === f ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Quality */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Quality (Encoding Speed)</label>
            <div className="flex space-x-2">
              {Object.entries(qualityPresets).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => setQuality(key)}
                  disabled={isRendering}
                  className={`flex-1 p-3 rounded capitalize ${quality === key ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
                >
                  {val.label.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          {/* FPS */}
          <div>
            <label className="text-gray-light text-sm block mb-2">Frame Rate (FPS)</label>
            <div className="flex space-x-2">
              {fpsOptions.map(f => (
                <button
                  key={f}
                  onClick={() => setFps(f)}
                  disabled={isRendering}
                  className={`flex-1 p-3 rounded ${fps === f ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
                >
                  {f} FPS
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-gray-dark rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-gray-light">Status</span>
            <span className="text-white font-medium">{renderStatus}</span>
          </div>

          {isRendering && (
            <div className="space-y-3">
              <div className="w-full bg-gray-custom rounded-full h-4 overflow-hidden">
                <div
                  className="bg-red-custom h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-light">{progress}%</span>
                <span className="text-gray-light">Estimated time: ~{Math.max(1, Math.round((100 - progress) / 5))}s</span>
              </div>
              <LoadingAnimation type="wave" />
            </div>
          )}
        </div>

        {/* Render Summary */}
        <div className="bg-gray-dark rounded-lg p-4 mb-6 text-center">
          <p className="text-gray-light">
            Output: <span className="text-white">{resolution}</span> | 
            Format: <span className="text-white">{format.toUpperCase()}</span> | 
            Quality: <span className="text-white">{quality}</span> | 
            FPS: <span className="text-white">{fps}</span>
          </p>
        </div>

        {/* Render Button */}
        <button
          onClick={startRender}
          disabled={isRendering || !videoFile || !isFFmpegLoaded}
          className="w-full bg-red-custom py-4 rounded-lg hover:bg-gray-custom transition-all transform hover:scale-105 text-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isRendering ? (
            <span>Rendering... {progress}%</span>
          ) : (
            <span>🚀 Start Rendering</span>
          )}
        </button>
      </div>
    </div>
  )
}

export default RenderPage
