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
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [volume, setVolume] = useState(1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTool, setActiveTool] = useState('select')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(() => {
    const initFFmpeg = async () => {
      setProcessingStatus('Loading FFmpeg...')
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      const ffmpeg = new FFmpeg()
      ffmpeg.on('log', ({ message }) => console.log('[FFmpeg]', message))
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        ffmpegRef.current = ffmpeg
        setFfmpegLoaded(true)
        setProcessingStatus('Ready')
      } catch (error) {
        setProcessingStatus('FFmpeg load failed')
      }
    }
    initFFmpeg()
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      setProcessingStatus('Loading video...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setIsUploading(false)
      setTrimStart(0)
      setProcessingStatus('Video loaded')
    }
  }

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration)
    setTrimEnd(e.target.duration)
  }

  const handleTimeUpdate = (e) => setCurrentTime(e.target.currentTime)

  const handlePlay = () => { videoRef.current?.play(); setIsPlaying(true) }
  const handlePause = () => { videoRef.current?.pause(); setIsPlaying(false) }
  const handleSeek = (time) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(time, duration))
      setCurrentTime(videoRef.current.currentTime)
    }
  }
  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value)
    setVolume(val)
    if (videoRef.current) videoRef.current.volume = val
  }
  const handleSpeedChange = (speed) => {
    setPlaybackSpeed(speed)
    if (videoRef.current) videoRef.current.playbackRate = speed
  }

  const handleTrimVideo = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus('Trimming video...')
    try {
      const ffmpeg = ffmpegRef.current
      setProcessingProgress(10)
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      setProcessingProgress(30)
      await ffmpeg.exec(['-i', 'input.mp4', '-ss', trimStart.toString(), '-to', trimEnd.toString(), '-c', 'copy', 'output.mp4'])
      setProcessingProgress(80)
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setVideoUrl(url)
      setVideoFile(new File([blob], 'trimmed-video.mp4', { type: 'video/mp4' }))
      setDuration(trimEnd - trimStart)
      setCurrentTime(0)
      setTrimEnd(trimEnd - trimStart)
      setTrimStart(0)
      setProcessingProgress(100)
      setProcessingStatus('Trim complete!')
    } catch (error) {
      setProcessingStatus('Trim failed')
    }
    setIsProcessing(false)
  }

  const handleExport = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus('Exporting video...')
    try {
      const ffmpeg = ffmpegRef.current
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      setProcessingProgress(10)
      await ffmpeg.exec(['-i', 'input.mp4', '-ss', trimStart.toString(), '-to', trimEnd.toString(), '-vf', 'scale=1920:1080', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '192k', 'export.mp4'])
      setProcessingProgress(80)
      const data = await ffmpeg.readFile('export.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'movie-recap-export.mp4'
      a.click()
      setProcessingProgress(100)
      setProcessingStatus('Export complete!')
    } catch (error) {
      setProcessingStatus('Export failed')
    }
    setIsProcessing(false)
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const tools = [
    { id: 'select', icon: 'bi-cursor', name: 'Select' },
    { id: 'trim', icon: 'bi-scissors', name: 'Trim' },
    { id: 'speed', icon: 'bi-speedometer2', name: 'Speed' },
    { id: 'volume', icon: 'bi-volume-up', name: 'Volume' },
    { id: 'export', icon: 'bi-download', name: 'Export' },
  ]

  return (
    <div className="min-h-100 bg-dark-custom">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-gray-dark sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-primary-custom">
            <i className="bi bi-film me-2"></i>Video Editor
          </span>
          <div className="d-flex align-items-center gap-2">
            <span className={`badge ${ffmpegLoaded ? 'bg-success' : 'bg-warning'}`}>
              <i className={`bi ${ffmpegLoaded ? 'bi-check-circle' : 'bi-hourglass-split'} me-1`}></i>
              {ffmpegLoaded ? 'FFmpeg Ready' : 'Loading...'}
            </span>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Tool Bar */}
        <ToolBar tools={tools} activeTool={activeTool} onSelectTool={setActiveTool} />

        {/* Video Upload Area */}
        <div className="card mb-4">
          {!videoFile ? (
            <label className="card-body text-center py-5 border border-2 border-dashed rounded-3 cursor-pointer hover-border-primary transition">
              <input type="file" accept="video/*" className="d-none" onChange={handleUpload} />
              {isUploading ? (
                <UploadProgress />
              ) : (
                <>
                  <i className="bi bi-cloud-upload display-4 text-primary-custom mb-3"></i>
                  <h5 className="text-light-custom">Click to upload video</h5>
                  <p className="text-muted small">or drag and drop MP4, MOV, WebM</p>
                </>
              )}
            </label>
          ) : (
            <div className="card-body">
              {/* Video Player */}
              <div className="video-preview mb-3">
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-100 rounded-3"
                  onLoadedMetadata={handleLoadedMetadata}
                  onTimeUpdate={handleTimeUpdate}
                />
              </div>

              {/* File Info */}
              <div className="d-flex justify-content-between text-light-custom small mb-3">
                <span><i className="bi bi-file-earmark-video me-2"></i>{videoFile.name}</span>
                <span>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>

              {/* Playback Controls */}
              <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                <button onClick={() => handleSeek(0)} className="btn btn-secondary">
                  <i className="bi bi-skip-backward"></i>
                </button>
                <button onClick={() => handleSeek(currentTime - 5)} className="btn btn-secondary">
                  <i className="bi bi-arrow-left"></i> 5s
                </button>
                {isPlaying ? (
                  <button onClick={handlePause} className="btn btn-primary">
                    <i className="bi bi-pause-fill"></i>
                  </button>
                ) : (
                  <button onClick={handlePlay} className="btn btn-secondary">
                    <i className="bi bi-play-fill"></i>
                  </button>
                )}
                <button onClick={() => handleSeek(currentTime + 5)} className="btn btn-secondary">
                  5s <i className="bi bi-arrow-right"></i>
                </button>
                <button onClick={() => handleSeek(duration)} className="btn btn-secondary">
                  <i className="bi bi-skip-forward"></i>
                </button>
              </div>

              {/* Volume Control */}
              <div className="d-flex align-items-center justify-content-center gap-3 mb-3">
                <i className="bi bi-volume-up text-light-custom"></i>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-25" />
                <span className="text-light-custom small w-25">{Math.round(volume * 100)}%</span>
              </div>

              {/* Speed Control */}
              <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                <span className="text-light-custom small">Speed:</span>
                {[0.5, 1, 1.5, 2].map(rate => (
                  <button
                    key={rate}
                    onClick={() => handleSpeedChange(rate)}
                    className={`btn btn-sm ${playbackSpeed === rate ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Tool Options Panel */}
        {videoFile && (
          <div className="card mb-4">
            <div className="card-body">
              {activeTool === 'trim' && (
                <>
                  <h5 className="text-primary-custom mb-3">
                    <i className="bi bi-scissors me-2"></i>Trim Settings
                  </h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-light-custom small">Start (sec)</label>
                      <input type="number" value={trimStart} onChange={(e) => setTrimStart(Math.max(0, parseFloat(e.target.value) || 0))} min="0" max={duration} className="form-control" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-light-custom small">End (sec)</label>
                      <input type="number" value={trimEnd} onChange={(e) => setTrimEnd(Math.min(duration, parseFloat(e.target.value) || 0))} min="0" max={duration} className="form-control" />
                    </div>
                  </div>
                  <button onClick={handleTrimVideo} disabled={isProcessing} className="btn btn-primary mt-3">
                    <i className="bi bi-scissors me-2"></i>{isProcessing ? 'Processing...' : 'Trim Video'}
                  </button>
                </>
              )}

              {activeTool === 'speed' && (
                <>
                  <h5 className="text-primary-custom mb-3">
                    <i className="bi bi-speedometer2 me-2"></i>Speed Settings
                  </h5>
                  <div className="d-flex flex-wrap gap-2 mb-3">
                    {[0.25, 0.5, 0.75, 1, 1.5, 2, 4].map(rate => (
                      <button
                        key={rate}
                        onClick={() => { setPlaybackSpeed(rate); if (videoRef.current) videoRef.current.playbackRate = rate }}
                        className={`btn ${playbackSpeed === rate ? 'btn-primary' : 'btn-secondary'}`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </>
              )}

              {activeTool === 'volume' && (
                <>
                  <h5 className="text-primary-custom mb-3">
                    <i className="bi bi-volume-up me-2"></i>Volume Settings
                  </h5>
                  <input type="range" min="0" max="2" step="0.1" value={volume} onChange={handleVolumeChange} className="w-100" />
                  <p className="text-center text-light-custom mt-2">{Math.round(volume * 100)}%</p>
                </>
              )}

              {activeTool === 'export' && (
                <>
                  <h5 className="text-primary-custom mb-3">
                    <i className="bi bi-download me-2"></i>Export Settings
                  </h5>
                  <p className="text-light-custom">Export trimmed video at 1080p</p>
                  <button onClick={handleExport} disabled={isProcessing} className="btn btn-success">
                    <i className="bi bi-download me-2"></i>{isProcessing ? 'Exporting...' : 'Export Video'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-light-custom">{processingStatus}</span>
                <span className="text-white">{processingProgress}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${processingProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {videoFile && (
          <Timeline currentTime={currentTime} duration={duration} onSeek={handleSeek} trimStart={trimStart} trimEnd={trimEnd} />
        )}
      </div>
    </div>
  )
}

export default VideoEditor
