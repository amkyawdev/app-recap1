import React, { createContext, useContext, useState } from 'react'

const WorkflowContext = createContext()

export const useWorkflow = () => {
  const context = useContext(WorkflowContext)
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider')
  }
  return context
}

export const WorkflowProvider = ({ children }) => {
  const [workflow, setWorkflow] = useState({
    // Step 1: Video Editor
    videoFile: null,
    videoUrl: null,
    trimStart: 0,
    trimEnd: 0,
    playbackSpeed: 1,
    volume: 1,
    
    // Step 2: Subtitles Editor
    subtitles: [
      { id: 1, start: 0, end: 3, text: "Welcome to the recap", style: 'default' },
    ],
    
    // Step 3: Render
    renderSettings: {
      resolution: '1080p',
      format: 'mp4',
      quality: 'high',
      fps: 30
    }
  })

  const updateVideo = (videoData) => {
    setWorkflow(prev => ({
      ...prev,
      ...videoData
    }))
  }

  const updateSubtitles = (subtitles) => {
    setWorkflow(prev => ({
      ...prev,
      subtitles
    }))
  }

  const updateRenderSettings = (settings) => {
    setWorkflow(prev => ({
      ...prev,
      renderSettings: { ...prev.renderSettings, ...settings }
    }))
  }

  const resetWorkflow = () => {
    setWorkflow({
      videoFile: null,
      videoUrl: null,
      trimStart: 0,
      trimEnd: 0,
      playbackSpeed: 1,
      volume: 1,
      subtitles: [],
      renderSettings: {
        resolution: '1080p',
        format: 'mp4',
        quality: 'high',
        fps: 30
      }
    })
  }

  return (
    <WorkflowContext.Provider value={{
      workflow,
      updateVideo,
      updateSubtitles,
      updateRenderSettings,
      resetWorkflow
    }}>
      {children}
    </WorkflowContext.Provider>
  )
}

export default WorkflowContext
