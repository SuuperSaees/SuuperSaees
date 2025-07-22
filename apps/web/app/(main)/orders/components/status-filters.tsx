'use client';

import React, { Dispatch, SetStateAction, useState } from 'react';
import { useOrganizationSettings } from 'node_modules/@kit/accounts/src/context/organization-settings-context';
import { Button } from '@kit/ui/button';
import { hexToRgba } from '~/utils/generate-colors';
import { cn } from '@kit/ui/utils';
import SelectAction from '../../../../components/ui/select';

// Simple mobile detection hook (md breakpoint)
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  React.useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

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
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Style for the tabs/select
  const baseTabClass = 'font-semibold capitalize text-gray-600 px-4 py-1 border-none border-0';
  const activeTabClass = 'rounded-md bg-white/70 border border-gray-200';
  const inactiveTabClass = 'bg-transparent !border-none shadow-none focus:ring-0';

  const createStyles = (tab: { key: string; label: string }) => {
    return theme_color
      ? {
          backgroundColor:
            activeTab === tab.key || hoveredTab === tab.key
              ? hexToRgba('#667085', 0.1)
              : undefined,
          color: '#667085',
          borderColor: undefined,
        }
      : undefined;
  };

  if (isMobile) {
    // Render dropdown/select for mobile
    return (
      <SelectAction
        options={tabsConfig.map(tab => ({
          label: t(tab.label),
          value: tab.key,
          action: () => {
            setActiveTab(tab.key);
            tab.filter();
          },
        }))}
        defaultValue={activeTab}
        onSelectHandler={(value: string) => {
          const tab = tabsConfig.find(t => t.key === value);
          if (tab) {
            setActiveTab(tab.key);
            tab.filter();
          }
        }}
        className={cn(baseTabClass, 'w-full md:px-4 px-0')}
        customItem={(label: string) => (
          <div className={cn(baseTabClass, 'w-full text-center px-4')} >{label}</div>
        )}
        customTrigger={(label: string) => (
          <div className={cn(baseTabClass, 'w-full text-center md:px-4 px-1')} >{label}</div>
        )}
        containerClassname={className}
      />
    );
  }

  // Render tab list for desktop
  return (
    <div className={cn(
      'flex mr-auto gap-2 bg-transparent sm:gap-2 gap-0 w-full md:w-fit',
      'overflow-x-auto',
      className
    )}>
      {tabsConfig.map((tab) => (
        <Button
          onClick={() => {
            setActiveTab(tab.key);
            tab.filter();
          }}
          className={cn(
            baseTabClass,
            tab.key === activeTab ? activeTabClass : inactiveTabClass,
            'hover:text-brand', // optional: add hover effect
            'md:flex-none flex-1 md:w-fit w-full'
          )}
          key={tab.key}
          style={createStyles(tab)}
          onMouseEnter={() => setHoveredTab(tab.key)}
          onMouseLeave={() => setHoveredTab(null)}
        >
          {t(tab.label)}
        </Button>
      ))}
    </div>
  );
};

export default StatusFilters;
