// Subtitle parsing utilities
export const parseSubtitle = (srtContent) => {
  const subtitles = []
  const blocks = srtContent.split(/\n\n+/)
  blocks.forEach(block => {
    const lines = block.split('\n')
    if (lines.length >= 3) {
      const timeLine = lines[1]
      const match = timeLine.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2}),(\d{3})/)
      if (match) {
        subtitles.push({
          start: parseInt(match[1]) * 3600 + parseInt(match[2]) * 60 + parseInt(match[3]) + parseInt(match[4]) / 1000,
          end: parseInt(match[5]) * 3600 + parseInt(match[6]) * 60 + parseInt(match[7]) + parseInt(match[8]) / 1000,
          text: lines.slice(2).join('\n')
        })
      }
    }
  })
  return subtitles
}
