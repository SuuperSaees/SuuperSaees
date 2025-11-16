import { Inter } from 'next/font/google';

/**
 * @sans
 * @description Define the Inter font as the primary sans-serif font
 */
const sans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Arial', 'sans-serif'],
  preload: true,
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap', // Añadido para mejor rendimiento
});

/**
 * @heading
 * @description Using Inter for headings as well
 */
const heading = sans;

export { sans, heading };