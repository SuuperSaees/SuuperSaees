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
