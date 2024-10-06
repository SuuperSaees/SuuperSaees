"use client"

// import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import React from 'react';
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage, } from '@kit/ui/form';
import { Button } from '@kit/ui/button';
import { Checkbox } from '@kit/ui/checkbox';


interface Item {
    value: string,
    label: string,
}

interface CheckboxReactHookFormMultipleProps {
    items: Item[],
    question: string,
}

const FormSchema = z.object({
items: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one item.",
}),
})

export function CheckboxReactHookFormMultiple({ items, question }: CheckboxReactHookFormMultipleProps){
    // const { t } = useTranslation('organizations');
    const form = useForm<z.infer<typeof FormSchema>>({
      resolver: zodResolver(FormSchema),
      // Here you can set the default values for the form
      defaultValues: {
        items: items.length > 0 ? [items[0]!.value] : [],
    },
    })
   
    function onSubmit(data: z.infer<typeof FormSchema>) {
        toast.success(`Form submitted successfully ${JSON.stringify(data)}`);
    }

    return (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="items"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">{question}</FormLabel>
                  </div>
                  {items.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="items"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.value}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item.value)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, item.value])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== item.value
                                        )
                                      )
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal">
                              {item.label}
                            </FormLabel>
                          </FormItem>
                        )
                      }}
                    />
                  ))}
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Submit</Button>
          </form>
        </Form>
    
      )
  }