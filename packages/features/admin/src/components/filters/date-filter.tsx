'use client';

import { useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { CalendarIcon, X } from 'lucide-react';
import { z } from 'zod';

import { Button } from '@kit/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@kit/ui/form';
import { Input } from '@kit/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@kit/ui/popover';

import { FiltersSchema } from './search-input';

type DateFilterProps = {
  form: UseFormReturn<z.infer<typeof FiltersSchema>>;
  onSubmit: (values: z.infer<typeof FiltersSchema>) => void;
};

export function DateFilter({ form, onSubmit }: DateFilterProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  return (
    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
      <PopoverTrigger asChild>
        <Button 
          type="button" 
          variant={form.watch('created_after') ? "default" : "outline"}
          size="sm"
          className="h-10 px-3 transition-all duration-200"
        >
          {form.watch('created_after') ? (
            <div className="flex items-center">
              <CalendarIcon className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs">{form.watch('created_after')}</span>
            </div>
          ) : (
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              <span>Date</span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3" align="center">
        <FormField
          name="created_after"
          render={({ field }) => (
            <FormItem className="space-y-1">
              <FormLabel className="text-xs">Created After</FormLabel>
              <div className="relative">
                <CalendarIcon className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <FormControl>
                  <Input
                    type="date"
                    className="pl-8 pr-8 h-8 text-sm"
                    {...field}
                  />
                </FormControl>
                {field.value && (
                  <button
                    type="button"
                    onClick={() => {
                      form.setValue('created_after', '');
                      void form.trigger('created_after');
                      onSubmit(form.getValues());
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex justify-end mt-2">
                <Button 
                  type="button" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={() => {
                    setIsDatePickerOpen(false);
                    onSubmit(form.getValues());
                  }}
                >
                  Apply
                </Button>
              </div>
            </FormItem>
          )}
        />
      </PopoverContent>
    </Popover>
  );
} 