import { useRef, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
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
  const [expanded, setExpanded] = useState(false);
  const [overlayTop, setOverlayTop] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const iconRef = useRef<HTMLButtonElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (expanded && inputRef.current) {
      inputRef.current.focus();
    }
  }, [expanded]);

  // Outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        expanded &&
        overlayRef.current &&
        !overlayRef.current.contains(event.target as Node) &&
        iconRef.current &&
        !iconRef.current.contains(event.target as Node)
      ) {
        setExpanded(false);
      }
    };

    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [expanded]);

  const handleExpand = () => {
    if (iconRef.current) {
      const rect = iconRef.current.getBoundingClientRect();
      console.log('height', rect.height)
      setOverlayTop(rect.height + 4); // 4px gap
    }
    setExpanded(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setExpanded(false);
    }
  };

  const MobileOverlay = () => (
    <div
      ref={overlayRef}
      className="absolute top-0 left-0 right-0 z-50 bg-white shadow-md flex items-center px-4 py-2 transition-transform duration-300 md:hidden animate-in fade-in slide-in-from-top-4"
      style={{ top: overlayTop }}
    >
      <Search className="h-5 w-5 text-gray-500 mr-2" />
      <ThemedInput
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        aria-label={placeholder}
        className="flex-1 px-2 py-2"
      />
      <button
        type="button"
        aria-label="Close search"
        onClick={() => setExpanded(false)}
        className="ml-2 p-1 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <X className="h-5 w-5 text-gray-500" />
      </button>
    </div>
  );

  return (
    <>
      {/* Desktop: always show input inline */}
      <div className={cn('relative hidden md:flex items-center w-[280px]', className)}>
        <ThemedInput
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          aria-label={placeholder}
          className="w-full px-4 py-2 pl-10"
        />
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 pointer-events-none" />
      </div>
      {/* Mobile: icon button with ref - always visible */}
      <button
        ref={iconRef}
        type="button"
        aria-label="Open search"
        onClick={handleExpand}
        className="md:hidden p-2 rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Search className="h-5 w-5 text-gray-500" />
      </button>
      {expanded && <MobileOverlay />}
    </>
  );
};

export default SearchInput;
