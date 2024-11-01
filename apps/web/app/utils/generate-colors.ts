export function getTextColorBasedOnBackground(backgroundColor: string) {
  const color = backgroundColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 186 ? 'black' : 'white';
}

export function hexToRgba(hex: string, opacity: number) {
  // Remove the hash if present
  hex = hex.replace('#', '');

  // Parse the hex color into RGB
  // const bigint = parseInt(hex, 16);
  // const r = (bigint >> 16) & 255;
  // const g = (bigint >> 8) & 255;
  // const b = bigint & 255;

  // Convert the opacity (0-1) to a hex value (00-FF)
  const alpha = Math.round(opacity * 255)
    .toString(16)
    .padStart(2, '0')
    .toUpperCase();

  // Return the hex color with the opacity as the alpha channel
  return `#${hex}${alpha}`;
}
