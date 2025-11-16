'use client';

import { SearchIcon, X, Tag, CheckSquare, Square } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

import { Badge } from '@kit/ui/badge';
import { Button } from '@kit/ui/button';
import { FormControl, FormField, FormItem } from '@kit/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

// Define search fields
export type SearchField = 'name' | 'email' | 'all';

export const FiltersSchema = z.object({
  type: z.enum(['all', 'team', 'personal']),
  query: z.string().default(''),
  created_after: z.string().default(''),
  search_fields: z.array(z.enum(['name', 'email', 'all'])).default(['all']),
});

type SearchInputProps = {
  form: UseFormReturn<z.infer<typeof FiltersSchema>>;
  searchFields: SearchField[];
  setSearchFields: React.Dispatch<React.SetStateAction<SearchField[]>>;
  onSubmit: (values: z.infer<typeof FiltersSchema>) => void;
};

export function SearchInput({ form, searchFields, setSearchFields, onSubmit }: SearchInputProps) {
  const toggleSearchField = (field: SearchField) => {
    setSearchFields(prev => {
      // If toggling 'all', either select only 'all' or remove it
      if (field === 'all') {
        return prev.includes('all') ? prev.filter(f => f !== 'all') : ['all'];
      }
      
      // If 'all' is currently selected, remove it when selecting a specific field
      let newFields = prev.includes('all') ? [] : [...prev];
      
      // Toggle the specific field
      if (newFields.includes(field)) {
        newFields = newFields.filter(f => f !== field);
      } else {
        newFields.push(field);
      }
      
      // If no fields selected, default to 'all'
      if (newFields.length === 0) {
        return ['all'];
      }
      
      return newFields;
    });
  };

  return (
    <div className="relative flex-grow min-w-[200px]">
      <FormField
        name="query"
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <FormControl>
                <div className="flex items-center pl-10 pr-16 w-full h-10 rounded-md border border-input bg-background text-sm ring-offset-background focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0">
                  <input
                    className="flex h-full w-full bg-transparent px-0 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder={searchFields.includes('all') ? 'Search accounts...' : 'Search...'}
                    {...field}
                  />
                  {/* Selected field badges - moved to the right */}
                  {!searchFields.includes('all') && searchFields.length > 0 && (
                    <div className="flex gap-1 ml-1 mr-6 flex-shrink-0">
                      {searchFields.map(field => (
                        <Badge 
                          key={field} 
                          variant="secondary" 
                          className="px-1.5 py-0.5 text-xs flex items-center gap-1 bg-gray-100"
                        >
                          {field}
                          <button
                            type="button"
                            onClick={() => toggleSearchField(field)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                {field.value && (
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('query', '');
                      void form.trigger('query');
                      onSubmit(form.getValues());
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </FormItem>
        )}
      />
      
      {/* Search fields dropdown */}
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute right-10 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          >
            <Tag className="h-3.5 w-3.5 text-gray-500" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-2" align="end">
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Search in fields</h4>
            <div className="space-y-1">
              <div 
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleSearchField('all')}
              >
                {searchFields.includes('all') ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">All fields</span>
              </div>
              <div 
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleSearchField('name')}
              >
                {searchFields.includes('name') && !searchFields.includes('all') ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">Name</span>
              </div>
              <div 
                className="flex items-center space-x-2 p-1 rounded hover:bg-gray-100 cursor-pointer"
                onClick={() => toggleSearchField('email')}
              >
                {searchFields.includes('email') && !searchFields.includes('all') ? (
                  <CheckSquare className="h-4 w-4 text-primary" />
                ) : (
                  <Square className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">Email</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 