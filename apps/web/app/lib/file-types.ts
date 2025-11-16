export type FileType = 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'spreadsheet' | 'presentation' | 'other';

export interface FileTypeConfig {
  canPreview: boolean;
  mimeTypes: string[];
  extensions: string[];
  previewComponent?: string;
}

export const FILE_TYPE_CONFIGS: Record<FileType, FileTypeConfig> = {
  image: {
    canPreview: true,
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif', 'image/svg+xml'],
    extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif', 'svg'],
    previewComponent: 'ImagePreview'
  },
  video: {
    canPreview: true,
    mimeTypes: ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska', 'video/webm'],
    extensions: ['mp4', 'mov', 'avi', 'mkv', 'webm'],
    previewComponent: 'VideoPreview'
  },
  audio: {
    canPreview: true,
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/aac', 'audio/x-m4a'],
    extensions: ['mp3', 'wav', 'ogg', 'aac', 'm4a'],
    previewComponent: 'AudioPreview'
  },
  pdf: {
    canPreview: true,
    mimeTypes: ['application/pdf'],
    extensions: ['pdf'],
    previewComponent: 'PDFPreview'
  },
  document: {
    canPreview: false,
    mimeTypes: [
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ],
    extensions: ['doc', 'docx', 'txt', 'rtf']
  },
  spreadsheet: {
    canPreview: false,
    mimeTypes: [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv'
    ],
    extensions: ['xls', 'xlsx', 'csv']
  },
  presentation: {
    canPreview: false,
    mimeTypes: [
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ],
    extensions: ['ppt', 'pptx']
  },
  other: {
    canPreview: false,
    mimeTypes: ['*/*'],
    extensions: ['*']
  }
};

export const getFileType = (mimeType: string, extension?: string): FileType => {
  // First try to match by mime type
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIGS)) {
    if (config.mimeTypes.some(mime => 
      mime === '*/*' || mimeType.toLowerCase().startsWith(mime.toLowerCase())
    )) {
      return type as FileType;
    }
  }

  // If no match by mime type and extension is provided, try matching by extension
  if (extension) {
    for (const [type, config] of Object.entries(FILE_TYPE_CONFIGS)) {
      if (config.extensions.some(ext => 
        ext === '*' || extension.toLowerCase() === ext.toLowerCase()
      )) {
        return type as FileType;
      }
    }
  }

  return 'other';
};

export const canPreviewFile = (fileType: FileType): boolean => {
  return FILE_TYPE_CONFIGS[fileType].canPreview;
};

export const getPreviewComponent = (fileType: FileType): string | undefined => {
  return FILE_TYPE_CONFIGS[fileType].previewComponent;
}; 