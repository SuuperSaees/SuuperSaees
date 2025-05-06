'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  return (
    <div className="relative flex flex-1 md:grow-0">
      <SearchInput
        placeholder={t('search')}
        value={searchTerm}
        onChange={handleInputChange}
        className="w-[200px] lg:w-[320px]"
      />
    </div>
  );
};

export default Search;
