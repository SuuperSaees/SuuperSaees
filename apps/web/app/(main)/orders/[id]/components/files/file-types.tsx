import { StickyNote } from 'lucide-react';
import { PDFIcon, DOCIcon, DOCXIcon, TXTIcon, CSVIcon, XLSIcon, XLSXIcon, PPTIcon, PPTXIcon, FIGIcon, AIIcon, PSDIcon, INDDIcon, AEPIcon, HTMLIcon, CSSIcon, RSSIcon, SQLIcon, JSIcon, JSONIcon, JAVAIcon, XMLIcon, EXEIcon, DMGIcon, ZIPIcon, RARIcon, MP3Icon, MP4Icon, WAVIcon, AVIIcon, MKVIcon, MPEGIcon } from '../../components/file-icons';

const fileTypeIcons: Record<string, JSX.Element> = {
  pdf: <PDFIcon />,
  doc: <DOCIcon />,
  docx: <DOCXIcon />,
  txt: <TXTIcon />,
  csv: <CSVIcon />,
  xls: <XLSIcon />,
  xlsx: <XLSXIcon />,
  ppt: <PPTIcon />,
  pptx: <PPTXIcon />,
  fig: <FIGIcon />,
  ai: <AIIcon />,
  psd: <PSDIcon />,
  indd: <INDDIcon />,
  aep: <AEPIcon />,
  html: <HTMLIcon />,
  css: <CSSIcon />,
  rss: <RSSIcon />,
  sql: <SQLIcon />,
  js: <JSIcon />,
  json: <JSONIcon />,
  java: <JAVAIcon />,
  xml: <XMLIcon />,
  exe: <EXEIcon />,
  dmg: <DMGIcon />,
  zip: <ZIPIcon />,
  rar: <RARIcon />,
  mp3: <MP3Icon />,
  mp4: <MP4Icon />,
  wav: <WAVIcon />,
  avi: <AVIIcon />,
  mkv: <MKVIcon />,
  mpeg: <MPEGIcon />,
};

export const getFileTypeIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase() ?? '';
  return fileTypeIcons[extension] ?? <StickyNote className="text-gray-500 h-[56px] w-[40px]" />;
};