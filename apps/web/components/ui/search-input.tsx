import { Search } from 'lucide-react';
import { ThemedInput } from 'node_modules/@kit/accounts/src/components/ui/input-themed-with-settings';

import { cn } from '@kit/ui/utils';

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
}
const SearchInput = ({
  placeholder,
  value,
  onChange,
  className,
}: SearchInputProps) => {
  return (
    <div className={cn('relative w-[280px]', className)}>
      <ThemedInput
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 pl-10"
      />
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
    </div>
  );
};

export default SearchInput;
