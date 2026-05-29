// FFmpeg helper utilities
export const ffmpegCommand = (input, output, options) => {
  return `ffmpeg -i ${input} ${options} ${output}`
}
