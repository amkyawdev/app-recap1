import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingAnimation from '../components/LoadingAnimation'
import Footer from '../components/Footer'
import { getProjects, saveProject, deleteProject, getVideoList } from '../plugins/FileSystem'

const Dashboard = () => {
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [projects, setProjects] = useState([])
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects') // projects | videos

  // Load data from storage
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedProjects = await getProjects()
        const loadedVideos = await getVideoList()
        setProjects(loadedProjects)
        setVideos(loadedVideos)
      } catch (error) {
        console.error('Load data error:', error)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  const createNewProject = async () => {
    const newProject = {
      id: Date.now().toString(),
      name: `New Project ${projects.length + 1}`,
      createdAt: new Date().toISOString(),
      status: 'draft',
      videoFile: null,
      subtitles: [],
      settings: {
        resolution: '1080p',
        format: 'mp4',
        quality: 'high'
      }
    }
    const updated = await saveProject(newProject)
    setProjects(updated)
    navigate(`/editor?project=${newProject.id}`)
  }

  const handleDeleteProject = async (id) => {
    const updated = await deleteProject(id)
    setProjects(updated)
  }

  const handleOpenProject = (project) => {
    if (project.videoFile) {
      navigate(`/editor?project=${project.id}`)
    } else {
      navigate(`/editor?project=${project.id}`)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600'
      case 'processing':
        return 'bg-yellow-600'
      case 'draft':
        return 'bg-gray-600'
      default:
        return 'bg-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-black-custom">
      {/* Hamburger Menu Button */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed top-4 left-4 z-50 w-10 h-10 bg-gray-custom rounded-md hover:bg-red-custom transition-all duration-300 flex items-center justify-center"
      >
        <span className="text-xl text-white">☰</span>
      </button>

      {/* Overlay */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Side Menu */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-black-custom bg-opacity-70 backdrop-blur-lg transform transition-transform duration-300 z-50 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-red-custom text-xl font-bold">Menu</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-light hover:text-white">✕</button>
          </div>
          <nav className="space-y-2">
            <Link to="/dashboard" className="block text-gray-light hover:text-red-custom py-2">📊 Dashboard</Link>
            <Link to="/editor" className="block text-gray-light hover:text-red-custom py-2">🎬 Video Editor</Link>
            <Link to="/subtitles" className="block text-gray-light hover:text-red-custom py-2">✏️ Subtitles Editor</Link>
            <Link to="/render" className="block text-gray-light hover:text-red-custom py-2">🎯 Render</Link>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8 pt-20 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl text-white font-bold">🎬 MovieRecap Studio</h1>
          <button 
            onClick={createNewProject}
            className="bg-red-custom px-6 py-3 rounded-lg hover:bg-gray-custom transition-all font-bold"
          >
            ➕ New Project
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="mb-8 bg-gray-dark rounded-lg p-4">
          <h3 className="text-gray-light mb-4 text-center">📋 Workflow: Video → Subtitles → Render</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/editor" className="flex items-center space-x-2 bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">
              <span>🎬</span>
              <span className="text-white">1. Video Editor</span>
            </Link>
            <span className="text-gray-light">→</span>
            <Link to="/subtitles" className="flex items-center space-x-2 bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">
              <span>✏️</span>
              <span className="text-white">2. Subtitles</span>
            </Link>
            <span className="text-gray-light">→</span>
            <Link to="/render" className="flex items-center space-x-2 bg-gray-custom px-4 py-2 rounded hover:bg-red-custom transition">
              <span>🎯</span>
              <span className="text-white">3. Render Output</span>
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('projects')}
            className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'projects' ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
          >
            📁 Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`px-6 py-2 rounded-lg font-bold ${activeTab === 'videos' ? 'bg-red-custom' : 'bg-gray-custom hover:bg-gray-custom/80'}`}
          >
            🎬 Videos ({videos.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingAnimation type="wave" />
          </div>
        ) : (
          <>
            {/* Projects List */}
            {activeTab === 'projects' && (
              <div className="space-y-4">
                {projects.length === 0 ? (
                  <div className="text-center py-12 bg-gray-dark rounded-lg">
                    <div className="text-4xl mb-4">📁</div>
                    <p className="text-gray-light">No projects yet</p>
                    <button 
                      onClick={createNewProject}
                      className="mt-4 bg-red-custom px-6 py-2 rounded-lg hover:bg-gray-custom"
                    >
                      Create First Project
                    </button>
                  </div>
                ) : (
                  projects.map(project => (
                    <div 
                      key={project.id}
                      className="bg-gray-dark p-4 rounded-lg hover:bg-gray-custom transition cursor-pointer"
                      onClick={() => handleOpenProject(project)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <h3 className="text-white text-lg font-bold">{project.name}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-light">
                            <span>📅 {formatDate(project.createdAt)}</span>
                            {project.videoFile && (
                              <span>🎬 {project.videoFile.name}</span>
                            )}
                            {project.subtitles?.length > 0 && (
                              <span>✏️ {project.subtitles.length} subtitles</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadge(project.status)}`}>
                            {project.status?.toUpperCase() || 'DRAFT'}
                          </span>
                          {project.status === 'processing' && <LoadingAnimation type="wave" />}
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                            className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Videos List */}
            {activeTab === 'videos' && (
              <div className="space-y-4">
                {videos.length === 0 ? (
                  <div className="text-center py-12 bg-gray-dark rounded-lg">
                    <div className="text-4xl mb-4">🎬</div>
                    <p className="text-gray-light">No videos processed yet</p>
                    <Link to="/editor" className="mt-4 bg-red-custom px-6 py-2 rounded-lg hover:bg-gray-custom inline-block">
                      Go to Video Editor
                    </Link>
                  </div>
                ) : (
                  videos.map(video => (
                    <div 
                      key={video.id}
                      className="bg-gray-dark p-4 rounded-lg hover:bg-gray-custom transition"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white text-lg font-bold">{video.fileName}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-light">
                            <span>📅 {formatDate(video.createdAt)}</span>
                            {video.duration && <span>⏱️ {video.duration}s</span>}
                            {video.size && <span>💾 {(video.size / (1024 * 1024)).toFixed(2)} MB</span>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button className="bg-gray-custom px-3 py-1 rounded text-sm hover:bg-red-custom">
                            ▶️ Open
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard
