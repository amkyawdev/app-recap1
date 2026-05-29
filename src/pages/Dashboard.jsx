import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProjects, saveProject, deleteProject, getVideoList } from '../plugins/FileSystem'
import Footer from '../components/Footer'

const Dashboard = () => {
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [videos, setVideos] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('projects')

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
      settings: { resolution: '1080p', format: 'mp4', quality: 'high' }
    }
    const updated = await saveProject(newProject)
    setProjects(updated)
    navigate('/editor')
  }

  const handleDeleteProject = async (id) => {
    const updated = await deleteProject(id)
    setProjects(updated)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-vh-100 bg-dark-custom pt-5">
      <div className="container py-4">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="text-white h2 mb-0">
            <i className="bi bi-speedometer2 me-2 text-primary-custom"></i>Dashboard
          </h1>
          <button className="btn btn-primary" onClick={createNewProject}>
            <i className="bi bi-plus-lg me-2"></i>New Project
          </button>
        </div>

        {/* Workflow Steps */}
        <div className="card mb-4 border-0 shadow-sm">
          <div className="card-body">
            <h5 className="text-center text-muted mb-3">
              <i className="bi bi-arrow-right-circle me-2"></i>Workflow Guide
            </h5>
            <div className="d-flex flex-wrap justify-content-center gap-3">
              <button onClick={() => navigate('/editor')} className="btn btn-outline-primary">
                <i className="bi bi-film me-2"></i>1. Video Editor
              </button>
              <i className="bi bi-arrow-right align-self-center text-muted"></i>
              <button onClick={() => navigate('/subtitles')} className="btn btn-outline-primary">
                <i className="bi bi-type me-2"></i>2. Subtitles
              </button>
              <i className="bi bi-arrow-right align-self-center text-muted"></i>
              <button onClick={() => navigate('/render')} className="btn btn-outline-primary">
                <i className="bi bi-gpu me-2"></i>3. Render
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-3 mb-4">
          <button onClick={() => setActiveTab('projects')} className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-outline-secondary'}`}>
            <i className="bi bi-folder me-2"></i>Projects ({projects.length})
          </button>
          <button onClick={() => setActiveTab('videos')} className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-outline-secondary'}`}>
            <i className="bi bi-camera-video me-2"></i>Videos ({videos.length})
          </button>
        </div>

        {/* Projects */}
        {activeTab === 'projects' && (
          <div className="row g-4">
            {projects.length === 0 ? (
              <div className="col-12">
                <div className="card text-center py-5 border-0 shadow-sm">
                  <i className="bi bi-folder-plus display-1 text-muted mb-3"></i>
                  <p className="text-muted">No projects yet</p>
                  <button className="btn btn-primary" onClick={createNewProject}>
                    <i className="bi bi-plus-lg me-2"></i>Create Project
                  </button>
                </div>
              </div>
            ) : (
              projects.map(project => (
                <div key={project.id} className="col-md-6 col-lg-4">
                  <div className="card h-100 border-0 shadow-sm hover-lift">
                    <div className="card-body">
                      <h5 className="card-title">
                        <i className="bi bi-folder-fill text-warning me-2"></i>{project.name}
                      </h5>
                      <p className="text-muted small mb-1"><i className="bi bi-calendar3 me-2"></i>{formatDate(project.createdAt)}</p>
                      {project.videoFile && <p className="text-muted small mb-1"><i className="bi bi-film me-2"></i>{project.videoFile.name}</p>}
                      {project.subtitles?.length > 0 && <p className="text-muted small"><i className="bi bi-type me-2"></i>{project.subtitles.length} subtitles</p>}
                    </div>
                    <div className="card-footer bg-transparent border-0 d-flex justify-content-between">
                      <span className={`badge ${project.status === 'completed' ? 'bg-success' : project.status === 'processing' ? 'bg-warning' : 'bg-secondary'}`}>
                        {project.status?.toUpperCase() || 'DRAFT'}
                      </span>
                      <button className="btn btn-outline-danger btn-sm" onClick={() => handleDeleteProject(project.id)}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Videos */}
        {activeTab === 'videos' && (
          <div className="row g-4">
            {videos.length === 0 ? (
              <div className="col-12">
                <div className="card text-center py-5 border-0 shadow-sm">
                  <i className="bi bi-camera-video display-1 text-muted mb-3"></i>
                  <p className="text-muted">No videos processed yet</p>
                  <button className="btn btn-primary" onClick={() => navigate('/editor')}>
                    <i className="bi bi-film me-2"></i>Go to Editor
                  </button>
                </div>
              </div>
            ) : (
              videos.map(video => (
                <div key={video.id} className="col-md-6 col-lg-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body">
                      <h5 className="card-title"><i className="bi bi-film text-primary-custom me-2"></i>{video.fileName}</h5>
                      <p className="text-muted small"><i className="bi bi-calendar3 me-2"></i>{formatDate(video.createdAt)}</p>
                      {video.duration && <p className="text-muted small"><i className="bi bi-clock me-2"></i>{video.duration}s</p>}
                    </div>
                    <div className="card-footer bg-transparent border-0">
                      <button className="btn btn-primary w-100">
                        <i className="bi bi-play-fill me-2"></i>Open
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default Dashboard
