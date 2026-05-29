import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import InstallPrompt from './components/InstallPrompt'
import GetStarted from './pages/GetStarted'
import Dashboard from './pages/Dashboard'
import VideoEditor from './pages/VideoEditor'
import SubtitlesEditor from './pages/SubtitlesEditor'
import RenderPage from './pages/RenderPage'

function App() {
  return (
    <BrowserRouter>
      <InstallPrompt />
      <Layout>
        <Routes>
          <Route path="/" element={<GetStarted />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/editor" element={<VideoEditor />} />
          <Route path="/subtitles" element={<SubtitlesEditor />} />
          <Route path="/render" element={<RenderPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
