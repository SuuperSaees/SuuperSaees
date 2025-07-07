"use client"

import { ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

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
    selectedOption,
    onChange
}: DropdownProps) {
    const [selected, setSelected] = useState<string>(selectedOption);
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const { t } = useTranslation();

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
            <div className="border border-gray-300 rounded-md" onClick={() => setIsOpen(!isOpen)}>
                <div className="p-2 flex items-center justify-between text-gray-500 text-sm font-medium leading-6 ">
                    {selected ? items.find(item => item.value === selected)?.label : t('orders:dropdown')}
                    {isOpen ? <ChevronUp className='w-5 h-5' /> : <ChevronDown className='w-5 h-5' />}
                </div>
            </div>
            {isOpen && (
                <div className="absolute z-10 mt-1 bg-white border border-gray-300 rounded-md shadow-lg w-full">
                    {items.map((item) => (
                        <div
                            key={item.value}
                            className='flex p-[10px_14px] items-center gap-2 self-stretch rounded-md border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]"'
                            onClick={() => handleOptionSelect(item.value)}
                        >
                            <span className='text-gray-500 text-sm font-medium leading-6 font-inter'>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
