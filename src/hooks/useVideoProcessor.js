// Video processing hook placeholder
export const useVideoProcessor = () => {
  return {
    processVideo: async (file) => {
      console.log('Processing video:', file.name)
    }
  }
}
