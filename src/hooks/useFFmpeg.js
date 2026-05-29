import { useState, useRef, useCallback } from 'react'
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile, toBlobURL } from '@ffmpeg/util'
import { 
  initializeFFmpeg, 
  trimVideo, 
  exportVideo, 
  addSubtitle,
  changePlaybackSpeed,
  extractFrames 
} from '../utils/ffmpegHelper'

export const useFFmpeg = () => {
  const [ffmpeg, setFFmpeg] = useState(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const ffmpegRef = useRef(null)

  const load = useCallback(async () => {
    if (isLoaded || isLoading) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const instance = new FFmpeg()
      ffmpegRef.current = instance
      
      instance.on('log', ({ message }) => {
        console.log('[FFmpeg]', message)
      })
      
      instance.on('progress', ({ progress, time }) => {
        console.log('[FFmpeg Progress]', Math.round(progress * 100), '%')
      })
      
      await initializeFFmpeg(instance)
      
      setFFmpeg(instance)
      setIsLoaded(true)
      setIsLoading(false)
      
      return instance
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
      console.error('FFmpeg load error:', err)
      return null
    }
  }, [isLoaded, isLoading])

  const trim = useCallback(async (inputFile, start, end, onProgress) => {
    if (!ffmpegRef.current) {
      await load()
    }
    return trimVideo(ffmpegRef.current, inputFile, start, end, onProgress)
  }, [load])

  const exportWithOptions = useCallback(async (inputFile, options, onProgress) => {
    if (!ffmpegRef.current) {
      await load()
    }
    return exportVideo(ffmpegRef.current, inputFile, options, onProgress)
  }, [load])

  const addSubtitles = useCallback(async (videoFile, subtitleFile, onProgress) => {
    if (!ffmpegRef.current) {
      await load()
    }
    return addSubtitle(ffmpegRef.current, videoFile, subtitleFile, onProgress)
  }, [load])

  const changeSpeed = useCallback(async (inputFile, speed, onProgress) => {
    if (!ffmpegRef.current) {
      await load()
    }
    return changePlaybackSpeed(ffmpegRef.current, inputFile, speed, onProgress)
  }, [load])

  const extract = useCallback(async (inputFile, timestamps, onProgress) => {
    if (!ffmpegRef.current) {
      await load()
    }
    return extractFrames(ffmpegRef.current, inputFile, timestamps, onProgress)
  }, [load])

  return {
    ffmpeg: ffmpegRef.current,
    isLoaded,
    isLoading,
    error,
    load,
    trim,
    export: exportWithOptions,
    addSubtitle: addSubtitles,
    changeSpeed,
    extractFrames: extract
  }
}

export default useFFmpeg
