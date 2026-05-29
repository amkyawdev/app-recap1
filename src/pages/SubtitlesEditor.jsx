import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const SubtitlesEditor = () => {
  const [subtitles, setSubtitles] = useState([
    { id: 1, start: 0, end: 3, text: "Welcome to the recap", style: 'default' },
    { id: 2, start: 3, end: 6, text: "This is an amazing scene", style: 'default' },
    { id: 3, start: 6, end: 9, text: "Let's begin our journey", style: 'highlight' },
  ])
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [currentSubId, setCurrentSubId] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('')
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const ffmpegRef = useRef(null)
  const videoRef = useRef(null)
  const nextId = useRef(4)

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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      setProcessingStatus('Loading video...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setVideoFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setIsUploading(false)
      setProcessingStatus('Video loaded')
    }
  }

  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime
    setCurrentTime(time)
    const activeSub = subtitles.find(sub => time >= sub.start && time < sub.end)
    setCurrentSubId(activeSub?.id || null)
  }

  const handleLoadedMetadata = (e) => setDuration(e.target.duration)
  const addSubtitle = () => {
    const newSub = { id: nextId.current++, start: Math.max(0, currentTime), end: Math.min(duration, currentTime + 3), text: "New subtitle text", style: 'default' }
    setSubtitles([...subtitles, newSub])
    setSelectedSubId(newSub.id)
    setProcessingStatus('Subtitle added')
  }
  const updateSubtitle = (id, field, value) => setSubtitles(subtitles.map(sub => sub.id === id ? { ...sub, [field]: value } : sub))
  const deleteSubtitle = (id) => { setSubtitles(subtitles.filter(sub => sub.id !== id)); if (selectedSubId === id) setSelectedSubId(null) }
  const moveSubtitle = (id, direction) => {
    const sorted = [...subtitles].sort((a, b) => a.start - b.start)
    const index = sorted.findIndex(s => s.id === id)
    if (direction === 'up' && index > 0) [sorted[index - 1], sorted[index]] = [sorted[index], sorted[index - 1]]
    else if (direction === 'down' && index < sorted.length - 1) [sorted[index], sorted[index + 1]] = [sorted[index + 1], sorted[index]]
    setSubtitles(sorted)
  }
  const setSubtitleTime = (id, timeType) => { updateSubtitle(id, timeType, timeType === 'start' ? Math.max(0, currentTime) : Math.min(duration, currentTime)) }
  const seekToSubtitle = (sub) => { if (videoRef.current) videoRef.current.currentTime = sub.start }
  const formatTime = (time) => { const mins = Math.floor(time / 60); const secs = Math.floor(time % 60); return `${mins}:${secs.toString().padStart(2, '0')}` }
  const formatSRTTime = (time) => { const hrs = Math.floor(time / 3600); const mins = Math.floor((time % 3600) / 60); const secs = Math.floor(time % 60); const ms = Math.floor((time % 1) * 1000); return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}` }

  const handleExportSRT = () => {
    const sorted = subtitles.sort((a, b) => a.start - b.start)
    const srtContent = sorted.map((sub, index) => `${index + 1}\n${formatSRTTime(sub.start)} --> ${formatSRTTime(sub.end)}\n${sub.text}\n`).join('\n')
    const blob = new Blob([srtContent], { type: 'text/srt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'subtitles.srt'; a.click()
    setProcessingStatus('SRT exported')
  }

  const handleImportSRT = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setIsProcessing(true)
    setProcessingStatus('Importing SRT...')
    try {
      const text = await file.text()
      const blocks = text.split(/\n\n+/)
      const parsed = blocks.map(block => {
        const lines = block.split('\n')
        if (lines.length >= 3) {
          const match = lines[1].match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
          if (match) return { id: nextId.current++, start: parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000, end: parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000, text: lines.slice(2).join('\n'), style: 'default' }
        }
        return null
      }).filter(Boolean)
      setSubtitles(parsed)
      setProcessingStatus(`Imported ${parsed.length} subtitles`)
    } catch (error) { setProcessingStatus('Import failed') }
    setIsProcessing(false)
  }

  const handleBurnSubtitles = async () => {
    if (!videoFile || !ffmpegRef.current) return
    setIsProcessing(true)
    setProcessingProgress(0)
    setProcessingStatus('Creating SRT file...')
    try {
      const ffmpeg = ffmpegRef.current
      const sorted = subtitles.sort((a, b) => a.start - b.start)
      const srtContent = sorted.map((sub, index) => `${index + 1}\n${formatSRTTime(sub.start)} --> ${formatSRTTime(sub.end)}\n${sub.text}\n`).join('\n')
      setProcessingProgress(10)
      await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile))
      await ffmpeg.writeFile('subtitles.srt', new TextEncoder().encode(srtContent))
      setProcessingProgress(20)
      setProcessingStatus('Rendering subtitles...')
      await ffmpeg.exec(['-i', 'video.mp4', '-vf', "subtitles=subtitles.srt:force_style='FontSize=24,PrimaryColour=&HFFFFFF,OutlineColour=&H000000,Outline=2'", '-c:a', 'copy', 'output.mp4'])
      setProcessingProgress(80)
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a'); a.href = url; a.download = 'video-with-subtitles.mp4'; a.click()
      setProcessingProgress(100)
      setProcessingStatus('Subtitles burned!')
    } catch (error) { setProcessingStatus('Burn failed') }
    setIsProcessing(false)
  }

  return (
    <div className="min-h-100 bg-dark-custom">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-gray-dark sticky-top">
        <div className="container-fluid">
          <span className="navbar-brand mb-0 h1 text-primary-custom">
            <i className="bi bi-type me-2"></i>Subtitles Editor
          </span>
          <span className={`badge ${ffmpegLoaded ? 'bg-success' : 'bg-warning'}`}>
            {ffmpegLoaded ? '✅ FFmpeg Ready' : '⏳ Loading...'}
          </span>
        </div>
      </nav>

      <div className="container py-4">
        <div className="row g-4">
          {/* Video Preview */}
          <div className="col-lg-6">
            <div className="card h-100">
              <div className="card-header">
                <i className="bi bi-camera-video me-2"></i>Video Preview
              </div>
              <div className="card-body">
                {!videoFile ? (
                  <label className="d-block border border-2 border-dashed rounded-3 p-5 text-center cursor-pointer">
                    <input type="file" accept="video/*" className="d-none" onChange={handleVideoUpload} />
                    <i className="bi bi-cloud-upload display-4 text-primary-custom mb-3 d-block"></i>
                    <p className="text-light-custom">Click to upload video</p>
                  </label>
                ) : (
                  <>
                    <div className="video-preview mb-3">
                      <video ref={videoRef} src={videoUrl} controls className="w-100 rounded-3" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <input type="file" accept=".srt" className="d-none" id="srt-import" onChange={handleImportSRT} />
                      <label htmlFor="srt-import" className="btn btn-secondary">
                        <i className="bi bi-upload me-2"></i>Import SRT
                      </label>
                      <button onClick={handleExportSRT} className="btn btn-secondary">
                        <i className="bi bi-download me-2"></i>Export SRT
                      </button>
                    </div>
                    <div className="bg-secondary rounded-3 p-4 text-center min-height-80">
                      <p className="text-white lead">{currentSubId ? subtitles.find(s => s.id === currentSubId)?.text : '...'}</p>
                    </div>
                    <button onClick={handleBurnSubtitles} disabled={isProcessing} className="btn btn-success w-100 mt-3">
                      <i className="bi bi-fire me-2"></i>Burn Subtitles to Video
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles List */}
          <div className="col-lg-6">
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-list-ul me-2"></i>Subtitles ({subtitles.length})</span>
                <button onClick={addSubtitle} className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-lg me-2"></i>Add
                </button>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <div className="d-flex flex-column gap-3">
                  {subtitles.sort((a, b) => a.start - b.start).map((sub, index) => (
                    <div key={sub.id} className={`subtitle-item ${selectedSubId === sub.id ? 'active' : ''} ${currentSubId === sub.id ? 'current' : ''}`} onClick={() => setSelectedSubId(sub.id)}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-secondary">#{index + 1}</span>
                        <div className="btn-group btn-group-sm">
                          <button onClick={(e) => { e.stopPropagation(); seekToSubtitle(sub) }} className="btn btn-secondary" title="Go to"><i className="bi bi-play"></i></button>
                          <button onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'start') }} className="btn btn-secondary" title="Set In">In</button>
                          <button onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'end') }} className="btn btn-secondary" title="Set Out">Out</button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between text-xs mb-2">
                        <span className="badge bg-dark">{formatTime(sub.start)}</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-dark">{formatTime(sub.end)}</span>
                        <span className="badge bg-dark">{(sub.end - sub.start).toFixed(1)}s</span>
                      </div>
                      {selectedSubId === sub.id ? (
                        <textarea value={sub.text} onChange={(e) => updateSubtitle(sub.id, 'text', e.target.value)} className="form-control mb-2" rows={2} onClick={(e) => e.stopPropagation()} />
                      ) : (
                        <p className="mb-2">{sub.text}</p>
                      )}
                      <div className="d-flex justify-content-between">
                        <div className="btn-group btn-group-sm">
                          <button onClick={(e) => { e.stopPropagation(); moveSubtitle(sub.id, 'up') }} className="btn btn-secondary"><i className="bi bi-arrow-up"></i></button>
                          <button onClick={(e) => { e.stopPropagation(); moveSubtitle(sub.id, 'down') }} className="btn btn-secondary"><i className="bi bi-arrow-down"></i></button>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); deleteSubtitle(sub.id) }} className="btn btn-danger btn-sm"><i className="bi bi-trash"></i></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="card mt-4">
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

        <div className="text-center text-light-custom mt-4">
          <p className="mb-0"><i className="bi bi-clock me-2"></i>Current: {formatTime(currentTime)} | Duration: {formatTime(duration)}</p>
        </div>
      </div>
    </div>
  )
}

export default SubtitlesEditor
