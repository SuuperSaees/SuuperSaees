export const formatFileSize = (size: number): string => {
  const units = ['bytes', 'KB', 'MB', 'GB', 'TB'];
  let index = 0;
  let fileSize = size;

  while (fileSize >= 1024 && index < units.length - 1) {
    fileSize /= 1024;
    index++;
  }

  // Format to 2 decimal places for larger units, no decimals for bytes
  const formattedSize = index === 0 
    ? fileSize.toString() 
    : fileSize.toFixed(2);

  return `${formattedSize} ${units[index]}`;
};

