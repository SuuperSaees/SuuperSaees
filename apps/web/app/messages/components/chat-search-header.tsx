'use client';

import { SquarePen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
// import { Button } from '@kit/ui/button';

export default function ChatSearchHeader() {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Searching:', e.target.value);
  };

  const { t } = useTranslation('chats');

  return (
    <div className="p-4 border-b">
      <div className="relative">
        <h2 className="text-lg font-semibold">{t('chats')}</h2>
        {/*  Drop down menu */}
        <SquarePen /> 
        <input
          type="text"
          placeholder="Search"
          className="w-full px-4 py-2 pl-10 bg-gray-100 rounded-lg"
          onChange={handleSearch}
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </div>
    </div>
  );
}