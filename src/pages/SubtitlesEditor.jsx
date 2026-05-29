import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflow } from '../context/WorkflowContext'
import { loadFFmpeg } from '../utils/ffmpegLoader'
import SubtitleStyleEditor from '../components/SubtitleStyleEditor'

const SubtitlesEditor = () => {
  const navigate = useNavigate()
  const { workflow, updateVideo, updateSubtitles } = useWorkflow()
  
  const [videoFile, setVideoFile] = useState(workflow.videoFile)
  const [videoUrl, setVideoUrl] = useState(workflow.videoUrl)
  const [subtitles, setSubtitles] = useState(workflow.subtitles || [])
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [currentSubId, setCurrentSubId] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [processingStatus, setProcessingStatus] = useState('Ready')
  const [ffmpegLoaded, setFfmpegLoaded] = useState(false)
  const [showPreview, setShowPreview] = useState(true)
  const [showStyleEditor, setShowStyleEditor] = useState(false)
  const [editingSubtitle, setEditingSubtitle] = useState(null)
  
  const ffmpegRef = useRef(null)
  const videoRef = useRef(null)
  const nextId = useRef(workflow.subtitles?.length || 1)

  useEffect(() => {
    const initFFmpeg = async () => {
      try {
        const ffmpeg = await loadFFmpeg()
        ffmpegRef.current = ffmpeg
        setFfmpegLoaded(true)
      } catch (error) {
        console.log('[Subtitles] FFmpeg not available')
      }
    }
    initFFmpeg()
  }, [])

  // Sync with workflow context when returning from other pages
  useEffect(() => {
    if (workflow.videoFile) {
      setVideoFile(workflow.videoFile)
      setVideoUrl(workflow.videoUrl)
    }
    if (workflow.subtitles && workflow.subtitles.length > 0) {
      setSubtitles(workflow.subtitles)
    }
  }, [workflow.videoFile, workflow.subtitles])

  const handleTimeUpdate = (e) => {
    const time = e.target.currentTime
    setCurrentTime(time)
    const activeSub = subtitles.find(sub => time >= sub.start && time < sub.end)
    setCurrentSubId(activeSub?.id || null)
  }

  const handleLoadedMetadata = (e) => {
    setDuration(e.target.duration)
  }

  const addSubtitle = () => {
    const newSub = { 
      id: nextId.current++,
      start: Math.max(0, currentTime),
      end: Math.min(duration, currentTime + 3),
      text: "New subtitle",
      style: {
        fontSize: 24,
        fontColor: '#FFFFFF',
        fontWeight: 'normal',
        backgroundColor: 'rgba(0,0,0,0.7)'
      }
    }
    const updated = [...subtitles, newSub]
    setSubtitles(updated)
    updateSubtitles(updated)
    setSelectedSubId(newSub.id)
  }

  const updateSubtitle = (id, updates) => {
    const updated = subtitles.map(sub => sub.id === id ? { ...sub, ...updates } : sub)
    setSubtitles(updated)
    updateSubtitles(updated)
  }

  const deleteSubtitle = (id) => {
    const updated = subtitles.filter(sub => sub.id !== id)
    setSubtitles(updated)
    updateSubtitles(updated)
    if (selectedSubId === id) setSelectedSubId(null)
  }

  const setSubtitleTime = (id, timeType) => {
    updateSubtitle(id, { [timeType]: timeType === 'start' ? Math.max(0, currentTime) : Math.min(duration, currentTime) })
  }

  const openStyleEditor = (sub) => {
    setEditingSubtitle(sub)
    setShowStyleEditor(true)
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleExportSRT = () => {
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
    
    const blob = new Blob([srtContent], { type: 'text/srt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    a.click()
    setProcessingStatus('SRT exported!')
  }

  // Handle SRT file upload
  const handleSRTUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target.result
        const parsed = parseSRT(content)
        if (parsed.length > 0) {
          const updated = [...subtitles, ...parsed]
          setSubtitles(updated)
          updateSubtitles(updated)
          setProcessingStatus(`Imported ${parsed.length} subtitles from SRT`)
        } else {
          setProcessingStatus('No valid subtitles found in file')
        }
      } catch (error) {
        setProcessingStatus('Failed to parse SRT file')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Parse SRT content to subtitles array
  const parseSRT = (content) => {
    const blocks = content.trim().split(/\n\n+/)
    const parsed = []
    let id = nextId.current

    for (const block of blocks) {
      const lines = block.split('\n')
      if (lines.length < 3) continue

      const timeLine = lines[1]
      const timeMatch = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (!timeMatch) continue

      const start = parseInt(timeMatch[1]) * 3600 + parseInt(timeMatch[2]) * 60 + parseInt(timeMatch[3]) + parseInt(timeMatch[4]) / 1000
      const end = parseInt(timeMatch[5]) * 3600 + parseInt(timeMatch[6]) * 60 + parseInt(timeMatch[7]) + parseInt(timeMatch[8]) / 1000
      const text = lines.slice(2).join('\n').replace(/<[^>]+>/g, '')

      parsed.push({
        id: id++,
        start,
        end,
        text,
        style: {
          fontSize: 24,
          fontColor: '#FFFFFF',
          fontWeight: 'normal',
          backgroundColor: 'rgba(0,0,0,0.7)'
        }
      })
    }
    nextId.current = id
    return parsed
  }

  const handleNext = () => {
    updateVideo({ videoFile, videoUrl })
    updateSubtitles(subtitles)
    navigate('/render')
  }

  const handleBack = () => {
    updateVideo({ videoFile, videoUrl })
    updateSubtitles(subtitles)
    navigate('/editor')
  }

  return (
    <div className="min-vh-100 bg-dark-custom pt-5">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="text-white h2 mb-0">
              <i className="bi bi-type me-2 text-primary-custom"></i>Subtitles Editor
            </h1>
            <p className="text-muted small mb-0">Step 2 of 3 - Add subtitles</p>
          </div>
          <span className="badge bg-secondary">
            <i className="bi bi-list-ul me-1"></i>{subtitles.length} subtitles
          </span>
        </div>

        {/* Progress Steps */}
        <div className="d-flex align-items-center justify-content-center mb-4">
          <div className="px-3 py-2 bg-secondary rounded-start">1. Video</div>
          <div className="px-3 py-2 bg-primary">2. Subtitles</div>
          <div className="px-3 py-2 bg-secondary rounded-end">3. Render</div>
        </div>

        <div className="row g-4">
          {/* Video Preview */}
          <div className="col-lg-6">
            <div className="card h-100 border-0 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-play-circle me-2"></i>Video Preview</span>
                {videoFile && (
                  <div className="form-check form-switch">
                    <input className="form-check-input" type="checkbox" checked={showPreview} onChange={(e) => setShowPreview(e.target.checked)} />
                    <label className="form-check-label text-muted small">Show subtitle</label>
                  </div>
                )}
              </div>
              <div className="card-body p-0">
                {!videoFile ? (
                  <div className="p-5 text-center">
                    <i className="bi bi-film display-3 text-muted mb-3 d-block"></i>
                    <p className="text-muted">No video - Go back to Video Editor</p>
                  </div>
                ) : (
                  <>
                    <div className="position-relative bg-black">
                      <video ref={videoRef} src={videoUrl} controls className="w-100 d-block" onTimeUpdate={handleTimeUpdate} onLoadedMetadata={handleLoadedMetadata} />
                      {showPreview && currentSubId && (() => {
                        const sub = subtitles.find(s => s.id === currentSubId)
                        if (!sub) return null
                        return (
                          <div className="position-absolute bottom-0 start-0 end-0 p-3 text-center" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
                            <span style={{
                              fontSize: (sub.style?.fontSize || 24) + 'px',
                              color: sub.style?.fontColor || '#FFFFFF',
                              fontWeight: sub.style?.fontWeight || 'normal',
                              backgroundColor: sub.style?.backgroundColor || 'rgba(0,0,0,0.7)',
                              padding: sub.style?.padding || '8px',
                              borderRadius: '4px',
                              textShadow: '2px 2px 4px black'
                            }}>
                              {sub.text}
                            </span>
                          </div>
                        )
                      })()}
                    </div>
                    <div className="p-3">
                      <div className="d-flex justify-content-between text-muted small mb-3">
                        <span><i className="bi bi-clock me-1"></i>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                      </div>
                      <div className="d-flex flex-wrap gap-2">
                        <button onClick={addSubtitle} className="btn btn-success btn-sm">
                          <i className="bi bi-plus-lg me-1"></i>Add Sub
                        </button>
                        <label className="btn btn-outline-info btn-sm mb-0" style={{ cursor: 'pointer' }}>
                          <i className="bi bi-upload me-1"></i>Import SRT
                          <input type="file" accept=".srt,.txt" onChange={handleSRTUpload} style={{ display: 'none' }} />
                        </label>
                        <button onClick={handleExportSRT} className="btn btn-outline-secondary btn-sm">
                          <i className="bi bi-download me-1"></i>Export SRT
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Subtitles List */}
          <div className="col-lg-6">
            <div className="card border-0 shadow-sm">
              <div className="card-header d-flex justify-content-between align-items-center">
                <span><i className="bi bi-list-ul me-2"></i>Subtitles ({subtitles.length})</span>
                <button onClick={addSubtitle} className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-lg me-1"></i>Add
                </button>
              </div>
              <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                <div className="d-flex flex-column gap-2">
                  {[...subtitles].sort((a, b) => a.start - b.start).map((sub, i) => (
                    <div key={sub.id} className={`subtitle-item ${selectedSubId === sub.id ? 'active' : ''} ${currentSubId === sub.id ? 'current' : ''}`} onClick={() => setSelectedSubId(sub.id)}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="badge bg-secondary">#{i + 1}</span>
                        <div className="btn-group btn-group-sm">
                          <button onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'start') }} className="btn btn-secondary">In</button>
                          <button onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'end') }} className="btn btn-secondary">Out</button>
                          <button onClick={(e) => { e.stopPropagation(); openStyleEditor(sub) }} className="btn btn-info">
                            <i className="bi bi-palette"></i>
                          </button>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between text-xs mb-2">
                        <span className="badge bg-dark">{formatTime(sub.start)}</span>
                        <span className="text-muted">→</span>
                        <span className="badge bg-dark">{formatTime(sub.end)}</span>
                        <span className="badge bg-info">{(sub.end - sub.start).toFixed(1)}s</span>
                      </div>
                      {selectedSubId === sub.id ? (
                        <textarea value={sub.text} onChange={(e) => updateSubtitle(sub.id, { text: e.target.value })} className="form-control mb-2" rows={2} onClick={(e) => e.stopPropagation()} />
                      ) : (
                        <p className="mb-2 text-white">{sub.text}</p>
                      )}
                      <div className="d-flex justify-content-end">
                        <button onClick={(e) => { e.stopPropagation(); deleteSubtitle(sub.id) }} className="btn btn-danger btn-sm">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Style Editor Modal */}
        {showStyleEditor && editingSubtitle && (
          <SubtitleStyleEditor 
            subtitle={editingSubtitle} 
            onUpdate={updateSubtitle}
            onClose={() => { setShowStyleEditor(false); setEditingSubtitle(null) }}
          />
        )}

        {/* Navigation */}
        <div className="d-flex justify-content-between mt-4">
          <button onClick={handleBack} className="btn btn-outline-secondary">
            <i className="bi bi-arrow-left me-2"></i>Back: Video Editor
          </button>
          <button onClick={handleNext} className="btn btn-primary btn-lg">
            Next: Render <i className="bi bi-arrow-right ms-2"></i>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubtitlesEditor
