import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
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
    const { theme_color } = useOrganizationSettings();
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
        <div className="space-y-2.5">
            <style jsx>{`
                .custom-checkbox {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ccc;
                    border-radius: 4px;
                    outline: none;
                    transition: all 0.3s;
                }
                .custom-checkbox:checked {
                    border-color: ${theme_color ?? '#000000'};
                    background-color: ${theme_color ?? '#000000'};
                }
                .custom-checkbox:checked::before {
                    content: '✓';
                    display: block;
                    text-align: center;
                    color: white;
                    font-size: 16px;
                    line-height: 18px;
                }
            `}</style>
            <div className="mb-4">
                <p className="text-base">{question}</p>
            </div>
            {items.map((item) => (
                <div
                    key={item.value}
                    className="flex flex-row items-center space-x-3 space-y-0"
                >
                    <input
                        type="checkbox"
                        checked={selected.includes(item.value)}  
                        onChange={(e) =>
                            handleCheckboxChange(item.value, e.target.checked)
                        }
                        className="custom-checkbox h-5 w-5"
                    />
                    <p className="text-gray-500 text-md font-medium font-inter text-4 leading-6">{item.label}</p>
                </div>
            ))}
        </div>
    );
}