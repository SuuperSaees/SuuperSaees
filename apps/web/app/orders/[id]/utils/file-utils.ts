import { toast } from 'sonner';

export const handleFileDownload = async (src: string, fileName: string) => {
  try {
    const response = await fetch(src);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    toast.error('Error al descargar el archivo');
  }
};

export const handleCopyLink = async (src: string, setIsLinkCopied: (value: boolean) => void) => {
  try {
    await navigator.clipboard.writeText(src);
    setIsLinkCopied(true);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setIsLinkCopied(false), 2000);
  } catch (error) {
    console.error('Error al copiar el link:', error);
    setIsLinkCopied(false);
    toast.error('Error al copiar el link');
  }
};

export const scales = [
  {
    value: "0.25x",
    label: "25%",
  },
  {
    value: "0.5x",
    label: "50%",
  },
  {
    value: "0.75x",
    label: "75%",
  },
  {
    value: "1x",
    label: "100%",
  },
  {
    value: "1.5x",
    label: "150%",
  },
  {
    value: "2x",
    label: "200%",
  },
  {
    value: "2.5x",
    label: "250%",
  },
  {
    value: "3x",
    label: "300%",
  },
]

