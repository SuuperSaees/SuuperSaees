/**
 * Utility functions for text formatting, specifically handling newline encoding/decoding
 * for database storage and display
 */

export const NEW_LINE_SEPARATOR = '|||newline|||';

export const textFormat = {
  /**
   * Encodes newlines to a database-safe format
   */
  encode: (text: string | null): string => {
    if (!text) return '';
    return text.replace(/\n/g, NEW_LINE_SEPARATOR);
  },

  /**
   * Decodes database-stored newlines back to regular newline characters
   */
  decode: (text: string | null): string => {
    if (!text || typeof text !== 'string') return '';
    return text.replace(/\|\|\|newline\|\|\|/g, '\n');
  }
};