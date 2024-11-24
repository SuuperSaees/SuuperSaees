import { ArrowDown, ArrowUp } from 'lucide-react';

import { ChartNegative, ChartPositive } from '~/components/icons/icons';

type MeasurementUnit =
  | 'seconds'
  | 'minutes'
  | 'hours'
  | 'days'
  | 'weeks'
  | 'months'
  | 'years';

interface CardStatsProps {
  title: string;
  value: {
    current: number;
    previous: number;
    unit: MeasurementUnit;
  };
}

export default function CardStats({ title, value }: CardStatsProps) {
  const { current, previous } = value;
  const percentage = compareValues(current, previous);
  const formattedCurrent = formatNumber(current);
  const formattedPercentage = percentage !== null ? formatNumber(Math.abs(percentage)) : null;

// Define percentage text based on the percentage change and edge cases
let percentageText;
if (percentage === null) {
  // No previous data case
  percentageText = current > 0 
    ? 'significant increase (no previous data)' 
    : 'no data from last month';
} else {
  // Percentage change case
  percentageText =
    percentage > 0
      ? `increase vs last month`
      : percentage < 0
      ? `decrease vs last month`
      : 'not changed';  // Handles the 0% case
}

  return (
    <div className="flex w-full max-w-sm flex-1 flex-col gap-4 rounded-md border border-gray-100 bg-white p-4 shadow-sm transition-shadow hover:bg-gray-50">
      <div className="flex max-w-full shrink-0 flex-col gap-2">
        <span className="text-sm font-bold">{title}</span>
        <span className="flex justify-between gap-4">
          <span className="text-3xl font-bold text-gray-800">
            {formattedCurrent}
          </span>
          <span className="flex flex-wrap items-center gap-2">
            {percentage > 0 ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
    
            <span
              className={`flex items-center gap-1 text-sm font-medium ${
                percentage > 0 ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {formattedPercentage}%
            </span>
            <span className="text-xs font-medium text-gray-500">
              {percentageText}
            </span>
          </span>
        </span>
      </div>
      {percentage > 0 ? (
        <ChartPositive className="h-20 w-full" />
      ) : (
        <ChartNegative className="h-20 w-full" />
      )}
    </div>
  );
}

// Helper function to format numbers dynamically
function formatNumber(value: number): string {
  if (Number.isInteger(value)) {
    return value.toString(); // No decimals for integers
  }
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Function that compares the values and returns the percentage difference
function compareValues(current: number, previous: number): number {
  if (current === 0 || previous === 0) return 0; // Avoid division by zero
  const difference = current - previous;

  return (difference / previous) * 100;
}
