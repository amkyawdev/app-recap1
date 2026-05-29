import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWorkflow } from '../context/WorkflowContext'

const GetStarted = () => {
  const navigate = useNavigate()
  const { resetWorkflow } = useWorkflow()
  const [showFeatures, setShowFeatures] = useState(false)

  const handleStart = () => {
    resetWorkflow()
    navigate('/editor')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-vh-100 bg-dark-custom">
      {/* Hero Section */}
      <div className="hero-section text-center py-5">
        <div className="container">
          {/* Logo */}
          <div className="mb-4">
            <i className="bi bi-film display-1 text-primary-custom"></i>
          </div>
          
          {/* Title */}
          <h1 className="display-4 text-white mb-3 fw-bold">
            MovieRecap Studio
          </h1>
          <p className="lead text-muted mb-5">
            Professional video editing, subtitle creation, and rendering
          </p>

          {/* Action Buttons */}
          <div className="d-flex flex-wrap justify-content-center gap-3 mb-5">
            <button onClick={handleStart} className="btn btn-primary btn-lg px-5 py-3">
              <i className="bi bi-rocket-takeoff me-2"></i>
              Get Started
            </button>
            <button onClick={handleDashboard} className="btn btn-outline-light btn-lg px-5 py-3">
              <i className="bi bi-speedometer2 me-2"></i>
              Dashboard
            </button>
          </div>

          {/* Feature Toggle */}
          <button onClick={() => setShowFeatures(!showFeatures)} className="btn btn-link text-muted">
            {showFeatures ? 'Hide Features' : 'View Features'}
            <i className={`bi ${showFeatures ? 'bi-chevron-up' : 'bi-chevron-down'} ms-2`}></i>
          </button>
        </div>
      </div>

      {/* Features Section */}
      {showFeatures && (
        <div className="container py-5">
          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-scissors display-4 text-primary-custom"></i>
                  </div>
                  <h4 className="text-white mb-3">Video Editing</h4>
                  <p className="text-muted">
                    Trim, cut, and adjust video playback speed. Import videos and export in various resolutions.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-type display-4 text-primary-custom"></i>
                  </div>
                  <h4 className="text-white mb-3">Subtitle Creation</h4>
                  <p className="text-muted">
                    Add and edit subtitles with custom styles. Preview on video in real-time.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="card h-100 border-0 shadow-sm hover-lift">
                <div className="card-body text-center p-5">
                  <div className="mb-4">
                    <i className="bi bi-gpu display-4 text-primary-custom"></i>
                  </div>
                  <h4 className="text-white mb-3">Render & Export</h4>
                  <p className="text-muted">
                    Render final video with subtitles. Export at 4K, 1080p, 720p and more.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Steps */}
          <div className="mt-5">
            <h3 className="text-center text-white mb-4">How It Works</h3>
            <div className="d-flex flex-wrap justify-content-center gap-4">
              <div className="step-card text-center p-4 bg-secondary rounded-3">
                <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>1</div>
                <h5 className="text-white">Upload Video</h5>
                <p className="text-muted small mb-0">Select video file</p>
              </div>
              <div className="step-arrow text-muted d-none d-md-flex align-items-center">
                <i className="bi bi-arrow-right fs-3"></i>
              </div>
              <div className="step-card text-center p-4 bg-secondary rounded-3">
                <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>2</div>
                <h5 className="text-white">Edit Video</h5>
                <p className="text-muted small mb-0">Trim, speed, volume</p>
              </div>
              <div className="step-arrow text-muted d-none d-md-flex align-items-center">
                <i className="bi bi-arrow-right fs-3"></i>
              </div>
              <div className="step-card text-center p-4 bg-secondary rounded-3">
                <div className="step-number bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>3</div>
                <h5 className="text-white">Add Subtitles</h5>
                <p className="text-muted small mb-0">Customize style</p>
              </div>
              <div className="step-arrow text-muted d-none d-md-flex align-items-center">
                <i className="bi bi-arrow-right fs-3"></i>
              </div>
              <div className="step-card text-center p-4 bg-secondary rounded-3">
                <div className="step-number bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '50px', height: '50px' }}>4</div>
                <h5 className="text-white">Export</h5>
                <p className="text-muted small mb-0">Render & download</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="text-white mb-4">
                  <i className="bi bi-lightning-fill text-warning me-2"></i>
                  Quick Actions
                </h5>
                <div className="d-grid gap-3">
                  <button onClick={handleStart} className="btn btn-outline-primary text-start">
                    <i className="bi bi-plus-lg me-3"></i>
                    Start New Project
                  </button>
                  <button onClick={handleDashboard} className="btn btn-outline-secondary text-start">
                    <i className="bi bi-folder me-3"></i>
                    View My Projects
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm">
              <div className="card-body">
                <h5 className="text-white mb-4">
                  <i className="bi bi-question-circle text-info me-2"></i>
                  Help & Support
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    <a href="#" className="text-muted text-decoration-none">How to use Video Editor</a>
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    <a href="#" className="text-muted text-decoration-none">Creating subtitles guide</a>
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    <a href="#" className="text-muted text-decoration-none">Export settings explained</a>
                  </li>
                  <li>
                    <i className="bi bi-check-circle text-success me-2"></i>
                    <a href="#" className="text-muted text-decoration-none">FAQ & Troubleshooting</a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center">
        <div className="container">
          <p className="text-muted mb-0">
            <i className="bi bi-film me-2"></i>
            MovieRecap Studio v1.0.0
          </p>
        </div>
      </footer>

      <style>{`
        .hero-section {
          min-height: 60vh;
          display: flex;
          align-items: center;
        }
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        .step-card {
          width: 150px;
        }
      `}</style>
    </div>
  )
}

export default GetStarted
