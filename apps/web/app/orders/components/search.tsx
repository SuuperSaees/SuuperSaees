'use client';

import { useCallback, useEffect, useState, useRef } from 'react';

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
  const isInitialMount = useRef(true);
  const previousSearchTerm = useRef(searchTerm);
  
  // Apply the search only on initial mount if defaultSearch exists
  useEffect(() => {
    if (isInitialMount.current && defaultSearch) {
      isInitialMount.current = false;
      // Don't trigger search on mount as the parent already has this value
    }
  }, [defaultSearch]);
  
  // Debounce search and only trigger when the value actually changes
  useEffect(() => {
    // Skip the first render and when the search term hasn't changed
    if (isInitialMount.current || previousSearchTerm.current === searchTerm) {
      isInitialMount.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      handleSearch(searchTerm);
      previousSearchTerm.current = searchTerm;
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);
  
  // Handle input change without directly triggering search
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  return (
    <div className="relative flex flex-1 md:grow-0">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <ThemedInput
        type="search"
        placeholder={t('searchPlaceholderTasks')}
        className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
        value={searchTerm}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default Search;
