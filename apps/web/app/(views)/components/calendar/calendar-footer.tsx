import { format, getWeekOfMonth } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from 'node_modules/@kit/ui/src/shadcn/button-shadcn';
import { useTranslation } from 'react-i18next';

import { CalendarView } from '~/(views)/calendar.types';
import SelectAction, { Option } from '~/components/ui/select';

interface CalendarFooterProps {
  currentDate: string;
  referenceDate: string;
  startDate: string;
  endDate: string;
  currentView: CalendarView;
  viewOptions: Option[];
  updateView: (view: CalendarView) => void;
  goToPrevDate: () => void;
  goToCurrentDate: () => void;
  goToNextDate: () => void;
}
const CalendarFooter = ({
  currentDate,
  referenceDate,
  startDate,
  endDate,
  currentView,
  viewOptions,
  updateView,
  goToPrevDate,
  goToCurrentDate,
  goToNextDate,
}: CalendarFooterProps) => {
  const { t, i18n } = useTranslation('views');

  // Get the appropriate locale based on current language
  const locale = i18n.language === 'es' ? es : enUS;

  return (
    <div className="flex w-full items-center justify-between border rounded-b-xl border-gray-200 p-4">
      <div className="flex gap-2">
        <div className="flex flex-col items-center rounded-md border border-gray-200">
          <span className="bg-gray-100 px-4 py-0.5 text-xs font-medium uppercase text-gray-500">
            {format(currentDate, 'MMM', { locale })}
          </span>
          <span className="px-4 py-0.5 font-bold text-black">
            {format(currentDate, 'd')}
          </span>
        </div>

        <div className="flex flex-col justify-center gap-1">
          <div className="items center flex gap-2">
            <span className="font-bold capitalize">
              {/* format example: January 2025 */}
              {format(referenceDate, 'MMMM yyyy', { locale })}
            </span>
            {currentView === CalendarView.WEEK && (
              <span className="inline-flex items-center rounded-md border border-gray-200 px-2 text-xs font-medium text-gray-500">
                {/* format example: Week 2 (week of the month) */}
                {t('calendar.date.week')}
                {` ${getWeekOfMonth(startDate)}`}
              </span>
            )}
          </div>
          {/* format example: Jan 1, 2025 - Jan 31, 2025 */}
          <span className="text-xs font-medium text-gray-500">
            {format(startDate, 'MMM d, yyyy', { locale })} -{' '}
            {format(endDate, 'MMM d, yyyy', { locale })}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex rounded-md border border-gray-200">
          <Button
            variant="outline"
            className="border-r-1 rounded-none border-b-0 border-l-0 border-t-0 border-gray-200 bg-transparent"
            onClick={goToPrevDate}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={goToCurrentDate}
            className="border-none bg-transparent font-medium"
          >
            {t('calendar.date.today')}
          </Button>
          <Button
            variant="outline"
            className="border-l-1 rounded-none border-b-0 border-r-0 border-t-0 border-gray-200 bg-transparent"
            onClick={goToNextDate}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <SelectAction
          options={viewOptions}
          value={currentView}
          onSelectHandler={(value: string) => updateView(value as CalendarView)}
          containerClassname="gap-0 "
          defaultValue={currentView}
          className="px-3 font-medium"
        />
      </div>
    </div>
  );
};

export default CalendarFooter;
