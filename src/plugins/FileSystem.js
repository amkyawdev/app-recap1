import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'
import { Preferences } from '@capacitor/preferences'

// File System Operations
export const readFile = async (path) => {
  try {
    const result = await Filesystem.readFile({
      path: path,
      encoding: Encoding.UTF8,
    })
    return result.data
  } catch (error) {
    console.error('Read file error:', error)
    throw error
  }
}

export const writeFile = async (path, data) => {
  try {
    await Filesystem.writeFile({
      path: path,
      data: data,
      encoding: Encoding.UTF8,
      directory: Directory.Documents,
    })
    return true
  } catch (error) {
    console.error('Write file error:', error)
    throw error
  }
}

export const deleteFile = async (path) => {
  try {
    await Filesystem.deleteFile({
      path: path,
      directory: Directory.Documents,
    })
    return true
  } catch (error) {
    console.error('Delete file error:', error)
    throw error
  }
}

export const listFiles = async (path = '') => {
  try {
    const result = await Filesystem.readdir({
      path: path,
      directory: Directory.Documents,
    })
    return result.files
  } catch (error) {
    console.error('List files error:', error)
    throw error
  }
}

// Local Storage with Preferences API
export const saveToStorage = async (key, value) => {
  try {
    await Preferences.set({
      key: key,
      value: JSON.stringify(value),
    })
    return true
  } catch (error) {
    console.error('Save to storage error:', error)
    throw error
  }
}

export const getFromStorage = async (key) => {
  try {
    const result = await Preferences.get({ key: key })
    return result.value ? JSON.parse(result.value) : null
  } catch (error) {
    console.error('Get from storage error:', error)
    return null
  }
}

export const removeFromStorage = async (key) => {
  try {
    await Preferences.remove({ key: key })
    return true
  } catch (error) {
    console.error('Remove from storage error:', error)
    throw error
  }
}

export const clearStorage = async () => {
  try {
    await Preferences.clear()
    return true
  } catch (error) {
    console.error('Clear storage error:', error)
    throw error
  }
}

// Video File Operations
export const saveVideoMetadata = async (fileName, metadata) => {
  const videos = await getFromStorage('videoList') || []
  const existing = videos.findIndex(v => v.fileName === fileName)
  
  if (existing >= 0) {
    videos[existing] = { ...videos[existing], ...metadata }
  } else {
    videos.push({
      id: Date.now().toString(),
      fileName,
      createdAt: new Date().toISOString(),
      ...metadata
    })
  }
  
  await saveToStorage('videoList', videos)
  return videos
}

export const getVideoList = async () => {
  return await getFromStorage('videoList') || []
}

// Project Management
export const saveProject = async (project) => {
  const projects = await getFromStorage('projects') || []
  const existing = projects.findIndex(p => p.id === project.id)
  
  if (existing >= 0) {
    projects[existing] = project
  } else {
    projects.push({
      ...project,
      id: project.id || Date.now().toString(),
      updatedAt: new Date().toISOString()
    })
  }
  
  await saveToStorage('projects', projects)
  return projects
}

export const getProjects = async () => {
  return await getFromStorage('projects') || []
}

export const deleteProject = async (projectId) => {
  const projects = await getFromStorage('projects') || []
  const filtered = projects.filter(p => p.id !== projectId)
  await saveToStorage('projects', filtered)
  return filtered
}
