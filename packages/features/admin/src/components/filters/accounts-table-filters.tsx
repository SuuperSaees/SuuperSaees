'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SearchIcon, RefreshCw } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Form } from '@kit/ui/form';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@kit/ui/tooltip';

import { SearchInput, FiltersSchema, SearchField } from './search-input';
// import { TypeFilter } from './type-filter';
import { DateFilter } from './date-filter';

type AccountsTableFiltersProps = {
  filters: z.infer<typeof FiltersSchema>;
};

export function AccountsTableFilters({ filters }: AccountsTableFiltersProps) {
  const [searchFields, setSearchFields] = useState<SearchField[]>(['all']);
  
  const form = useForm<z.infer<typeof FiltersSchema>>({
    resolver: zodResolver(FiltersSchema),
    defaultValues: {
      type: filters?.type ?? 'all',
      query: filters?.query ?? '',
      created_after: filters?.created_after ?? '',
      search_fields: filters?.search_fields ?? ['all'],
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const router = useRouter();
  const pathName = usePathname();

  // Effect to trigger search when searchFields changes
  useEffect(() => {
    // Only trigger search if there's a query
    if (form.getValues().query) {
      const currentValues = form.getValues();
      onSubmit(currentValues);
    }
  }, [searchFields]);

  const onSubmit = ({ type, query, created_after }: z.infer<typeof FiltersSchema>) => {
    const params = new URLSearchParams({
      account_type: type,
    });
    
    if (query) {
      params.append('query', query);
      
      // Add search fields to URL if not searching all fields
      if (!searchFields.includes('all')) {
        searchFields.forEach(field => {
          params.append('search_field', field);
        });
      }
    }
    
    if (created_after) {
      params.append('created_after', created_after);
    }

    const url = `${pathName}?${params.toString()}`;

    router.push(url);
  };

  const clearFilters = () => {
    form.reset({
      type: 'all',
      query: '',
      created_after: '',
      search_fields: ['all'],
    });
    setSearchFields(['all']);
    
    // Navigate directly to the base path without params
    router.push(pathName);
  };

  // Check if any filters are active
  const hasActiveFilters = 
    form.watch('type') !== 'all' || 
    !!form.watch('query') || 
    !!form.watch('created_after');

  return (
    <div className="rounded-lg py-2">
      <Form {...form}>
        <form
          className="space-y-2"
          onSubmit={form.handleSubmit((data) => onSubmit(data))}
        >
          <div className="flex items-center gap-2 flex-wrap md:flex-nowrap">
            {/* Search input with field selector */}
            <SearchInput 
              form={form} 
              searchFields={searchFields} 
              setSearchFields={setSearchFields} 
              onSubmit={onSubmit} 
            />
            
            {/* Compact filter buttons */}
            <div className="flex items-center gap-1.5">
              {/* Type filter */}
              {/* <TypeFilter form={form} onSubmit={onSubmit} /> */}
              
              {/* Date filter */}
              <DateFilter form={form} onSubmit={onSubmit} />
              
              {/* Search button */}
              <Button 
                type="submit" 
                size="sm"
                className="h-10"
              >
                <SearchIcon className="h-4 w-4 mr-1.5" />
                Search
              </Button>
              
              {/* Clear filters button */}
              {hasActiveFilters && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={clearFilters}
                        className="h-10 w-10 text-gray-500 hover:text-gray-700"
                      >
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Clear all filters</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
} 