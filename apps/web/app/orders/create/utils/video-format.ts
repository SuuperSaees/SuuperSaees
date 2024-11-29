export const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.includes('youtube.com')
        ? url.split('v=')[1]
        : url.split('youtu.be/')[1];
    return `https://www.youtube.com/embed/${videoId}`;
};