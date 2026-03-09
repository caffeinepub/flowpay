/**
 * Minimal QR-style pattern generator.
 * Generates a visually QR-like pattern with deterministic module placement.
 * For display/UX purposes — not a standards-compliant QR code.
 */

function stringToSeed(str: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function lcg(seed: number): (max: number) => number {
  let s = seed;
  return (max: number) => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) % max;
  };
}

export interface QRModule {
  x: number;
  y: number;
}

const GRID = 21;
const MODULE = 10;
const FINDER = 7;

function isFinderBorder(
  row: number,
  col: number,
  fr: number,
  fc: number,
): boolean {
  const r = row - fr;
  const c = col - fc;
  if (r < 0 || r >= FINDER || c < 0 || c >= FINDER) return false;
  if (r === 0 || r === FINDER - 1 || c === 0 || c === FINDER - 1) return true;
  if (r >= 2 && r <= 4 && c >= 2 && c <= 4) return true;
  return false;
}

function isFinderZone(row: number, col: number): boolean {
  if (row <= FINDER && col <= FINDER) return true;
  if (row <= FINDER && col >= GRID - FINDER - 1) return true;
  if (row >= GRID - FINDER - 1 && col <= FINDER) return true;
  return false;
}

function isFilled(
  row: number,
  col: number,
  rand: (max: number) => number,
): boolean {
  // Finder patterns
  if (isFinderBorder(row, col, 0, 0)) return true;
  if (isFinderBorder(row, col, 0, GRID - FINDER)) return true;
  if (isFinderBorder(row, col, GRID - FINDER, 0)) return true;

  // Timing bars
  if (row === 6 && col > 7 && col < GRID - 8) return col % 2 === 0;
  if (col === 6 && row > 7 && row < GRID - 8) return row % 2 === 0;

  // Skip separator zones
  if (isFinderZone(row, col)) return false;

  // Data area — pseudo-random fill
  return rand(2) === 1;
}

export function generateQRModules(data: string): QRModule[] {
  const rand = lcg(stringToSeed(data));
  const modules: QRModule[] = [];

  for (let row = 0; row < GRID; row++) {
    for (let col = 0; col < GRID; col++) {
      if (isFilled(row, col, rand)) {
        modules.push({ x: col * MODULE, y: row * MODULE });
      }
    }
  }
  return modules;
}

export const QR_GRID_PX = GRID * MODULE; // 210px
export const QR_MODULE_PX = MODULE;
