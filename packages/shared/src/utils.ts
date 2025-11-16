/**
 * Check if the code is running in a browser environment.
 */
export function isBrowser() {
  return typeof window !== 'undefined';
}

/**
 *@name formatCurrency
 * @description Format the currency based on the currency code
 */
export function formatCurrency(currencyCode: string, value: string | number) {
  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(value));

  const roundedValue = Math.round(Number(value) * 100) / 100;
  const isInteger = roundedValue === Math.floor(roundedValue);

  return isInteger ? formattedValue.replace(/\.00$/, '') : formattedValue;
}

export const formatDisplayDate = (
  date: Date,
  language: string,
  fullMonth = false,
) => {
  const isSpanish = language.startsWith('es');
  const months = {
    en: [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    es: [
      'Ene',
      'Feb',
      'Mar',
      'Abr',
      'May',
      'Jun',
      'Jul',
      'Ago',
      'Sep',
      'Oct',
      'Nov',
      'Dic',
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
  };

  const month =
    months[isSpanish ? 'es' : 'en'][
      fullMonth ? date.getMonth() + 12 : date.getMonth()
    ];
  const day = date.getDate();
  const year = date.getFullYear();

  return isSpanish ? `${month} ${day}, ${year}` : `${month} ${day}, ${year}`;
};

export * from './retry';