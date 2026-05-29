import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()

  const menuItems = [
    { path: '/', icon: 'bi-house', name: 'Get Started' },
    { path: '/dashboard', icon: 'bi-speedometer2', name: 'Dashboard' },
    { path: '/editor', icon: 'bi-film', name: 'Video Editor' },
    { path: '/subtitles', icon: 'bi-type', name: 'Subtitles' },
    { path: '/render', icon: 'bi-gpu', name: 'Render' },
  ]

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)
  const closeMenu = () => setIsMenuOpen(false)

  return (
    <div className="app-layout">
      {/* Fixed Menu Button */}
      <button 
        className="menu-toggle-btn position-fixed top-0 start-0 m-3 z-1050"
        onClick={toggleMenu}
        style={{ zIndex: 1050 }}
      >
        <i className={`bi ${isMenuOpen ? 'bi-x-lg' : 'bi-list'} fs-4`}></i>
      </button>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div 
          className="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-60"
          style={{ zIndex: 1055 }}
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Menu */}
      <nav 
        className={`sidebar-menu position-fixed top-0 start-0 h-100 bg-dark border-end border-secondary ${isMenuOpen ? 'open' : ''}`}
        style={{ zIndex: 1060, width: '280px', transform: isMenuOpen ? 'translateX(0)' : 'translateX(-100%)', transition: 'transform 0.3s ease' }}
      >
        <div className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="text-primary-custom mb-0">
              <i className="bi bi-grid-3x3-gap me-2"></i>Menu
            </h4>
            <button className="btn btn-outline-light btn-sm" onClick={closeMenu}>
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <ul className="nav flex-column">
            {menuItems.map(item => (
              <li className="nav-item" key={item.path}>
                <Link 
                  to={item.path} 
                  className={`nav-link py-3 px-3 rounded d-flex align-items-center gap-3 ${location.pathname === item.path ? 'bg-primary text-white' : 'text-light-custom'}`}
                  onClick={closeMenu}
                >
                  <i className={`bi ${item.icon} fs-5`}></i>
                  <span>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>

          <hr className="border-secondary my-4" />

          <div className="text-light-custom small">
            <p className="mb-1"><i className="bi bi-film me-2"></i>MovieRecap Studio</p>
            <p className="text-muted small">Version 1.0.0</p>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className={`main-content ${isMenuOpen ? 'menu-open' : ''}`} style={{ transition: 'margin-left 0.3s ease' }}>
        {children}
      </main>

      <style>{`
        .menu-toggle-btn {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          border: none;
          background: var(--primary);
          color: white;
          font-size: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(220, 38, 38, 0.4);
          transition: all 0.3s ease;
        }
        .menu-toggle-btn:hover {
          background: #b91c1c;
          transform: scale(1.05);
        }
        .menu-toggle-btn:active {
          transform: scale(0.95);
        }
        .nav-link:hover {
          background: rgba(220, 38, 38, 0.2) !important;
        }
      `}</style>
    </div>
  )
}

export default Layout
