
import React from 'react';

interface FolderItemProps {
  folder: {
    title: string;
  };
  onClick: () => void;
}

const FolderItem: React.FC<FolderItemProps> = ({ folder, onClick }) => (
    <div>
      <div
        className="flex w-[184.317px] p-[32.526px_62.644px_42.548px_63.848px] justify-center items-center rounded-[8.86px] bg-[#E1E2E4] cursor-pointer"
        onClick={onClick}
      >
        <img src="https://ygxrahspvgyntzimoelc.supabase.co/storage/v1/object/public/account_image/folder-icon.svg" alt="folder" />
      </div>
      <div className='text-gray-900 text-[15.661px] w-[184.317px] font-semibold leading-[38.55px] cursor-pointer' onClick={onClick}>
        {folder.title}
      </div>
    </div>
  );

export default FolderItem;