import { useState } from 'react';
import { Download, Check, Copy, Eye } from 'lucide-react';
import Tooltip from '~/components/ui/tooltip';

const handleDownload = async (url: string) => {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch file');
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = url.split('/').pop() ?? 'download';
    link.click();
    window.URL.revokeObjectURL(downloadUrl);
  } catch (error) {
    console.error('Download error:', error);
  }
};

const handleCopyToClipboard = async (url: string) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    console.error('Copy error:', error);
    return false;
  }
};

export const FileActionButtons: React.FC<{
  url: string;
  children: React.ReactElement<{ className?: string }>;
}> = ({ url, children }) => {
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const onCopyClick = async () => {
    const success = await handleCopyToClipboard(url);
    if (success) {
      setIsLinkCopied(true);
      setTimeout(() => setIsLinkCopied(false), 2000);
    }
  };

  return (
    <div className="absolute right-7 top-2 hidden gap-2 group-hover:flex">
      <Tooltip content="Copy link">
        <button
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/70 text-sm hover:bg-white/90"
          onClick={onCopyClick}
        >
          {isLinkCopied ? (
            <Check className="h-[15px] w-[15px] text-green-500" />
          ) : (
            <Copy className="h-[15px] w-[15px]" />
          )}
        </button>
      </Tooltip>

      <Tooltip content="View">
        <button className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/70 text-sm hover:bg-white/90"
        onClick={() => window.open(url, '_blank')}>
          <Eye className="h-[15px] w-[15px]" />
        </button>
      </Tooltip>

      <Tooltip content="Download">
        <button
          className="flex h-[30px] w-[30px] items-center justify-center rounded-full bg-white/70 text-sm hover:bg-white/90"
          onClick={() => handleDownload(url)}
        >
          <Download className="h-[15px] w-[15px]" />
        </button>
      </Tooltip>
    </div>
  );
};