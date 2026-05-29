// Workflow Manager - Coordinates Video Editing + Subtitles → Render

import { saveProject, getProjects, saveVideoMetadata } from '../plugins/FileSystem'

// Workflow States
export const WORKFLOW_STEPS = {
  1: { id: 'video', name: 'Video Editor', icon: '🎬', path: '/editor' },
  2: { id: 'subtitles', name: 'Subtitles Editor', icon: '✏️', path: '/subtitles' },
  3: { id: 'render', name: 'Render Output', icon: '🎯', path: '/render' }
}

// Create or Update Project
export const createProject = async (name = 'New Project') => {
  const project = {
    id: Date.now().toString(),
    name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'draft',
    currentStep: 1,
    video: {
      file: null,
      url: null,
      duration: 0,
      trimStart: 0,
      trimEnd: 0,
      playbackSpeed: 1
    },
    subtitles: [],
    renderSettings: {
      resolution: '1080p',
      format: 'mp4',
      quality: 'high',
      fps: 30
    },
    output: null
  }
  
  await saveProject(project)
  return project
}

// Load Project
export const loadProject = async (projectId) => {
  const projects = await getProjects()
  return projects.find(p => p.id === projectId)
}

// Update Project Video
export const updateProjectVideo = async (projectId, videoData) => {
  const projects = await getProjects()
  const project = projects.find(p => p.id === projectId)
  
  if (project) {
    project.video = { ...project.video, ...videoData }
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
  }
  
  return project
}

// Update Project Subtitles
export const updateProjectSubtitles = async (projectId, subtitles) => {
  const projects = await getProjects()
  const project = projects.find(p => p.id === projectId)
  
  if (project) {
    project.subtitles = subtitles
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
  }
  
  return project
}

// Update Render Settings
export const updateRenderSettings = async (projectId, settings) => {
  const projects = await getProjects()
  const project = projects.find(p => p.id === projectId)
  
  if (project) {
    project.renderSettings = { ...project.renderSettings, ...settings }
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
  }
  
  return project
}

// Update Project Status
export const updateProjectStatus = async (projectId, status) => {
  const projects = await getProjects()
  const project = projects.find(p => p.id === projectId)
  
  if (project) {
    project.status = status
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
  }
  
  return project
}

// Move to Next Step
export const moveToNextStep = async (projectId) => {
  const projects = await getProjects()
  const project = projects.find(p => p.id === projectId)
  
  if (project && project.currentStep < 3) {
    project.currentStep += 1
    project.updatedAt = new Date().toISOString()
    await saveProject(project)
    return project
  }
  
  return null
}

// Save Video Metadata
export const saveVideoToHistory = async (videoFile, metadata = {}) => {
  await saveVideoMetadata(videoFile.name, {
    size: videoFile.size,
    type: videoFile.type,
    duration: metadata.duration || 0,
    ...metadata
  })
}

// Export Project as JSON
export const exportProjectData = async (projectId) => {
  const project = await loadProject(projectId)
  return JSON.stringify(project, null, 2)
}

// Generate SRT from subtitles
export const generateSRTContent = (subtitles) => {
  const sorted = subtitles.sort((a, b) => a.start - b.start)
  return sorted.map((sub, index) => {
    const formatTime = (time) => {
      const hrs = Math.floor(time / 3600)
      const mins = Math.floor((time % 3600) / 60)
      const secs = Math.floor(time % 60)
      const ms = Math.floor((time % 1) * 1000)
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`
    }
    return `${index + 1}\n${formatTime(sub.start)} --> ${formatTime(sub.end)}\n${sub.text}\n`
  }).join('\n')
}

// Validate Workflow
export const validateWorkflow = (project) => {
  const errors = []
  
  if (!project.video?.file) {
    errors.push('Video file is required')
  }
  
  if (project.subtitles?.length === 0) {
    errors.push('Add at least one subtitle')
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

// Get Workflow Progress
export const getWorkflowProgress = (project) => {
  let progress = 0
  
  if (project.video?.file) progress += 33
  if (project.subtitles?.length > 0) progress += 33
  if (project.renderSettings) progress += 34
  
  return Math.min(progress, 100)
}
