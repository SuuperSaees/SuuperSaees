/**
 * Converts a snake_case or kebab-case string to a human-readable format
 * with customizable capitalization.
 *
 * @param input - The input string (e.g., "assigned_to").
 * @param caseType - The desired case type: "capitalize", "upper", or "lower".
 * @returns A formatted string (e.g., "Assigned to" or "assigned to").
 */
export function formatString(
  input: string,
  caseType: 'capitalize' | 'upper' | 'lower' = 'capitalize',
): string {
  // Replace underscores or hyphens with spaces and split into words
  const words = input.replace(/[-_]/g, ' ').toLowerCase().split(' ');

  // Transform words based on the case type
  let formatted: string;
  switch (caseType) {
    case 'upper':
      formatted = words.join(' ').toUpperCase();
      break;
    case 'lower':
      formatted = words.join(' ').toLowerCase();
      break;
    case 'capitalize':
    default:
      formatted = words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      break;
  }

  return formatted;
}
