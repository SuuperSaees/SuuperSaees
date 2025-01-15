'use client';

import { useState } from 'react';

import { Search as SearchIcon } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

const Search = ({
  defaultSearch,
  handleSearch,
  t,
}: {
  defaultSearch?: string;
  handleSearch: (searchTerm: string) => void;
  t: (key: string) => string;
}) => {
  const [searchTerm, setSearchTerm] = useState(defaultSearch ?? '');
  return (
    <div className="relative flex flex-1 md:grow-0">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <ThemedInput
        type="search"
        placeholder={t('searchPlaceholderTasks')}
        className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          setSearchTerm(e.target.value)
          handleSearch(e.target.value)
        }
          
        }
      />
    </div>
  );
};

export default Search;
