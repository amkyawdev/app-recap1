import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import LoadingAnimation from '../components/LoadingAnimation'

const RenderPage = () => {
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [renderStatus, setRenderStatus] = useState('Ready')
  const [videoFile, setVideoFile] = useState(null)
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)
  const [isLoadingFFmpeg, setIsLoadingFFmpeg] = useState(true)
  const ffmpegRef = useRef(null)
  const [resolution, setResolution] = useState('1080p')
  const [format, setFormat] = useState('mp4')
  const [quality, setQuality] = useState('high')
  const [fps, setFps] = useState(30)

  useEffect(() => {
    const loadFFmpeg = async () => {
      setRenderStatus('Loading FFmpeg...')
      setIsLoadingFFmpeg(true)
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      const ffmpeg = new FFmpeg()
      ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message))
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
        setRenderStatus('Error loading FFmpeg')
        setIsLoadingFFmpeg(false)
      }
    }
    loadFFmpeg()
  }, [])

  const resolutions = {
    '4k': { width: 3840, height: 2160, label: '4K' },
    '1080p': { width: 1920, height: 1080, label: '1080p' },
    '720p': { width: 1280, height: 720, label: '720p' },
    '480p': { width: 854, height: 480, label: '480p' },
    '360p': { width: 640, height: 360, label: '360p' }
  }

  const qualityPresets = {
    high: { crf: 18, preset: 'slow', label: 'High' },
    medium: { crf: 23, preset: 'medium', label: 'Medium' },
    low: { crf: 28, preset: 'fast', label: 'Low' }
  }

  const fpsOptions = [24, 30, 60]

  const handleVideoUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setRenderStatus(`Selected: ${file.name}`)
    }
  }

  const startRender = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setIsRendering(true)
    setProgress(0)
    setRenderStatus('Starting render...')
    try {
      const ffmpeg = ffmpegRef.current
      const res = resolutions[resolution]
      const qual = qualityPresets[quality]
      setProgress(5)
      setRenderStatus('Loading video...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      setProgress(15)
      setRenderStatus('Building render command...')
      const args = ['-i', 'input.mp4', '-vf', `scale=${res.width}:${res.height}`, '-r', fps.toString(), '-c:v', 'libx264', '-preset', qual.preset, '-crf', qual.crf.toString(), '-c:a', 'aac', '-b:a', '192k', 'output.mp4']
      setProgress(20)
      setRenderStatus('Rendering video...')
      await ffmpeg.exec(args, undefined, undefined, (p) => {
        setProgress(20 + Math.round(p * 70))
        setRenderStatus(`Rendering... ${20 + Math.round(p * 70)}%`)
      })
      setProgress(90)
      setRenderStatus('Finalizing...')
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = `movie-recap-${resolution}-${quality}.${format}`; a.click()
      setProgress(100)
      setRenderStatus('Render complete!')
      setTimeout(() => setIsRendering(false), 2000)
    } catch (error) {
      setRenderStatus('Render failed: ' + error.message)
      setIsRendering(false)
    }
  }

  return (
    <div className="min-h-100 bg-dark-custom">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-gray-dark sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-primary-custom">
            <i className="bi bi-gpu me-2"></i>Render Video
          </span>
          <span className={`badge ${isFFmpegLoaded ? 'bg-success' : isLoadingFFmpeg ? 'bg-warning' : 'bg-danger'}`}>
            {isFFmpegLoaded ? '✅ FFmpeg Ready' : isLoadingFFmpeg ? '⏳ Loading...' : '❌ Error'}
          </span>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Video Upload */}
            <div className="card mb-4">
              <div className="card-body">
                <label className="d-block border border-2 border-dashed rounded-3 p-5 text-center cursor-pointer">
                  <input type="file" accept="video/*" className="d-none" onChange={handleVideoUpload} disabled={isRendering} />
                  <i className="bi bi-folder2-open display-4 text-primary-custom mb-3 d-block"></i>
                  <p className="text-light-custom mb-0">{videoFile ? videoFile.name : 'Click to select video file'}</p>
                  {videoFile && <small className="text-muted">Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</small>}
                </label>
              </div>
            </div>

            {/* Render Settings */}
            <div className="card mb-4">
              <div className="card-header">
                <i className="bi bi-gear me-2"></i>Render Settings
              </div>
              <div className="card-body">
                {/* Resolution */}
                <div className="mb-4">
                  <label className="form-label text-light-custom">
                    <i className="bi bi-upcscan me-2"></i>Resolution
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(resolutions).map(([key, val]) => (
                      <button key={key} onClick={() => setResolution(key)} disabled={isRendering} className={`btn ${resolution === key ? 'btn-primary' : 'btn-secondary'}`}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Format */}
                <div className="mb-4">
                  <label className="form-label text-light-custom">
                    <i className="bi bi-file-earmark-code me-2"></i>Format
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {['mp4', 'webm', 'mov'].map(f => (
                      <button key={f} onClick={() => setFormat(f)} disabled={isRendering} className={`btn ${format === f ? 'btn-primary' : 'btn-secondary'}`}>
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div className="mb-4">
                  <label className="form-label text-light-custom">
                    <i className="bi bi-speedometer2 me-2"></i>Quality
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {Object.entries(qualityPresets).map(([key, val]) => (
                      <button key={key} onClick={() => setQuality(key)} disabled={isRendering} className={`btn ${quality === key ? 'btn-primary' : 'btn-secondary'}`}>
                        {val.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* FPS */}
                <div className="mb-0">
                  <label className="form-label text-light-custom">
                    <i className="bi bi-film me-2"></i>Frame Rate (FPS)
                  </label>
                  <div className="d-flex flex-wrap gap-2">
                    {fpsOptions.map(f => (
                      <button key={f} onClick={() => setFps(f)} disabled={isRendering} className={`btn ${fps === f ? 'btn-primary' : 'btn-secondary'}`}>
                        {f} FPS
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="card mb-4">
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-light-custom">Status</span>
                  <span className="text-white fw-bold">{renderStatus}</span>
                </div>
                {isRendering && (
                  <div className="mt-3">
                    <div className="progress">
                      <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
                    </div>
                    <LoadingAnimation type="wave" />
                  </div>
                )}
              </div>
            </div>

            {/* Render Summary */}
            <div className="card mb-4">
              <div className="card-body text-center">
                <p className="mb-0 text-light-custom">
                  <i className="bi bi-check-circle me-2 text-success"></i>
                  Output: <span className="text-white fw-bold">{resolution}</span> | 
                  Format: <span className="text-white fw-bold">{format.toUpperCase()}</span> | 
                  Quality: <span className="text-white fw-bold">{quality}</span> | 
                  FPS: <span className="text-white fw-bold">{fps}</span>
                </p>
              </div>
            </div>

            {/* Render Button */}
            <button onClick={startRender} disabled={isRendering || !videoFile || !isFFmpegLoaded} className="btn btn-primary btn-lg w-100 py-3">
              {isRendering ? (
                <><i className="bi bi-hourglass-split me-2"></i>Rendering... {progress}%</>
              ) : (
                <><i className="bi bi-rocket-takeoff me-2"></i>Start Rendering</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RenderPage
