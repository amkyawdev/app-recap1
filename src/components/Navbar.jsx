import React from 'react'

const Navbar = () => {
  return (
    <nav className="navbar navbar-dark bg-gray-dark sticky-top">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1 text-primary-custom">
          <i className="bi bi-film me-2"></i>MovieRecap Studio
        </span>
        <div className="d-flex gap-2">
          <a className="btn btn-sm btn-outline-light" href="/dashboard">
            <i className="bi bi-house me-1"></i>Dashboard
          </a>
          <a className="btn btn-sm btn-outline-light" href="/editor">
            <i className="bi bi-film me-1"></i>Editor
          </a>
          <a className="btn btn-sm btn-outline-light" href="/render">
            <i className="bi bi-gpu me-1"></i>Render
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
