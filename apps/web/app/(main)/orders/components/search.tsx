'use client';

import { useCallback, useEffect, useState } from 'react';

import SearchInput from '~/components/ui/search-input';

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

  // Update local state when defaultSearch changes
  useEffect(() => {
    setSearchTerm(defaultSearch ?? '');
  }, [defaultSearch]);

  // Debounce search and trigger when the value changes
  useEffect(() => {
    const timer = setTimeout(() => {
      // Always trigger search with whatever term the user has typed
      handleSearch(searchTerm);
    }, 500); // 500ms debounce time

    return () => clearTimeout(timer);
  }, [searchTerm, handleSearch]);

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setSearchTerm(newValue);
    },
    [],
  );

  return (
   
      <SearchInput
        placeholder={t('search')}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-[200px] lg:w-[320px]"
      />
  
  );
};

export default Search;
