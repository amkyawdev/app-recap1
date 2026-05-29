import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import GetStarted from './pages/GetStarted'
import Dashboard from './pages/Dashboard'
import VideoEditor from './pages/VideoEditor'
import SubtitlesEditor from './pages/SubtitlesEditor'
import RenderPage from './pages/RenderPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black-custom">
        <Routes>
          <Route path="/" element={<GetStarted />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<VideoEditor />} />
          <Route path="/subtitles" element={<SubtitlesEditor />} />
          <Route path="/render" element={<RenderPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App
