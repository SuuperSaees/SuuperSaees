"use client"

import React, { useState, useEffect } from 'react';

interface Item {
    value: string;
    label: string;
}

interface DropdownProps {
    items: Item[];
    question: string;
    selectedOption: string;  
    onChange: (selected: string) => void;  
}

export function SingleChoiceDropdown({
    items,
    question,
    selectedOption,
    onChange
}: DropdownProps) {
    const [selected, setSelected] = useState<string>(selectedOption);
    const [isOpen, setIsOpen] = useState<boolean>(false);

    useEffect(() => {
        setSelected(selectedOption);  
    }, [selectedOption]);

    const handleOptionSelect = (value: string) => {
        setSelected(value);
        onChange(value); 
        setIsOpen(false); 
    };

    return (
        <div className="relative">
            <div className="mb-4">
                <p className="text-base">{question}</p>
            </div>
            <div className="border border-gray-300 rounded-md" onClick={() => setIsOpen(!isOpen)}>
                <div className="p-2">
                    {selected ? items.find(item => item.value === selected)?.label : "Select an option"}
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg w-full">
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className={`p-2 hover:bg-gray-100 cursor-pointer ${selected === item.value ? 'bg-gray-200' : ''}`}
                            onClick={() => handleOptionSelect(item.value)}
                        >
                            {item.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
