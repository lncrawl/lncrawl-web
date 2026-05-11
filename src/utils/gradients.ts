const _mask24 = (1 << 24) - 1;

interface GeneratorTheme {
  start: number;
  stop: number;
}

export const darkGradient: GeneratorTheme = { start: 0x09, stop: 0x3f };
export const lightGradient: GeneratorTheme = { start: 0xcf, stop: 0xf5 };

function buildColor(code: number, { start, stop }: GeneratorTheme): string {
  const range = stop - start;
  const r = (code & range) + start;
  code >>= 8;
  const g = (code & range) + start;
  code >>= 8;
  const b = (code & range) + start;

  let hex = '#';
  hex += r.toString(16).padStart(2, '0');
  hex += g.toString(16).padStart(2, '0');
  hex += b.toString(16).padStart(2, '0');
  return hex;
}

/**
 * Get a random color (non-deterministic)
 */
export function getRandomColor(theme: GeneratorTheme = darkGradient): string {
  const code = Math.floor(Math.random() * (_mask24 + 1));
  return buildColor(code, theme);
}

/**
 * Generate a deterministic random color based on a ID
 */
export function getColorForId(
  id: string = '',
  theme: GeneratorTheme = darkGradient
): string {
  let code = _mask24;
  for (let i = 0; i < id.length; ++i) {
    code ^= (code << 4) ^ id.charCodeAt(i);
    code ^= code >>> 24;
    code = code << 4;
  }
  return buildColor(code, theme);
}
/**
 * Get a random gradient (non-deterministic)
 */
export function getRandomGradient(opts?: {
  degress?: number;
  theme?: GeneratorTheme;
}): string {
  const theme = opts?.theme ?? darkGradient;
  const degress = opts?.degress ?? Math.floor(Math.random() * 360);
  const color1 = getRandomColor(theme);
  const color2 = getRandomColor(theme);
  return `linear-gradient(${degress}deg, ${color1}, ${color2})`;
}

/**
 * Generate a deterministic random gradient based on a ID
 */
export function getGradientForId(
  id: string = '',
  opts?: {
    degress?: number;
    theme?: GeneratorTheme;
  }
): string {
  const first = id.slice(0, 6);
  const second = id.slice(Math.max(id.length - 6, 0));
  const degress = opts?.degress ?? 135;
  const theme = opts?.theme ?? darkGradient;
  const color1 = getColorForId(first, theme);
  const color2 = getColorForId(second, theme);
  return `linear-gradient(${degress}deg, ${color1}, ${color2})`;
}
