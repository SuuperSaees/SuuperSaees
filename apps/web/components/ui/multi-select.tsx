'use client';

import { ReactNode, useEffect, useState, useCallback } from 'react';
import { AlertCircle, Check, Plus, Search, X } from 'lucide-react';
import { Checkbox } from '@kit/ui/checkbox';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';
import { Spinner } from '@kit/ui/spinner';

export type MultiSelectOption = {
  value: string;
  label: string;
  picture_url?: string;
  [key: string]: string | number | boolean | undefined;
};

export interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void | Promise<void>;
  onSubmit?: (values: string[]) => void | Promise<void>;
  isLoading?: boolean;
  customItem?: React.ComponentType<{ option: MultiSelectOption }>;
  customTrigger?: ReactNode;
  className?: string;
  placeholder?: string;
  emptyMessage?: string;
}

export default function MultiSelect({
  options,
  selectedValues,
  onChange,
  onSubmit,
  isLoading = false,
  customItem: CustomItem,
  customTrigger,
  className = '',
  placeholder = 'Search...',
  emptyMessage = 'No results found',
}: MultiSelectProps) {
  // Local state management
  const [localSelections, setLocalSelections] = useState<Set<string>>(new Set(selectedValues));
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  
  // Derived state - calculate if there are unsaved changes
  const hasChanges = useCallback(() => {
    if (localSelections.size !== selectedValues.length) return true;
    return selectedValues.some(value => !localSelections.has(value));
  }, [localSelections, selectedValues]);

  // Reset status after showing feedback
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Update local selections when prop changes (for controlled component behavior)
  useEffect(() => {
    setLocalSelections(new Set(selectedValues));
  }, [selectedValues]);

  // Filter options based on search term - memoize if options list is large
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle selection changes
  const toggleSelection = useCallback((value: string) => {
    setLocalSelections(prev => {
      const updated = new Set(prev);
      if (updated.has(value)) {
        updated.delete(value);
      } else {
        updated.add(value);
      }
      return updated;
    });
  }, []);

  // Handle saving changes
  const saveChanges = useCallback(async () => {
    if (!hasChanges()) return;
    
    try {
      setStatus('submitting');
      const newValues = Array.from(localSelections);
      
      // Use onSubmit if provided, otherwise use onChange
      if (onSubmit) {
        await onSubmit(newValues);
      } else {
        await onChange(newValues);
      }
      
      setStatus('success');
    } catch (error) {
      console.error('Error updating selections:', error);
      // Revert to original values on error
      setLocalSelections(new Set(selectedValues));
      setStatus('error');
    }
  }, [localSelections, selectedValues, onChange, onSubmit, hasChanges]);

  // Handle popover state changes
  const handleOpenChange = useCallback(async (open: boolean) => {
    if (isOpen && !open && hasChanges()) {
      await saveChanges();
    }

    setIsOpen(open);

    // Reset search when opening
    if (open) {
      setSearchTerm('');
    }
  }, [isOpen, hasChanges, saveChanges]);

  // Render status icon
  const renderStatusIcon = () => {
    switch (status) {
      case 'submitting':
        return <Spinner className="h-4 w-4" />;
      case 'success':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Plus className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild={!!customTrigger}>
        {customTrigger ? (
          customTrigger
        ) : (
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full border-none bg-slate-50 text-slate-500 transition-all duration-200 hover:shadow-sm"
            disabled={status === 'submitting'}
            aria-label="Select options"
          >
            {renderStatusIcon()}
          </button>
        )}
      </PopoverTrigger>
      <PopoverContent
        className={`min-w-80 overflow-hidden p-0 ${className}`}
        align="start"
        sideOffset={4}
      >
        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 border-gray-100 bg-gray-50/50 pl-9 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
              aria-label="Search options"
            />
          </div>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <Spinner className="h-5 w-5" />
            </div>
          ) : (
            <div className="max-h-[250px] overflow-y-auto" role="listbox">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const isSelected = localSelections.has(option.value);
                  return (
                    <div
                      key={option.value}
                      className="flex flex-row items-center space-x-3 rounded-md px-2 py-1.5 text-gray-500 hover:bg-gray-50 cursor-pointer"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => toggleSelection(option.value)}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelection(option.value)}
                        id={`option-${option.value}`}
                        className="mt-0.5"
                        // Prevent click propagation to avoid double-toggling
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        {CustomItem ? (
                          <CustomItem option={option} />
                        ) : (
                          <span>{option.label}</span>
                        )}
                      </div>
                      {isSelected && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelection(option.value);
                          }}
                          className="text-gray-400 hover:text-gray-600"
                          aria-label={`Remove ${option.label}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="py-8 text-center text-sm text-gray-400">
                  {emptyMessage}
                </p>
              )}
            </div>
          )}
        </div>
        {hasChanges() && (
          <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 p-3 text-xs text-gray-500">
            <span>You have unsaved changes</span>
            <span className="text-gray-400">Close to save</span>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}