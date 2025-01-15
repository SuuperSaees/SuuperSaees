import { Search as SearchIcon } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

const Search = ({
  searchTerm,
  setSearchTerm,
  t,
}: {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  t: (key: string) => string;
}) => {
  return (
    <div className="relative flex flex-1 md:grow-0">
      <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <ThemedInput
        type="search"
        placeholder={t('searchPlaceholderTasks')}
        className="focus-visible:ring-none w-full rounded-xl bg-white pl-8 focus-visible:ring-0 md:w-[200px] lg:w-[320px]"
        value={searchTerm}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          setSearchTerm(e.target.value)
        }
      />
    </div>
  );
};

export default Search;
