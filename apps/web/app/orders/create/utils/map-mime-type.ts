import { File } from '~/lib/file.types';

type FileType = File.Type['type'];

export const mapMimeTypeToFileType = (mimeType: string): FileType => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType.startsWith('video/')) {
    return 'video';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else if (mimeType === 'application/vnd.figma') {
    return 'fig';
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
};
