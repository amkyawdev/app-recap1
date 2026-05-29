import React, { useState, useEffect } from 'react'
import { Capacitor } from '@capacitor/core'
import { Filesystem, Directory } from '@capacitor/filesystem'

const InstallPrompt = () => {
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalling, setIsInstalling] = useState(false)
  const [installStatus, setInstallStatus] = useState('')
  const [permissionGranted, setPermissionGranted] = useState(false)

  useEffect(() => {
    // Check if app is installed
    const isAppInstalled = localStorage.getItem('appInstalled')
    if (!isAppInstalled) {
      setShowPrompt(true)
    }
    
    // Check storage permission
    checkStoragePermission()
  }, [])

  const checkStoragePermission = async () => {
    if (Capacitor.isNativePlatform()) {
      try {
        // Try to write a test file
        await Filesystem.writeFile({
          path: 'permission_test.txt',
          data: 'test',
          directory: Directory.Documents
        })
        setPermissionGranted(true)
        // Clean up test file
        await Filesystem.deleteFile({
          path: 'permission_test.txt',
          directory: Directory.Documents
        })
      } catch (error) {
        console.log('Storage permission not granted:', error)
        setPermissionGranted(false)
      }
    } else {
      // Web platform - always have access
      setPermissionGranted(true)
    }
  }

  const handleInstall = async () => {
    setIsInstalling(true)
    setInstallStatus('Preparing installation...')

    try {
      if (Capacitor.isNativePlatform()) {
        // Request storage permission
        setInstallStatus('Requesting storage permission...')
        try {
          await Filesystem.writeFile({
            path: 'install_test.txt',
            data: 'MovieRecap Studio',
            directory: Directory.Documents
          })
          await Filesystem.deleteFile({
            path: 'install_test.txt',
            directory: Directory.Documents
          })
          setPermissionGranted(true)
          setInstallStatus('Storage permission granted!')
        } catch (error) {
          setInstallStatus('Storage permission required for video editing')
          setPermissionGranted(false)
        }
      }

      // Mark as installed
      localStorage.setItem('appInstalled', 'true')
      setInstallStatus('Installation complete!')
      
      setTimeout(() => {
        setShowPrompt(false)
      }, 2000)

    } catch (error) {
      setInstallStatus('Installation failed: ' + error.message)
    }

    setIsInstalling(false)
  }

  const handleDecline = () => {
    setShowPrompt(false)
  }

  const handleSkip = () => {
    localStorage.setItem('appInstalled', 'true')
    setShowPrompt(false)
  }

  if (!showPrompt) return null

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ background: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
      <div className="card shadow-lg" style={{ maxWidth: '450px', width: '90%' }}>
        <div className="card-body p-4">
          {/* Icon */}
          <div className="text-center mb-4">
            <i className="bi bi-download display-1 text-primary-custom"></i>
          </div>

          {/* Title */}
          <h3 className="text-center mb-3">Install App</h3>
          
          {/* Description */}
          <p className="text-center text-muted mb-4">
            Install MovieRecap Studio for better performance and offline access
          </p>

          {/* Features */}
          <ul className="list-unstyled mb-4">
            <li className="mb-2">
              <i className="bi bi-check-circle text-success me-2"></i>
              <span>Better video editing performance</span>
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle text-success me-2"></i>
              <span>Offline access to your projects</span>
            </li>
            <li className="mb-2">
              <i className="bi bi-check-circle text-success me-2"></i>
              <span>Storage permission for videos</span>
            </li>
          </ul>

          {/* Permission Status */}
          {Capacitor.isNativePlatform() && (
            <div className={`alert mb-4 ${permissionGranted ? 'alert-success' : 'alert-warning'}`}>
              <i className={`bi ${permissionGranted ? 'bi-shield-check' : 'bi-exclamation-triangle'} me-2`}></i>
              {permissionGranted ? 'Storage Permission: Granted' : 'Storage Permission: Required'}
            </div>
          )}

          {/* Status */}
          {installStatus && (
            <div className="alert alert-info mb-4">
              <i className="bi bi-info-circle me-2"></i>
              {installStatus}
            </div>
          )}

          {/* Buttons */}
          <div className="d-grid gap-2">
            <button 
              className="btn btn-primary btn-lg" 
              onClick={handleInstall}
              disabled={isInstalling}
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
              className="btn btn-outline-secondary" 
              onClick={handleSkip}
            >
              <i className="bi bi-arrow-right me-2"></i>
              Continue in Browser
            </button>
            
            <button 
              className="btn btn-link text-muted" 
              onClick={handleDecline}
            >
              Not Now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstallPrompt
