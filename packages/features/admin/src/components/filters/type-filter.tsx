'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Users, User } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { FiltersSchema } from './search-input';

type TypeFilterProps = {
  form: UseFormReturn<z.infer<typeof FiltersSchema>>;
  onSubmit: (values: z.infer<typeof FiltersSchema>) => void;
};

export function TypeFilter({ form, onSubmit }: TypeFilterProps) {
  const [isTypeFilterOpen, setIsTypeFilterOpen] = useState(false);

  // Get account type icon
  const getTypeIcon = () => {
    switch(form.watch('type')) {
      case 'team':
        return <Users className="h-3.5 w-3.5 mr-1" />;
      case 'personal':
        return <User className="h-3.5 w-3.5 mr-1" />;
      default:
        return null;
    }
  };

  return (
    <Popover open={isTypeFilterOpen} onOpenChange={setIsTypeFilterOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant="outline"
          size="sm"
          className={`h-10 px-3 transition-all duration-200 group ${
            form.watch('type') === 'team' 
              ? 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100' 
              : form.watch('type') === 'personal'
                ? 'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100'
                : ''
          }`}
        >
          {form.watch('type') !== 'all' ? (
            <div className="flex items-center">
              {getTypeIcon()}
              <span className="capitalize">{form.watch('type')}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1.5 text-gray-500" />
              <span>All accounts</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-40 p-1" align="center">
        <div 
          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            form.setValue('type', 'all');
            void form.trigger('type');
            setIsTypeFilterOpen(false);
            onSubmit(form.getValues());
          }}
        >
          <Users className="h-4 w-4 text-gray-500" />
          <span className="text-sm">All accounts</span>
        </div>
        <div 
          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            form.setValue('type', 'team');
            void form.trigger('type');
            setIsTypeFilterOpen(false);
            onSubmit(form.getValues());
          }}
        >
          <Users className="h-4 w-4 text-blue-500" />
          <span className="text-sm text-blue-700">Team</span>
        </div>
        <div 
          className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 cursor-pointer"
          onClick={() => {
            form.setValue('type', 'personal');
            void form.trigger('type');
            setIsTypeFilterOpen(false);
            onSubmit(form.getValues());
          }}
        >
          <User className="h-4 w-4 text-purple-500" />
          <span className="text-sm text-purple-700">Personal</span>
        </div>
      </PopoverContent>
    </Popover>
  );
} 