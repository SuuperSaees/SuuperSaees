'use client';

import React from 'react';
import { useOrganizationSettings } from '../../context/organization-settings-context';
import withOrganizationSettings from '../../hoc/with-organization-settings';
import { getTextColorBasedOnBackground } from '../../../../../../apps/web/app/utils/generate-colors';

export const TaskCounter: React.FC<{
  taskCount: number;
  className?: string;
  themeColor?: string;
}> = ({ taskCount, className, themeColor }) => {
  const { theme_color } = useOrganizationSettings();
  
  if (!themeColor) {
    themeColor = theme_color;
  }

  const textColor = getTextColorBasedOnBackground(themeColor ?? '#000000');

  return (
    <div
      className={`flex items-center justify-center w-6 h-6 rounded-full bg-brand text-sm ${className}`}
      style={{
        backgroundColor: themeColor,
        color: textColor,
      }}
    >
      {taskCount}
    </div>
  );
};

const TaskCounterWithSettings = withOrganizationSettings(TaskCounter);

export default TaskCounterWithSettings;
