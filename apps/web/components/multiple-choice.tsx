"use client"

import React, { useState, useEffect } from 'react';

interface Item {
    value: string;
    label: string;
}

interface CheckboxProps {
    items: Item[];
    question: string;
    selectedOptions: string[];  
    onChange: (selected: string) => void; 
}

export function MultipleChoice({
    items,
    question,
    selectedOptions,
    onChange
}: CheckboxProps) {
    const [selected, setSelected] = useState<string[]>(selectedOptions);

    useEffect(() => {
        setSelected(selectedOptions);  
    }, [selectedOptions]);

    const handleCheckboxChange = (value: string, checked: boolean) => {
        const updatedSelection = checked
            ? [...selected, value]  
            : selected.filter((item) => item !== value);  

        setSelected(updatedSelection);
        onChange(updatedSelection.join(', '));  
    };

    return (
        <div className="space-y-8">
            <div className="mb-4">
                <p className="text-base">{question}</p>
            </div>
            {items.map((item) => (
                <div
                    key={item.value}
                    className="flex flex-row items-start space-x-3 space-y-0"
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(item.value)}  
                        onChange={(e) =>
                            handleCheckboxChange(item.value, e.target.checked)
                        }
                    />
                    <p className="text-sm font-normal">{item.label}</p>
                </div>
            ))}
        </div>
    );
}
