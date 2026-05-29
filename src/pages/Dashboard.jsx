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
    navigate(`/editor?project=${project.id}`)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="min-h-100 bg-dark-custom">
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-gray-dark sticky-top">
        <div className="container-fluid">
          <button 
            className="btn btn-outline-secondary" 
            onClick={() => setIsMenuOpen(true)}
          >
            <i className="bi bi-list"></i>
          </button>
          <span className="navbar-brand mb-0 h1 text-primary-custom">
            <i className="bi bi-film me-2"></i>MovieRecap Studio
          </span>
          <button 
            className="btn btn-primary" 
            onClick={createNewProject}
          >
            <i className="bi bi-plus-lg me-2"></i>New Project
          </button>
        </div>
      </nav>

      {/* Sidebar Overlay */}
      {isMenuOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 1040 }}
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`sidebar p-4 ${isMenuOpen ? 'open' : ''}`}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="text-primary-custom mb-0">
            <i className="bi bi-grid-3x3-gap me-2"></i>Menu
          </h4>
          <button 
            className="btn btn-outline-light btn-sm"
            onClick={() => setIsMenuOpen(false)}
          >
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link to="/dashboard" className="nav-link text-light">
              <i className="bi bi-house me-3"></i>Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/editor" className="nav-link text-light">
              <i className="bi bi-film me-3"></i>Video Editor
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/subtitles" className="nav-link text-light">
              <i className="bi bi-type me-3"></i>Subtitles Editor
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/render" className="nav-link text-light">
              <i className="bi bi-render me-3"></i>Render Output
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="container py-4">
        {/* Workflow Steps */}
        <div className="card mb-4 p-4 animate-fadeIn">
          <h5 className="card-title text-center text-light-custom mb-3">
            <i className="bi bi-arrow-right-circle me-2"></i>Workflow: Video → Subtitles → Render
          </h5>
          <div className="d-flex flex-wrap justify-content-center gap-3">
            <Link to="/editor" className="btn btn-secondary">
              <i className="bi bi-film me-2"></i>1. Video Editor
            </Link>
            <span className="align-self-center text-light-custom">
              <i className="bi bi-arrow-right"></i>
            </span>
            <Link to="/subtitles" className="btn btn-secondary">
              <i className="bi bi-type me-2"></i>2. Subtitles
            </Link>
            <span className="align-self-center text-light-custom">
              <i className="bi bi-arrow-right"></i>
            </span>
            <Link to="/render" className="btn btn-secondary">
              <i className="bi bi-gpu me-2"></i>3. Render
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-3 mb-4">
          <button
            onClick={() => setActiveTab('projects')}
            className={`btn ${activeTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <i className="bi bi-folder me-2"></i>Projects ({projects.length})
          </button>
          <button
            onClick={() => setActiveTab('videos')}
            className={`btn ${activeTab === 'videos' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <i className="bi bi-camera-video me-2"></i>Videos ({videos.length})
          </button>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-5">
            <LoadingAnimation type="wave" />
          </div>
        ) : (
          <>
            {/* Projects List */}
            {activeTab === 'projects' && (
              <div className="row g-4">
                {projects.length === 0 ? (
                  <div className="col-12">
                    <div className="card text-center py-5">
                      <i className="bi bi-folder-plus display-1 text-light-custom mb-3"></i>
                      <p className="text-light-custom">No projects yet</p>
                      <button 
                        className="btn btn-primary"
                        onClick={createNewProject}
                      >
                        <i className="bi bi-plus-lg me-2"></i>Create First Project
                      </button>
                    </div>
                  </div>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className="col-md-6 col-lg-4">
                      <div className="card h-100 project-card" onClick={() => handleOpenProject(project)}>
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-folder-fill text-warning me-2"></i>
                            {project.name}
                          </h5>
                          <p className="card-text text-light-custom small">
                            <i className="bi bi-calendar3 me-2"></i>
                            {formatDate(project.createdAt)}
                          </p>
                          {project.videoFile && (
                            <p className="card-text text-light-custom small">
                              <i className="bi bi-film me-2"></i>
                              {project.videoFile.name}
                            </p>
                          )}
                          {project.subtitles?.length > 0 && (
                            <p className="card-text text-light-custom small">
                              <i className="bi bi-type me-2"></i>
                              {project.subtitles.length} subtitles
                            </p>
                          )}
                        </div>
                        <div className="card-footer bg-transparent border-top-0 d-flex justify-content-between">
                          <span className={`badge ${project.status === 'completed' ? 'bg-success' : project.status === 'processing' ? 'bg-warning' : 'bg-secondary'}`}>
                            {project.status?.toUpperCase() || 'DRAFT'}
                          </span>
                          <button 
                            className="btn btn-danger btn-sm"
                            onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id) }}
                          >
                            <i className="bi bi-trash"></i>
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
              <div className="row g-4">
                {videos.length === 0 ? (
                  <div className="col-12">
                    <div className="card text-center py-5">
                      <i className="bi bi-camera-video display-1 text-light-custom mb-3"></i>
                      <p className="text-light-custom">No videos processed yet</p>
                      <Link to="/editor" className="btn btn-primary">
                        <i className="bi bi-film me-2"></i>Go to Video Editor
                      </Link>
                    </div>
                  </div>
                ) : (
                  videos.map(video => (
                    <div key={video.id} className="col-md-6 col-lg-4">
                      <div className="card">
                        <div className="card-body">
                          <h5 className="card-title">
                            <i className="bi bi-film text-primary-custom me-2"></i>
                            {video.fileName}
                          </h5>
                          <p className="card-text text-light-custom small">
                            <i className="bi bi-calendar3 me-2"></i>
                            {formatDate(video.createdAt)}
                          </p>
                          {video.duration && (
                            <p className="card-text text-light-custom small">
                              <i className="bi bi-clock me-2"></i>
                              {video.duration}s
                            </p>
                          )}
                          {video.size && (
                            <p className="card-text text-light-custom small">
                              <i className="bi bi-hdd me-2"></i>
                              {(video.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <div className="card-footer bg-transparent border-top-0">
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
          </>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Dashboard
