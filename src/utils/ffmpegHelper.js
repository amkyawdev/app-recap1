// FFmpeg helper utilities with real working functions

export const initializeFFmpeg = async (ffmpegInstance) => {
  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd'
  await ffmpegInstance.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  })
  return true
}

export const trimVideo = async (ffmpeg, inputFile, start, end, onProgress) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile))
  
  onProgress?.(30)
  
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-ss', start.toString(),
    '-to', end.toString(),
    '-c', 'copy',
    'output.mp4'
  ], undefined, undefined, (progress) => {
    onProgress?.(30 + progress * 50)
  })
  
  onProgress?.(80)
  
  const data = await ffmpeg.readFile('output.mp4')
  return new Blob([data], { type: 'video/mp4' })
}

export const exportVideo = async (ffmpeg, inputFile, options, onProgress) => {
  const { resolution, quality, format } = options
  const resolutions = {
    '4k': '3840:2160',
    '1080p': '1920:1080',
    '720p': '1280:720',
    '480p': '854:480'
  }
  
  const qualitySettings = {
    high: { crf: 18, preset: 'slow', bitrate: '5000k' },
    medium: { crf: 23, preset: 'medium', bitrate: '2500k' },
    low: { crf: 28, preset: 'fast', bitrate: '1000k' }
  }
  
  await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile))
  onProgress?.(10)
  
  const scale = resolutions[resolution] || resolutions['1080p']
  const { crf, preset, bitrate } = qualitySettings[quality] || qualitySettings.medium
  
  const args = [
    '-i', 'input.mp4',
    '-vf', `scale=${scale}`,
    '-c:v', 'libx264',
    '-preset', preset,
    '-crf', crf.toString(),
    '-b:v', bitrate,
    '-c:a', 'aac',
    '-b:a', '192k'
  ]
  
  if (format === 'webm') {
    args.push('-f', 'webm')
  }
  
  args.push('output.mp4')
  
  await ffmpeg.exec(args, undefined, undefined, (progress) => {
    onProgress?.(10 + progress * 80)
  })
  
  onProgress?.(90)
  
  const data = await ffmpeg.readFile('output.mp4')
  return new Blob([data], { type: 'video/mp4' })
}

export const addSubtitle = async (ffmpeg, videoFile, subtitleFile, onProgress) => {
  await ffmpeg.writeFile('video.mp4', await fetchFile(videoFile))
  await ffmpeg.writeFile('subtitles.srt', await fetchFile(subtitleFile))
  
  onProgress?.(30)
  
  await ffmpeg.exec([
    '-i', 'video.mp4',
    '-vf', `subtitles=subtitles.srt`,
    '-c:a', 'copy',
    'output.mp4'
  ], undefined, undefined, (progress) => {
    onProgress?.(30 + progress * 60)
  })
  
  onProgress?.(90)
  
  const data = await ffmpeg.readFile('output.mp4')
  return new Blob([data], { type: 'video/mp4' })
}

export const changePlaybackSpeed = async (ffmpeg, inputFile, speed, onProgress) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile))
  
  onProgress?.(20)
  
  const pts = 1 / speed
  await ffmpeg.exec([
    '-i', 'input.mp4',
    '-filter:v', `setpts=${pts}*PTS`,
    '-af', `atempo=${Math.min(Math.max(speed, 0.5), 2)}`,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    'output.mp4'
  ], undefined, undefined, (progress) => {
    onProgress?.(20 + progress * 70)
  })
  
  onProgress?.(90)
  
  const data = await ffmpeg.readFile('output.mp4')
  return new Blob([data], { type: 'video/mp4' })
}

export const extractFrames = async (ffmpeg, inputFile, timestamps, onProgress) => {
  await ffmpeg.writeFile('input.mp4', await fetchFile(inputFile))
  
  const frames = []
  const total = timestamps.length
  
  for (let i = 0; i < total; i++) {
    onProgress?.((i / total) * 100)
    const time = timestamps[i]
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-ss', time.toString(),
      '-vframes', '1',
      '-f', 'image2',
      `frame_${i}.jpg`
    ])
    const data = await ffmpeg.readFile(`frame_${i}.jpg`)
    frames.push(new Blob([data], { type: 'image/jpeg' }))
  }
  
  return frames
}
