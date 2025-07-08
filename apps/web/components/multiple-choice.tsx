'use client';

import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';

// Helper functions for managing the "other" option
const OTHER_OPTION_PREFIX = 'suuper-custom';

const isOtherOption = (label: string): boolean => {
  return label.startsWith(OTHER_OPTION_PREFIX);
};

const getDisplayLabel = (label: string, t: (key: string) => string): string => {
  if (isOtherOption(label)) {
    return t('creation.form.marks.other_option_label');
  }
  return label;
};

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
    question?: string;
}

export function MultipleChoice({
    items,
    selectedOptions,
    onChange,
    className = '',
    useGridLayout = false
}: CheckboxProps) {
    const { theme_color } = useOrganizationSettings();
    const [optimisticSelected, setOptimisticSelected] = useState<string[]>([]);
    const [customTexts, setCustomTexts] = useState<Record<string, string>>({});
    const lastUpdateFromUser = useRef(false);
    const { t } = useTranslation(['common', 'briefs']);
    // Parse selectedOptions to separate regular options from custom text
    const { parsedSelected, parsedCustomTexts } = useMemo(() => {
        const regularOptions: string[] = [];
        const customTextMap: Record<string, string> = {};
        
        selectedOptions.forEach(option => {
            const matchingItem = items.find(item => item.value === option);
            if (matchingItem) {
                // This is a regular option
                regularOptions.push(option);
            } else {
                // This might be custom text for an "other" option
                const otherItem = items.find(item => isOtherOption(item.label));
                if (otherItem) {
                    regularOptions.push(otherItem.value);
                    customTextMap[otherItem.value] = option;
                }
            }
        });
        
        return {
            parsedSelected: regularOptions,
            parsedCustomTexts: customTextMap
        };
    }, [selectedOptions, items]);

    // Sync optimistic state with parsed state, but be careful not to override user interactions
    useEffect(() => {
        if (lastUpdateFromUser.current) {
            // If the last update was from user interaction, don't sync immediately
            // Let the user interaction complete first
            lastUpdateFromUser.current = false;
            return;
        }
        
        // Only sync if the parsed data is actually different from our optimistic state
        const isSignificantlyDifferent = parsedSelected.length !== optimisticSelected.length ||
            parsedSelected.some(item => !optimisticSelected.includes(item)) ||
            optimisticSelected.some(item => !parsedSelected.includes(item));
            
        if (isSignificantlyDifferent) {
            setOptimisticSelected(parsedSelected);
        }
    }, [parsedSelected, optimisticSelected]);

    // Update custom texts when they change from parent
    useEffect(() => {
        setCustomTexts(prev => ({
            ...prev,
            ...parsedCustomTexts
        }));
    }, [parsedCustomTexts]);

    const buildFinalOutput = useCallback((currentSelected: string[], currentCustomTexts: Record<string, string>) => {
        return currentSelected.map(value => {
            const item = items.find(i => i.value === value);
            if (item && isOtherOption(item.label) && currentCustomTexts[value]) {
                return currentCustomTexts[value];
            }
            return value;
        });
    }, [items]);

    const handleCheckboxChange = (value: string, checked: boolean) => {
        let newSelected: string[];
        const newCustomTexts = { ...customTexts };
        
        if (checked) {
            newSelected = [...optimisticSelected, value];
        } else {
            newSelected = optimisticSelected.filter((item) => item !== value);
            // Clear custom text when unchecking "other" option
            const item = items.find(i => i.value === value);
            if (item && isOtherOption(item.label)) {
                delete newCustomTexts[value];
                setCustomTexts(newCustomTexts);
            }
        }
        
        // Mark that this update came from user interaction
        lastUpdateFromUser.current = true;
        
        // Update optimistic state immediately for UI feedback
        setOptimisticSelected(newSelected);
        
        // Build final output
        const finalOutput = buildFinalOutput(newSelected, newCustomTexts);
        onChange(finalOutput.join(', '));
    };

    const handleCustomTextChange = (value: string, customText: string) => {
        const newCustomTexts = { ...customTexts, [value]: customText };
        setCustomTexts(newCustomTexts);
        
        // Mark that this update came from user interaction
        lastUpdateFromUser.current = true;
        
        // Update output with new custom text
        const finalOutput = buildFinalOutput(optimisticSelected, newCustomTexts);
        onChange(finalOutput.join(', '));
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
 
            <div className={useGridLayout ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3' : 'space-y-2.5'}>
                {items.map((item) => {
                    const isOther = isOtherOption(item.label);
                    const isSelected = optimisticSelected.includes(item.value);
                    
                    return (
                        <div
                            key={item.value}
                            className="flex flex-col gap-2"
                        >
                            <div className="flex flex-row items-center space-x-3 space-y-0">
                                <div className="flex-shrink-0 h-5 w-5">
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) =>
                                            handleCheckboxChange(item.value, e.target.checked)
                                        }
                                        className="custom-checkbox h-5 w-5"
                                    />
                                </div>
                                <p className="text-gray-500 text-sm font-medium font-inter leading-6">
                                    {getDisplayLabel(item.label, t)}
                                </p>
                            </div>
                            {isOther && isSelected && (
                                <input
                                    type="text"
                                    value={customTexts[item.value] ?? ''}
                                    onChange={(e) => {
                                        // Only update local state, don't notify parent yet
                                        const newCustomTexts = { ...customTexts, [item.value]: e.target.value };
                                        setCustomTexts(newCustomTexts);
                                    }}
                                    onBlur={(e) => {
                                        // Notify parent when user finishes typing
                                        handleCustomTextChange(item.value, e.target.value);
                                    }}
                                    placeholder={t('pleaseSpecify')}
                                    className="ml-8 px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}