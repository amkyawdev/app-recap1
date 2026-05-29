# 🎬 MovieRecap Studio

A modern, production-ready video and subtitle editor application built with React, Vite, and Tailwind CSS.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![React](https://img.shields.io/badge/React-18.2.0-61dafb)
![Tailwind](https://img.shields.io/badge/Tailwind-3.3.0-38bdf8)

## 🚀 Features

### Core Functionality
- **📹 Video Editor** - Upload, preview, and edit video files with timeline controls
- **✏️ Subtitles Editor** - Create and manage subtitle timelines with real-time preview
- **🎬 Render Engine** - Export videos in multiple formats (1080p, 720p) and codecs (MP4, MOV)
- **📊 Dashboard** - Track editing history and project status

### UI/UX Features
- **🎨 Dark Theme** - Professional dark mode interface with red accent colors
- **✨ Animations** - Smooth transitions and loading animations
- **📱 Responsive** - Mobile-first design approach
- **🧊 Glassmorphism** - Modern glass effect sidebar with backdrop blur

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| Vite 5 | Build Tool & Dev Server |
| Tailwind CSS 3 | Styling |
| React Router 6 | Client-side Routing |
| FFmpeg | Video Processing |

## 📁 Project Structure

```
movie-recap-app/
├── public/
│   └── assets/
│       ├── fonts/
│       ├── icons/
│       └── animations/
├── src/
│   ├── pages/
│   │   ├── GetStarted.jsx      # Landing page
│   │   ├── Dashboard.jsx       # Project management
│   │   ├── VideoEditor.jsx     # Video editing
│   │   ├── SubtitlesEditor.jsx # Subtitle management
│   │   └── RenderPage.jsx      # Export/render
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── SideMenu.jsx        # Sidebar menu
│   │   ├── Footer.jsx          # Footer navigation
│   │   ├── LoadingAnimation.jsx # Loading states
│   │   ├── UploadProgress.jsx  # Upload indicator
│   │   └── Timeline.jsx        # Video timeline
│   ├── hooks/
│   │   ├── useVideoProcessor.js # Video processing
│   │   └── useSubtitleSync.js   # Subtitle sync
│   ├── utils/
│   │   ├── ffmpegHelper.js     # FFmpeg utilities
│   │   └── subtitleParser.js   # SRT parser
│   └── styles/
│       └── globals.css          # Tailwind imports
├── docker/
│   ├── Dockerfile              # Container config
│   └── nginx.conf              # Web server config
└── tailwind.config.js          # Custom theme
```

## 🎨 Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Red Custom | `#DC2626` | Primary accent |
| Gray Custom | `#374151` | Secondary elements |
| Black Custom | `#111827` | Background |
| Gray Light | `#9CA3AF` | Muted text |
| Gray Dark | `#1F2937` | Cards/panels |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/amkyawdev/app-recap1.git
cd app-recap1

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker Deployment

```bash
# Build Docker image
docker build -t movie-recap-app .

# Run container
docker run -p 3000:3000 movie-recap-app
```

## 📱 Pages Overview

### 1. Get Started
Landing page with hero animation and call-to-action.

### 2. Dashboard
- Project history list
- Side menu with glassmorphism effect
- Status indicators (processing/completed)

### 3. Video Editor
- Drag-and-drop video upload
- Video preview player
- Timeline slider with playback controls

### 4. Subtitles Editor
- Side-by-side video preview
- Subtitle list with timestamps
- Drag-to-reorder functionality

### 5. Render Page
- Resolution selector (1080p/720p)
- Format selector (MP4/MOV)
- Progress bar with animation

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:

```env
VITE_API_URL=your-api-url
VITE_MAX_UPLOAD_SIZE=100MB
```

## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Aung Kyaw** - [GitHub](https://github.com/amkyawdev)

---

Made with ❤️ using React & Tailwind CSS
