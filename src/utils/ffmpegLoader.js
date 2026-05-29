import { FFmpeg } from '@ffmpeg/ffmpeg'
import { toBlobURL } from '@ffmpeg/util'

let ffmpegInstance = null

export const loadFFmpeg = async () => {
  if (ffmpegInstance) return ffmpegInstance

  const ffmpeg = new FFmpeg()

  ffmpeg.on('log', ({ message }) => {
    console.log('[FFmpeg]', message)
  })

  ffmpeg.on('progress', ({ progress }) => {
    console.log('[Progress]', Math.round(progress * 100), '%')
  })

  try {
    // Try loading with proper CORS headers
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
    
    const coreURL = `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.js`
    const wasmURL = `https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd/ffmpeg-core.wasm`
    
    // Load with fetch options for CORS
    const loadCore = async () => {
      const response = await fetch(coreURL)
      const text = await response.text()
      const blob = new Blob([text], { type: 'application/javascript' })
      return URL.createObjectURL(blob)
    }
    
    const loadWasm = async () => {
      const response = await fetch(wasmURL)
      const buffer = await response.arrayBuffer()
      const blob = new Blob([buffer], { type: 'application/wasm' })
      return URL.createObjectURL(blob)
    }

    const [coreURLFinal, wasmURLFinal] = await Promise.all([loadCore(), loadWasm()])

    await ffmpeg.load({
      coreURL: coreURLFinal,
      wasmURL: wasmURLFinal,
    })

    ffmpegInstance = ffmpeg
    console.log('[FFmpeg] Loaded successfully')
    return ffmpegInstance

  } catch (error) {
    console.error('[FFmpeg] Load error:', error)
    
    // Try alternative: direct toBlobURL approach
    try {
      console.log('[FFmpeg] Trying alternative loading method...')
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
      
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      })
      
      ffmpegInstance = ffmpeg
      console.log('[FFmpeg] Loaded via toBlobURL')
      return ffmpegInstance
    } catch (error2) {
      console.error('[FFmpeg] Alternative load failed:', error2)
      
      // Try mt (multi-threaded) version
      try {
        console.log('[FFmpeg] Trying multi-threaded version...')
        const mtBaseURL = 'https://unpkg.com/@ffmpeg/core-mt@0.12.6/dist/umd'
        
        await ffmpeg.load({
          coreURL: await toBlobURL(`${mtBaseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${mtBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
          workerURL: await toBlobURL(`${mtBaseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
        })
        
        ffmpegInstance = ffmpeg
        console.log('[FFmpeg] Loaded MT version')
        return ffmpegInstance
      } catch (error3) {
        console.error('[FFmpeg] MT load failed:', error3)
        throw new Error('FFmpeg failed to load from all sources')
      }
    }
  }
}

export const getFFmpeg = () => ffmpegInstance
export const isFFmpegLoaded = () => ffmpegInstance !== null
