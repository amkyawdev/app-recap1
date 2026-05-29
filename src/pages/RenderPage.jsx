import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflow } from '../context/WorkflowContext'
import { fetchFile } from '@ffmpeg/util'
import { loadFFmpeg } from '../utils/ffmpegLoader'
import LoadingAnimation from '../components/LoadingAnimation'

const RenderPage = () => {
  const navigate = useNavigate()
  const { workflow, updateRenderSettings, resetWorkflow } = useWorkflow()
  
  const [isRendering, setIsRendering] = useState(false)
  const [progress, setProgress] = useState(0)
  const [renderStatus, setRenderStatus] = useState('Ready')
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false)
  const ffmpegRef = useRef(null)
  
  const [resolution, setResolution] = useState(workflow.renderSettings?.resolution || '1080p')
  const [format, setFormat] = useState(workflow.renderSettings?.format || 'mp4')
  const [quality, setQuality] = useState(workflow.renderSettings?.quality || 'high')
  const [fps, setFps] = useState(workflow.renderSettings?.fps || 30)

  useEffect(() => {
    const initFFmpeg = async () => {
      setRenderStatus('Loading FFmpeg...')
      try {
        const ffmpeg = await loadFFmpeg()
        ffmpegRef.current = ffmpeg
        setIsFFmpegLoaded(true)
        setRenderStatus('Ready - Preview and Export')
      } catch (error) {
        console.error('[Render] FFmpeg failed:', error)
        setRenderStatus('Basic mode - Web export available')
      }
    }
    initFFmpeg()
  }, [])

  const resolutions = {
    '4k': { width: 3840, height: 2160 },
    '1080p': { width: 1920, height: 1080 },
    '720p': { width: 1280, height: 720 },
    '480p': { width: 854, height: 480 },
  }

  const qualityPresets = {
    high: { crf: 18, preset: 'slow' },
    medium: { crf: 23, preset: 'medium' },
    low: { crf: 28, preset: 'fast' }
  }

  const handleStartRender = async () => {
    const videoFile = workflow.videoFile
    const subtitles = workflow.subtitles || []
    
    if (!videoFile) {
      setRenderStatus('No video file - Go back to editor')
      return
    }

    updateRenderSettings({ resolution, format, quality, fps })

    if (!ffmpegRef.current) {
      // Web export fallback
      setIsRendering(true)
      setProgress(0)
      setRenderStatus('Preparing export...')
      
      try {
        setProgress(50)
        const url = URL.createObjectURL(videoFile)
        const a = document.createElement('a')
        a.href = url
        a.download = `movie-recap-${resolution}.${format}`
        a.click()
        setProgress(100)
        setRenderStatus('Video exported (original quality)')
      } catch (error) {
        setRenderStatus('Export failed')
      }
      setIsRendering(false)
      return
    }

    setIsRendering(true)
    setProgress(0)
    setRenderStatus('Starting render...')

    try {
      const ffmpeg = ffmpegRef.current
      const res = resolutions[resolution]
      const qual = qualityPresets[quality]

      // Create SRT file
      const sorted = [...subtitles].sort((a, b) => a.start - b.start)
      const srtContent = sorted.map((sub, i) => {
        const formatSRT = (t) => {
          const h = Math.floor(t / 3600)
          const m = Math.floor((t % 3600) / 60)
          const s = Math.floor(t % 60)
          const ms = Math.floor((t % 1) * 1000)
          return `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')},${ms.toString().padStart(3,'0')}`
        }
        return `${i + 1}\n${formatSRT(sub.start)} --> ${formatSRT(sub.end)}\n${sub.text}`
      }).join('\n\n')

      setProgress(5)
      setRenderStatus('Loading video...')
      await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile))
      
      if (srtContent) {
        await ffmpeg.writeFile('subtitles.srt', new TextEncoder().encode(srtContent))
      }

      setProgress(15)
      setRenderStatus('Processing...')

      let args
      if (srtContent && subtitles.length > 0) {
        args = [
          '-i', 'input.mp4',
          '-vf', `scale=${res.width}:${res.height},subtitles=subtitles.srt`,
          '-r', fps.toString(),
          '-c:v', 'libx264',
          '-preset', qual.preset,
          '-crf', qual.crf.toString(),
          '-c:a', 'aac',
          '-b:a', '192k',
          'output.mp4'
        ]
      } else {
        args = [
          '-i', 'input.mp4',
          '-vf', `scale=${res.width}:${res.height}`,
          '-r', fps.toString(),
          '-c:v', 'libx264',
          '-preset', qual.preset,
          '-crf', qual.crf.toString(),
          '-c:a', 'aac',
          '-b:a', '192k',
          'output.mp4'
        ]
      }

      setProgress(20)
      await ffmpeg.exec(args, undefined, undefined, (p) => {
        setProgress(20 + Math.round(p * 70))
        setRenderStatus(`Rendering... ${20 + Math.round(p * 70)}%`)
      })

      setProgress(90)
      setRenderStatus('Finalizing...')
      const data = await ffmpeg.readFile('output.mp4')
      const blob = new Blob([data], { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `movie-recap-${resolution}-${quality}.${format}`
      a.click()

      setProgress(100)
      setRenderStatus('Render complete!')
      
      setTimeout(() => setIsRendering(false), 2000)
    } catch (error) {
      console.error('[Render] Error:', error)
      setRenderStatus('Render failed: ' + error.message)
      setIsRendering(false)
    }
  }

  const handleBack = () => {
    updateRenderSettings({ resolution, format, quality, fps })
    navigate('/subtitles')
  }

  const handleNewProject = () => {
    resetWorkflow()
    navigate('/editor')
  }

  return (
    <div className="min-vh-100 bg-dark-custom pt-5">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="text-white h2 mb-0">
              <i className="bi bi-gpu me-2 text-primary-custom"></i>Render Video
            </h1>
            <p className="text-muted small mb-0">Step 3 of 3 - Preview and Export</p>
          </div>
          <span className={`badge ${isFFmpegLoaded ? 'bg-success' : 'bg-secondary'}`}>
            <i className={`bi ${isFFmpegLoaded ? 'bi-check-circle' : 'bi-exclamation-circle'} me-1`}></i>
            {isFFmpegLoaded ? 'FFmpeg Ready' : 'Basic Mode'}
          </span>
        </div>

        {/* Progress Steps */}
        <div className="d-flex align-items-center justify-content-center mb-4">
          <div className="px-3 py-2 bg-secondary rounded-start">1. Video</div>
          <div className="px-3 py-2 bg-secondary">2. Subtitles</div>
          <div className="px-3 py-2 bg-primary rounded-end">3. Render</div>
        </div>

        {/* Status */}
        <div className={`alert ${renderStatus.includes('fail') || renderStatus.includes('error') ? 'alert-danger' : 'alert-info'} mb-4`}>
          <i className="bi bi-info-circle-fill me-2"></i>{renderStatus}
        </div>

        {/* Project Summary */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header">
            <i className="bi bi-check-circle me-2"></i>Project Summary
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-4">
                <p className="text-muted small mb-1">Video File</p>
                <p className="text-white">{workflow.videoFile?.name || 'No video'}</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Subtitles</p>
                <p className="text-white">{workflow.subtitles?.length || 0} subtitles</p>
              </div>
              <div className="col-md-4">
                <p className="text-muted small mb-1">Video Settings</p>
                <p className="text-white">{workflow.playbackSpeed || 1}x speed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Video Preview */}
        {workflow.videoUrl && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-header">
              <i className="bi bi-play-circle me-2"></i>Video Preview
            </div>
            <div className="card-body p-0">
              <div className="bg-black">
                <video src={workflow.videoUrl} controls className="w-100" />
              </div>
            </div>
          </div>
        )}

        {/* Render Settings */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-header">
            <i className="bi bi-gear me-2"></i>Render Settings
          </div>
          <div className="card-body">
            {/* Resolution */}
            <div className="mb-4">
              <label className="form-label text-muted"><i className="bi bi-upcscan me-2"></i>Resolution</label>
              <div className="d-flex flex-wrap gap-2">
                {Object.keys(resolutions).map(key => (
                  <button key={key} onClick={() => setResolution(key)} className={`btn ${resolution === key ? 'btn-primary' : 'btn-outline-secondary'}`}>
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality */}
            <div className="mb-4">
              <label className="form-label text-muted"><i className="bi bi-speedometer2 me-2"></i>Quality</label>
              <div className="d-flex flex-wrap gap-2">
                {Object.entries(qualityPresets).map(([key, val]) => (
                  <button key={key} onClick={() => setQuality(key)} className={`btn ${quality === key ? 'btn-primary' : 'btn-outline-secondary'}`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Format */}
            <div className="mb-0">
              <label className="form-label text-muted"><i className="bi bi-file-earmark-code me-2"></i>Format</label>
              <div className="d-flex flex-wrap gap-2">
                {['mp4', 'webm', 'mov'].map(f => (
                  <button key={f} onClick={() => setFormat(f)} className={`btn ${format === f ? 'btn-primary' : 'btn-outline-secondary'}`}>
                    {f.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Render Button */}
        <button onClick={handleStartRender} disabled={isRendering || !workflow.videoFile} className="btn btn-success btn-lg w-100 mb-4">
          {isRendering ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Rendering... {progress}%
            </>
          ) : (
            <>
              <i className="bi bi-rocket-takeoff me-2"></i>Start Rendering
            </>
          )}
        </button>

        {/* Progress */}
        {isRendering && (
          <div className="card mb-4 border-0 shadow-sm">
            <div className="card-body">
              <div className="progress">
                <div className="progress-bar bg-success progress-bar-striped progress-bar-animated" style={{ width: `${progress}%` }}></div>
              </div>
              <LoadingAnimation type="wave" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="d-flex justify-content-between">
          <button onClick={handleBack} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back: Subtitles
          </button>
          <button onClick={handleNewProject} className="btn btn-outline-primary">
            <i className="bi bi-plus-lg me-2"></i>New Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default RenderPage
