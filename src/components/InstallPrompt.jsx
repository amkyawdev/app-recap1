import React, { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installStatus, setInstallStatus] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)
  const [showPermDialog, setShowPermDialog] = useState(false)

  useEffect(() => {
    const hasInstalled = localStorage.getItem('appInstalled')
    const hasPermission = localStorage.getItem('permissionGranted')
    
    if (!hasInstalled || !hasPermission) {
      setShowPrompt(true)
    }
    
    checkStoragePermission()
  }, [])

  const checkStoragePermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        await Filesystem.writeFile({
          path: 'test.txt',
          data: 'test',
          directory: Directory.Documents
        })
        await Filesystem.deleteFile({
          path: 'test.txt',
          directory: Directory.Documents
        })
        setPermissionGranted(true)
        localStorage.setItem('permissionGranted', 'true')
      } catch (error) {
        setPermissionGranted(false)
      }
    } else {
      setPermissionGranted(true)
      localStorage.setItem('permissionGranted', 'true')
    }
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    setInstallStatus('Requesting permissions...')

    try {
      if (Capacitor.isNativePlatform()) {
        try {
          await Filesystem.writeFile({
            path: 'app_data.txt',
            data: 'MovieRecap Studio v1.0',
            directory: Directory.Documents
          })
          await Filesystem.deleteFile({
            path: 'app_data.txt',
            directory: Directory.Documents
          })
          setPermissionGranted(true)
          setInstallStatus('✅ Storage permission granted!')
          localStorage.setItem('permissionGranted', 'true')
        } catch (error) {
          setShowPermDialog(true)
          setInstallStatus('⚠️ Storage permission required')
          setIsInstalling(false)
          return
        }
      }

      localStorage.setItem('appInstalled', 'true')
      setInstallStatus('✅ App installed successfully!')
      
      setTimeout(() => {
        setShowPrompt(false)
      }, 2000)

    } catch (error) {
      setInstallStatus('❌ Installation failed')
    }

    setIsInstalling(false)
  }

  const handleSkip = () => {
    localStorage.setItem('appInstalled', 'true')
    localStorage.setItem('basicMode', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(26, 10, 46, 0.98)', zIndex: 9999 }}>
      <div className="card shadow-lg purple-glow" style={{ maxWidth: '480px', width: '90%', background: 'linear-gradient(135deg, #2d1b4e 0%, #1a0a2e 100%)', border: '2px solid rgba(124, 58, 237, 0.5)' }}>
        <div className="card-body p-4">
          {/* Icon */}
          <div className="text-center mb-4">
            <i className="bi bi-download display-1" style={{ color: '#a855f7' }}></i>
          </div>

          {/* Title */}
          <h3 className="text-center text-white mb-3">Install MovieRecap Studio</h3>
          
          {/* Description */}
          <p className="text-center" style={{ color: '#9CA3AF' }}>Full app installation required for video editing</p>

          {/* Features */}
          <div className="rounded-3 p-3 mb-4" style={{ background: 'rgba(75, 0, 130, 0.3)' }}>
            <ul className="list-unstyled mb-0">
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-check-circle text-success me-3"></i>
                <span className="text-white">Video trimming & editing</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-check-circle text-success me-3"></i>
                <span className="text-white">Subtitle creation</span>
              </li>
              <li className="mb-2 d-flex align-items-center">
                <i className="bi bi-check-circle text-success me-3"></i>
                <span className="text-white">Export at any resolution</span>
              </li>
              <li className="d-flex align-items-center">
                <i className="bi bi-check-circle text-success me-3"></i>
                <span className="text-white">Storage access for videos</span>
              </li>
            </ul>
          </div>

          {/* Permission Status */}
          <div className={`alert mb-4 ${permissionGranted ? 'alert-success' : 'alert-warning'}`} style={{ background: permissionGranted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)', border: 'none' }}>
            <i className={`bi ${permissionGranted ? 'bi-shield-check' : 'bi-exclamation-triangle'} me-2`}></i>
            {permissionGranted ? 'Storage Permission: Granted' : 'Storage Permission: Required'}
          </div>

          {/* Status */}
          {installStatus && (
            <div className="alert mb-4" style={{ background: 'rgba(59, 130, 246, 0.2)', border: 'none' }}>
              <i className="bi bi-info-circle me-2"></i>
              {installStatus}
            </div>
          )}

          {/* Permission Dialog */}
          {showPermDialog && (
            <div className="alert mb-4" style={{ background: 'rgba(245, 158, 11, 0.2)', border: 'none' }}>
              <h6 className="mb-2"><i className="bi bi-exclamation-triangle me-2"></i>Permission Required</h6>
              <p className="small mb-2" style={{ color: '#9CA3AF' }}>This app needs storage permission to save videos.</p>
              <div className="d-flex gap-2">
                <button onClick={() => { handleInstall(); setShowPermDialog(false) }} className="btn btn-sm" style={{ background: '#a855f7' }}>Grant</button>
                <button onClick={() => setShowPermDialog(false)} className="btn btn-sm btn-outline-secondary">Cancel</button>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="d-grid gap-2">
            <button 
              className="btn btn-lg" 
              onClick={handleInstall}
              disabled={isInstalling}
              style={{ background: 'linear-gradient(135deg, #DC2626 0%, #7c3aed 100%)', border: 'none' }}
            >
              {isInstalling ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Installing...
                </>
              ) : (
                <>
                  <i className="bi bi-download me-2"></i>
                  Install Now
                </>
              )}
            </button>
            
            <button 
              className="btn btn-outline-light" 
              onClick={handleSkip}
            >
              <i className="bi bi-globe me-2"></i>
              Continue in Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
