// Subtitle synchronization hook placeholder
export const useSubtitleSync = () => {
  return {
    syncSubtitles: async (subtitles, videoTime) => {
      console.log('Syncing subtitles at', videoTime)
    }
  }
}
