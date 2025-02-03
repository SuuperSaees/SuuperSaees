export function getTextColorBasedOnBackground(backgroundColor: string) {
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luminance > 186 ? 'black' : 'white';
}


export function darkenColor(hex: string, amount = 0.1): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  // Parse the hex string into RGB values
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);
  // if (luminance < 80) { 
  //   return '#FFFFFF';
  // }

  // Convert RGB to HSL
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h=0, s:number, l:number = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Darken by reducing lightness
  l = Math.max(0, l - amount);

  // Convert back to RGB
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  r = hue2rgb(p, q, h + 1/3);
  g = hue2rgb(p, q, h);
  b = hue2rgb(p, q, h - 1/3);

  // Convert RGB back to hex
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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

// Return color luminance based on hex color or hsla => {luminance: value, alpha: value, theme: light or dark}
export const getColorLuminance = (hexColor: string): { luminance: number, theme: 'light' | 'dark' } => {
  const color = hexColor.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  // Calculate the luminance value
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  // Determine the theme based on the luminance value
  const theme = luminance > 186 ? 'light' : 'dark';

  // Return an object with luminance and theme properties
  return { luminance, theme };
}

export const hexToRgb = (hex: string) => {
  // Remove the hash if present
  hex = hex.replace('#', '');
  
  // Parse the hex values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  return `${r}, ${g}, ${b}`;
};

export const getContrastColor = (color: string) => {
  const { theme: baseTextColor, luminance } = getColorLuminance(color);

  let contrasColor = baseTextColor === 'dark' ? 'white' : 'black';

  if (luminance < 50) {
    contrasColor = 'white';
  } else if (luminance > 200) {
    contrasColor = 'black';
  }

  return contrasColor;
};