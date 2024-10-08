import { Checkbox } from '@kit/ui/checkbox';
import React from 'react';

interface Item {
    value: string,
    label: string,
}

interface CheckboxListProps {
    items: Item[],
    title: string,
    description: string,
}

export function CheckboxList({ items, title, description }: CheckboxListProps) {
    return (
        <div className="space-y-8">
            <div className="mb-4">
                <label className="text-base">{title}</label>
            </div>
            <div className="mb-4">
                <label className="text-base">{description}</label>
            </div>
            {items.map((item) => (
                <div
                    key={item.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                >
                    <div>
                        <Checkbox />
                    </div>
                    <label className="text-sm font-normal">
                        {item.label}
                    </label>
                </div>
            ))}
        </div>
    );
}