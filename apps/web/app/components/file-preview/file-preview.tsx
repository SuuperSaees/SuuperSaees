import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@kit/ui/button';
import { getFileType, canPreviewFile } from '../../lib/file-types';
import { LoadingRenderer, renderers, type FileRendererProps } from './renderers';

const FilePreview: React.FC<FileRendererProps> = ({
  src,
  fileName,
  fileType,
  className = '',
  isDialog = false,
  isLoading = false,
  onDownload,
  renderAs = 'inline'
}) => {
  const type = getFileType(fileType, fileName.split('.').pop());
  const canPreview = canPreviewFile(type);

  if (isLoading) {
    return <LoadingRenderer {...{ src, fileName, fileType, className }} />;
  }
  const Component = renderers[type];
  const props = { src, fileName, fileType, className, isDialog, renderAs };

  return (
    <div className={`relative ${className}`}>
      <Component {...props} />
      {!canPreview && isDialog && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/90">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      )}
    </div>
  );
};

export default FilePreview; 