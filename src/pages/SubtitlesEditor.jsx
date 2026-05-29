import React, { useState, useRef, useEffect } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'

const SubtitlesEditor = () => {
  const [subtitles, setSubtitles] = useState([
    { id: 1, start: 0, end: 3, text: "Welcome to the recap", style: 'default' },
    { id: 2, start: 3, end: 6, text: "This is an amazing scene", style: 'default' },
    { id: 3, start: 6, end: 9, text: "Let's begin our journey", style: 'highlight' },
  ])
  const [currentSubId, setCurrentSubId] = useState(null)
  const [selectedSubId, setSelectedSubId] = useState(null)
  const [videoUrl, setVideoUrl] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [videoFile, setVideoFile] = useState(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [ffmpeg] = useState(new FFmpeg())
  const videoRef = useRef(null)
  const inputRef = useRef(null)
  const nextId = useRef(4)

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

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setIsUploading(true)
      setTimeout(() => {
        setVideoFile(file)
        setVideoUrl(URL.createObjectURL(file))
        setIsUploading(false)
      }, 1500)
    }
  }

  const handleTimeUpdate = (e) => {
    setCurrentTime(e.target.currentTime)
    const time = e.target.currentTime
    const activeSub = subtitles.find(sub => time >= sub.start && time < sub.end)
    setCurrentSubId(activeSub?.id || null)
  }

  const addSubtitle = () => {
    const newSub = {
      id: nextId.current++,
      start: currentTime,
      end: currentTime + 3,
      text: "New subtitle",
      style: 'default'
    }
    setSubtitles([...subtitles, newSub])
    setSelectedSubId(newSub.id)
  }

  const updateSubtitle = (id, field, value) => {
    setSubtitles(subtitles.map(sub => 
      sub.id === id ? { ...sub, [field]: value } : sub
    ))
  }

  const deleteSubtitle = (id) => {
    setSubtitles(subtitles.filter(sub => sub.id !== id))
    if (selectedSubId === id) setSelectedSubId(null)
  }

  const moveSubtitle = (id, direction) => {
    const index = subtitles.findIndex(s => s.id === id)
    if (direction === 'up' && index > 0) {
      const newSubs = [...subtitles]
      ;[newSubs[index - 1], newSubs[index]] = [newSubs[index], newSubs[index - 1]]
      setSubtitles(newSubs)
    } else if (direction === 'down' && index < subtitles.length - 1) {
      const newSubs = [...subtitles]
      ;[newSubs[index], newSubs[index + 1]] = [newSubs[index + 1], newSubs[index]]
      setSubtitles(newSubs)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && selectedSubId !== null) {
      const selected = subtitles.find(s => s.id === selectedSubId)
      if (selected) {
        updateSubtitle(selectedSubId, 'text', selected.text + '\n')
        setTimeout(() => {
          inputRef.current?.focus()
          const input = inputRef.current
          if (input) {
            const pos = input.value.length
            input.setSelectionRange(pos, pos)
          }
        }, 0)
      }
    }
  }

  const setSubtitleTime = (id, timeType) => {
    if (timeType === 'start') {
      updateSubtitle(id, 'start', currentTime)
    } else {
      updateSubtitle(id, 'end', currentTime)
    }
  }

  const handleExportSRT = () => {
    const srtContent = subtitles
      .sort((a, b) => a.start - b.start)
      .map((sub, index) => {
        const formatTime = (time) => {
          const hrs = Math.floor(time / 3600)
          const mins = Math.floor((time % 3600) / 60)
          const secs = Math.floor(time % 60)
          const ms = Math.floor((time % 1) * 1000)
          return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
        }
        return `${index + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}\n`
      }).join('\n')

    const blob = new Blob([srtContent], { type: 'text/srt' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'subtitles.srt'
    a.click()
  }

  const handleImportSRT = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    const text = await file.text()
    const blocks = text.split(/\n\n+/)
    const parsed = blocks.map(block => {
      const lines = block.split('\n')
      if (lines.length >= 3) {
        const timeLine = lines[1]
        const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
        if (match) {
          return {
            id: nextId.current++,
            start: parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000,
            end: parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000,
            text: lines.slice(2).join('\n'),
            style: 'default'
          }
        }
      }
      return null
    }).filter(Boolean)
    setSubtitles(parsed)
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-black-custom p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl text-white mb-6">✏️ Subtitles Editor</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <div className="bg-gray-dark rounded-lg p-4">
            <h3 className="text-red-custom mb-4">📹 Video Preview</h3>
            {!videoFile ? (
              <label className="block border-2 border-dashed border-gray-custom rounded-lg p-8 text-center cursor-pointer hover:border-red-custom transition">
                <input type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                {isUploading ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-custom border-t-transparent mx-auto"></div>
                    <p className="text-gray-light mt-2">Loading video...</p>
                  </div>
                ) : (
                  <>
                    <div className="text-4xl mb-2">🎬</div>
                    <p className="text-gray-light">Click to upload video</p>
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
                  onTimeUpdate={handleTimeUpdate}
                />
                
                {/* Import/Export Controls */}
                <div className="mt-4 flex flex-wrap gap-2">
                  <input type="file" accept=".srt" className="hidden" id="srt-import" onChange={handleImportSRT} />
                  <label htmlFor="srt-import" className="bg-gray-custom px-4 py-2 rounded cursor-pointer hover:bg-red-custom">
                    📥 Import SRT
                  </label>
                  <button onClick={handleExportSRT} className="bg-gray-custom px-4 py-2 rounded hover:bg-red-custom">
                    📤 Export SRT
                  </button>
                </div>

                {/* Current Subtitle Display */}
                <div className="mt-4 bg-gray-custom rounded-lg p-4 min-h-[80px] flex items-center justify-center">
                  <p className="text-white text-xl text-center">
                    {currentSubId ? subtitles.find(s => s.id === currentSubId)?.text : '...'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Subtitle List */}
          <div className="bg-gray-dark rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-custom">📝 Subtitles Timeline</h3>
              <button onClick={addSubtitle} className="bg-red-custom px-4 py-2 rounded hover:bg-gray-custom">
                ➕ Add Subtitle
              </button>
            </div>
            
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {subtitles.sort((a, b) => a.start - b.start).map((sub, index) => (
                <div 
                  key={sub.id}
                  className={`bg-gray-custom p-3 rounded-lg cursor-pointer transition ${
                    selectedSubId === sub.id ? 'ring-2 ring-red-custom' : ''
                  } ${currentSubId === sub.id ? 'bg-red-custom/20' : ''}`}
                  onClick={() => setSelectedSubId(sub.id)}
                >
                  <div className="flex justify-between text-xs text-gray-light mb-2">
                    <span>#{index + 1}</span>
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'start') }}
                        className="bg-gray-dark px-2 py-1 rounded hover:bg-red-custom"
                        title="Set to current time"
                      >
                        In: {formatTime(sub.start)}
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSubtitleTime(sub.id, 'end') }}
                        className="bg-gray-dark px-2 py-1 rounded hover:bg-red-custom"
                        title="Set to current time"
                      >
                        Out: {formatTime(sub.end)}
                      </button>
                    </div>
                  </div>
                  
                  {selectedSubId === sub.id ? (
                    <textarea
                      ref={inputRef}
                      value={sub.text}
                      onChange={(e) => updateSubtitle(sub.id, 'text', e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="w-full bg-gray-dark text-white p-2 rounded resize-none"
                      rows={2}
                    />
                  ) : (
                    <p className="text-white">{sub.text}</p>
                  )}
                  
                  <div className="flex justify-between mt-2">
                    <div className="flex space-x-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSubtitle(sub.id, 'up') }}
                        className="bg-gray-dark px-2 py-1 rounded text-xs hover:bg-red-custom"
                      >
                        ⬆️
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); moveSubtitle(sub.id, 'down') }}
                        className="bg-gray-dark px-2 py-1 rounded text-xs hover:bg-red-custom"
                      >
                        ⬇️
                      </button>
                    </div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deleteSubtitle(sub.id) }}
                      className="bg-red-600 px-2 py-1 rounded text-xs hover:bg-red-700"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sync Button */}
        <div className="mt-6 text-center">
          <p className="text-gray-light mb-2">Current time: {formatTime(currentTime)}</p>
        </div>
      </div>
    </div>
  )
}

export default SubtitlesEditor
