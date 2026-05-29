import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpegInstance = null

export const loadFFmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance

  const ffmpeg = new FFmpeg()
  
  // Set up event handlers
  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })
  
  ffmpeg.on('progress', ({ progress }) => {
    console.log('[FFmpeg Progress]', Math.round(progress * 100), '%')
  })

  try {
    // Try different CDN URLs
    const cdnUrls = [
      'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd',
      'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/umd',
      'https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd'
    ]

    let loaded = false
    for (const baseURL of cdnUrls) {
      try {
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        })
        loaded = true
        ffmpegInstance = ffmpeg
        console.log('[FFmpeg] Loaded from:', baseURL)
        break
      } catch (e) {
        console.log('[FFmpeg] Failed to load from:', baseURL)
        continue
      }
    }

    if (!loaded) {
      throw new Error('Failed to load FFmpeg from all CDN URLs')
    }

    return ffmpegInstance
  } catch (error) {
    console.error('[FFmpeg] Load error:', error)
    throw error
  }
}

export const getFFmpeg = () => ffmpegInstance

export const isFFmpegLoaded = () => ffmpegInstance !== null
