import type { ParsedPoint } from '../types/index.js';

/**
 * Assert that a value is a non-empty string.
 * @throws {TypeError} if the assertion fails
 */
export function assertString(value: unknown, name: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new TypeError(`[postgis] "${name}" must be a non-empty string, got: ${JSON.stringify(value)}`);
  }
}

/**
 * Assert that a value is a finite number >= 0.
 * @throws {TypeError} if the assertion fails
 */
export function assertPositiveNumber(value: unknown, name: string): asserts value is number {
  if (typeof value !== 'number' || !isFinite(value) || value < 0) {
    throw new TypeError(`[postgis] "${name}" must be a non-negative finite number, got: ${JSON.stringify(value)}`);
  }
}

/**
 * Parse a point string in the format `"x,y,srid"` (e.g. `"73.5,14.9,4326"`).
 *
 * Supports coordinates with optional decimal parts and up to 5-digit SRIDs.
 * @throws {Error} if the format is invalid
 */
export function parsePoint(point: string): ParsedPoint {
  if (typeof point !== 'string') {
    throw new TypeError(`[postgis] Point must be a string, got: ${typeof point}`);
  }

  const match = point.match(/^(-?\d+\.?\d*),(-?\d+\.?\d*),(\d{4,5})$/);
  if (!match) {
    throw new Error(
      `[postgis] Invalid point format "${point}". Expected "x,y,srid" (e.g. "73.5,14.9,4326").`
    );
  }

  const [, x, y, srid] = match;
  return { x: x!, y: y!, srid: srid! };
}
