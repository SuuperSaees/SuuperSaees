'use client';

import { Lightbulb } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AnnotationsHelpTooltip = () => {
  const { t } = useTranslation();
  return (
    <div className="p-2">
      <div className="mb-3 flex items-center">
        <Lightbulb className="mr-2 h-4 w-4 text-gray-500" />
        <p className="text-sm font-semibold text-gray-800">
          {t('annotations.help.title')}
        </p>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-1">
          <span className="text-nowrap text-sm text-gray-600">
            {t('annotations.help.move')}
          </span>
          <kbd className="ml-2 inline-flex h-6 items-center justify-center rounded border border-gray-200 bg-gray-100 px-2 text-xs font-medium text-gray-500 shadow-sm">
            Space
          </kbd>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-nowrap text-sm text-gray-600">
            {t('annotations.help.zoom')}
          </span>
          <div className="flex items-center gap-1">
            <kbd className="inline-flex h-6 items-center justify-center rounded border border-gray-200 bg-gray-100 px-2 text-xs font-medium text-gray-500 shadow-sm">
              <span>🖱️</span>
            </kbd>
            <span className="text-xs text-gray-500">+</span>
            <kbd className="inline-flex h-6 items-center justify-center rounded border border-gray-200 bg-gray-100 px-2 text-xs font-medium text-gray-500 shadow-sm">
              <span>{t('annotations.help.mouseWheel')}</span>
            </kbd>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotationsHelpTooltip;
