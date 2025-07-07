import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import React, { useState, useEffect } from 'react';

interface Item {
    value: string;
    label: string;
}

interface CheckboxProps {
    items: Item[];
    selectedOptions: string[];  
    onChange: (selected: string) => void;
    className?: string;
    useGridLayout?: boolean;
}

export function MultipleChoice({
    items,
    selectedOptions,
    onChange,
    className = '',
    useGridLayout = false
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
        <div className={`space-y-2.5 ${className}`}>
            <style>{`
                .custom-checkbox {
                    appearance: none;
                    -webkit-appearance: none;
                    width: 20px;
                    height: 20px;
                    border: 2px solid #ccc;
                    border-radius: 4px;
                    outline: none;
                    transition: all 0.3s;
                    flex-shrink: 0;
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
 
            <div className={useGridLayout ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : ''}>
                {items.map((item) => (
                    <div
                        key={item.value}
                        className="flex flex-row items-center space-x-3 space-y-0"
                    >
                        <div className="flex-shrink-0 h-5 w-5">
                            <input
                                type="checkbox"
                                checked={selected.includes(item.value)}  
                                onChange={(e) =>
                                    handleCheckboxChange(item.value, e.target.checked)
                                }
                                className="custom-checkbox h-5 w-5"
                            />
                        </div>
                        <p className="text-gray-500 text-sm font-medium font-inter leading-6">{item.label}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}