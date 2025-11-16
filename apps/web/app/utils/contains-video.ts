export const containsVideo = (description: string) => {
  const videoRegex =
    /(youtube\.com|youtu\.be|instagram\.com|drive\.google\.com)/;
  return videoRegex.test(description);
};
