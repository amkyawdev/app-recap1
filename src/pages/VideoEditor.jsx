import React, { useState, useRef, useEffect, useCallback } from 'react'
import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg } from '../utils/ffmpegLoader'
import LoadingAnimation from '../components/LoadingAnimation'
import Timeline from '../components/Timeline'

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
  const [ffmpegError, setFfmpegError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  const ffmpegRef = useRef(null)
  const videoRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    const initFFmpeg = async () => {
      setProcessingStatus('Loading FFmpeg...')
      try {
        const ffmpeg = await loadFFmpeg()
        ffmpegRef.current = ffmpeg
        setFfmpegLoaded(true)
        setProcessingStatus('Ready - Upload a video to start')
        console.log('[VideoEditor] FFmpeg loaded successfully')
      } catch (error) {
        console.error('[VideoEditor] FFmpeg load failed:', error)
        setFfmpegError(error.message)
        setProcessingStatus('FFmpeg failed to load - Upload still works')
      }
    }
    initFFmpeg()
  }, [])

  const handleFileSelect = async (file) => {
    if (!file || !file.type.startsWith('video/')) {
      setProcessingStatus('Please select a valid video file')
      return
    }
    setIsUploading(true)
    setProcessingStatus('Loading video...')
    try {
      const url = URL.createObjectURL(file)
      setVideoFile(file)
      setVideoUrl(url)
      setTrimStart(0)
      setProcessingStatus('Video loaded - Ready for editing')
    } catch (error) {
      setProcessingStatus('Error loading video: ' + error.message)
    }
    setIsUploading(false)
  }

  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (file) handleFileSelect(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setDragOver(false)
  }, [])

  const handleClickUpload = () => {
    fileInputRef.current?.click()
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
    if (!videoFile || !ffmpegRef.current) {
      setProcessingStatus('FFmpeg not ready or no video selected')
      return
    }
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
      console.error('Trim error:', error)
      setProcessingStatus('Trim failed: ' + error.message)
    }
    setIsProcessing(false)
  }

  const handleExport = async () => {
    if (!videoFile || !ffmpegRef.current) {
      setProcessingStatus('FFmpeg not ready or no video selected')
      return
    }
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus('Exporting video...')
    try {
      const ffmpeg = ffmpegRef.current
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      setProcessingProgress(10)
      await ffmpeg.exec(['-i', 'input.mp4', '-vf', 'scale=1920:1080', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23', '-c:a', 'aac', '-b:a', '192k', 'export.mp4'])
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
      console.error('Export error:', error)
      setProcessingStatus('Export failed: ' + error.message)
    }
    setIsProcessing(false)
  }

  const tools = [
    { id: 'select', icon: 'bi-cursor', name: 'Select' },
    { id: 'trim', icon: 'bi-scissors', name: 'Trim' },
    { id: 'speed', icon: 'bi-speedometer2', name: 'Speed' },
    { id: 'volume', icon: 'bi-volume-up', name: 'Volume' },
    { id: 'export', icon: 'bi-download', name: 'Export' },
  ]

  return (
    <div className="min-vh-100 bg-dark-custom pt-5">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-white h2 mb-0">
            <i className="bi bi-film me-2 text-primary-custom"></i>Video Editor
          </h1>
          <span className={`badge ${ffmpegLoaded ? 'bg-success' : 'bg-warning'}`}>
            <i className={`bi ${ffmpegLoaded ? 'bi-check-circle' : 'bi-hourglass-split'} me-1`}></i>
            {ffmpegLoaded ? 'FFmpeg Ready' : 'Loading...'}
          </span>
        </div>

        {/* Status Alert */}
        <div className={`alert ${ffmpegError ? 'alert-warning' : processingStatus.includes('fail') || processingStatus.includes('error') || processingStatus.includes('failed') ? 'alert-danger' : 'alert-info'} mb-4`}>
          <i className="bi bi-info-circle-fill me-2"></i>{processingStatus}
        </div>

        {/* Tool Bar */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <div className="d-flex flex-wrap gap-2">
              {tools.map(tool => (
                <button key={tool.id} onClick={() => setActiveTool(tool.id)} className={`btn ${activeTool === tool.id ? 'btn-primary' : 'btn-outline-secondary'}`}>
                  <i className={`bi ${tool.icon} me-2`}></i>{tool.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Video Upload Area */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body p-0">
            <input type="file" ref={fileInputRef} accept="video/*" className="d-none" onChange={handleUpload} />
            {!videoFile ? (
              <div 
                className={`upload-area p-5 text-center border border-2 border-dashed rounded-3 m-3 cursor-pointer transition ${dragOver ? 'border-primary bg-primary bg-opacity-10' : 'border-secondary'}`}
                onClick={handleClickUpload}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                {isUploading ? (
                  <>
                    <LoadingAnimation type="wave" />
                    <p className="text-muted mt-3">Loading video...</p>
                  </>
                ) : (
                  <>
                    <i className="bi bi-cloud-upload display-2 text-primary-custom mb-3"></i>
                    <h5 className="text-white">Upload Video</h5>
                    <p className="text-muted mb-2">Click or drag & drop video file</p>
                    <p className="text-muted small">Supported: MP4, MOV, WebM, AVI</p>
                  </>
                )}
              </div>
            ) : (
              <div className="p-3">
                {/* Video Player */}
                <div className="video-preview bg-black rounded-3 overflow-hidden mb-3">
                  <video ref={videoRef} src={videoUrl} controls className="w-100" onLoadedMetadata={handleLoadedMetadata} onTimeUpdate={handleTimeUpdate} onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
                </div>

                {/* File Info */}
                <div className="d-flex justify-content-between text-muted small mb-3">
                  <span><i className="bi bi-file-earmark-video me-2"></i>{videoFile.name}</span>
                  <span>{(videoFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                </div>

                {/* Playback Controls */}
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-3">
                  <button onClick={() => handleSeek(0)} className="btn btn-secondary btn-sm"><i className="bi bi-skip-backward"></i></button>
                  <button onClick={() => handleSeek(currentTime - 5)} className="btn btn-secondary btn-sm"><i className="bi bi-arrow-left"></i> 5s</button>
                  {isPlaying ? (
                    <button onClick={handlePause} className="btn btn-primary"><i className="bi bi-pause-fill"></i></button>
                  ) : (
                    <button onClick={handlePlay} className="btn btn-secondary"><i className="bi bi-play-fill"></i></button>
                  )}
                  <button onClick={() => handleSeek(currentTime + 5)} className="btn btn-secondary btn-sm">5s <i className="bi bi-arrow-right"></i></button>
                  <button onClick={() => handleSeek(duration)} className="btn btn-secondary btn-sm"><i className="bi bi-skip-forward"></i></button>
                </div>

                {/* Volume & Speed */}
                <div className="d-flex flex-wrap justify-content-center gap-4 mb-3">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-volume-up text-muted"></i>
                    <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="w-50" />
                    <span className="text-muted small">{Math.round(volume * 100)}%</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="text-muted small">Speed:</span>
                    {[0.5, 1, 1.5, 2].map(rate => (
                      <button key={rate} onClick={() => handleSpeedChange(rate)} className={`btn btn-sm ${playbackSpeed === rate ? 'btn-primary' : 'btn-outline-secondary'}`}>{rate}x</button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tool Options Panel */}
        {videoFile && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              {activeTool === 'trim' && (
                <>
                  <h5 className="text-primary-custom mb-3"><i className="bi bi-scissors me-2"></i>Trim Settings</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label text-muted">Start (sec)</label>
                      <input type="number" value={trimStart} onChange={(e) => setTrimStart(Math.max(0, parseFloat(e.target.value) || 0))} min="0" max={duration} className="form-control bg-dark text-white border-secondary" />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label text-muted">End (sec)</label>
                      <input type="number" value={trimEnd} onChange={(e) => setTrimEnd(Math.min(duration, parseFloat(e.target.value) || 0))} min="0" max={duration} className="form-control bg-dark text-white border-secondary" />
                    </div>
                  </div>
                  <button onClick={handleTrimVideo} disabled={isProcessing || !ffmpegLoaded} className="btn btn-primary mt-3"><i className="bi bi-scissors me-2"></i>{isProcessing ? 'Processing...' : 'Trim Video'}</button>
                </>
              )}
              {activeTool === 'speed' && (
                <>
                  <h5 className="text-primary-custom mb-3"><i className="bi bi-speedometer2 me-2"></i>Speed Settings</h5>
                  <div className="d-flex flex-wrap gap-2">
                    {[0.25, 0.5, 0.75, 1, 1.5, 2, 4].map(rate => (
                      <button key={rate} onClick={() => { setPlaybackSpeed(rate); if (videoRef.current) videoRef.current.playbackRate = rate }} className={`btn ${playbackSpeed === rate ? 'btn-primary' : 'btn-outline-secondary'}`}>{rate}x</button>
                    ))}
                  </div>
                </>
              )}
              {activeTool === 'volume' && (
                <>
                  <h5 className="text-primary-custom mb-3"><i className="bi bi-volume-up me-2"></i>Volume Settings</h5>
                  <input type="range" min="0" max="2" step="0.1" value={volume} onChange={handleVolumeChange} className="w-100" />
                  <p className="text-center text-muted mt-2">{Math.round(volume * 100)}%</p>
                </>
              )}
              {activeTool === 'export' && (
                <>
                  <h5 className="text-primary-custom mb-3"><i className="bi bi-download me-2"></i>Export Settings</h5>
                  <p className="text-muted">Export trimmed video at 1080p resolution</p>
                  <button onClick={handleExport} disabled={isProcessing || !ffmpegLoaded} className="btn btn-success"><i className="bi bi-download me-2"></i>{isProcessing ? 'Exporting...' : 'Export Video'}</button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Processing Status */}
        {isProcessing && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">{processingStatus}</span>
                <span className="text-white">{processingProgress}%</span>
              </div>
              <div className="progress">
                <div className="progress-bar bg-primary" style={{ width: `${processingProgress}%` }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline */}
        {videoFile && <Timeline currentTime={currentTime} duration={duration} onSeek={handleSeek} trimStart={trimStart} trimEnd={trimEnd} />}
      </div>
    </div>
  )
}

export default VideoEditor
