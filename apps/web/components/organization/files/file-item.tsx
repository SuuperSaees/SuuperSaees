import Image from 'next/image';
import { FileIcon } from 'lucide-react';

interface File {
  id: string;
  name: string;
  type: string;
  url: string;
}

const FileItem = ({ file }: { file: File }) => (
    <div>
      <div className="flex w-[184.317px] h-[132.9px] rounded-[8.86px] bg-[#E1E2E4] items-center justify-center">
        {file.type.startsWith('image/') ? (
          <Image src={file.url} alt={file.id} width={200} height={200} className="w-full h-full object-contain px-2 rounded-[8.86px]" />
        ) : file.type.startsWith('video/') ? (
          <video className="w-full h-full object-contain px-2 rounded-[8.86px]" controls>
            <source src={file.url} type={file.type} />
            Your browser does not support the video tag.
          </video>
        ) : file.type === 'application/pdf' ? (
          <embed src={file.url} type="application/pdf" className="w-full h-full object-contain px-2 rounded-[8.86px]" />
        ) : (
          <FileIcon size={100} className=" px-2 rounded-[8.86px]" />
        )}
      </div>
      <div className='w-[184.317px] text-gray-900 text-[15.661px] font-semibold'>
        {file.name}
      </div>
    </div>
  );

export default FileItem;