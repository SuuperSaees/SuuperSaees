'use client';

import { Dispatch, SetStateAction, useState } from 'react';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { Button } from '@kit/ui/button';
import { hexToRgba } from '~/utils/generate-colors';
import { cn } from '@kit/ui/utils';

export type TabConfig = {
  key: string;
  label: string;
  filter: () => void;
};

interface StatusFiltersProps {
  activeTab: string;
  setActiveTab: Dispatch<SetStateAction<string>>;
  t: (key: string) => string;
  tabsConfig: TabConfig[];
  className?: string;
}

const StatusFilters = ({
  activeTab,
  setActiveTab,
  t,
  tabsConfig,
  className,
}: StatusFiltersProps) => {
  const { theme_color } = useOrganizationSettings();
  const [hoveredTab, setHoveredTab] = useState<string | null>(null); // Track the hovered tab's key

  // Style for the tabs
  const createStyles = (tab: { key: string; label: string }) => {
    return theme_color
      ? {
          backgroundColor:
            activeTab === tab.key || hoveredTab === tab.key
              ? hexToRgba('#667085', 0.1) // Apply 0.1 opacity if active or hovered
              : undefined,
          color: '#667085',
          borderColor: activeTab === tab.key ? theme_color : undefined,
        }
      : undefined;
  };

  return (
    <div className={cn("flex mr-auto gap-2 bg-transparent sm:gap-2 gap-0 w-full md:w-fit", 
    "overflow-x-auto", className)}>
      {tabsConfig.map((tab) => (
        <Button
          onClick={() => {
            setActiveTab(tab.key);
            tab.filter();
          }}
          className={cn(
            "font-semibold hover:bg-gray-200/30 hover:text-brand",
            tab.key === activeTab ? 'bg-brand-50/60 text-brand-900' : 'bg-transparent text-gray-600',
            "md:flex-none flex-1 md:w-fit w-full"
          )}
          key={tab.key}
          style={createStyles(tab)}
          onMouseEnter={() => setHoveredTab(tab.key)} // Set hover state for the specific tab
          onMouseLeave={() => setHoveredTab(null)} // Reset hover state
        >
          {t(tab.label)}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilters;
