import { describe, it, expect } from 'vitest';

const ADULT_TEETH = [
  18, 17, 16, 15, 14, 13, 12, 11,
  21, 22, 23, 24, 25, 26, 27, 28,
  38, 37, 36, 35, 34, 33, 32, 31,
  48, 47, 46, 45, 44, 43, 42, 41,
];

const CHILD_TEETH = [
  55, 54, 53, 52, 51,
  61, 62, 63, 64, 65,
  75, 74, 73, 72, 71,
  85, 84, 83, 82, 81,
];

describe('FDI Dental System Integrity', () => {
  it('contains exactly 32 adult teeth with valid FDI quadrant codes (1-4)', () => {
    expect(ADULT_TEETH.length).toBe(32);
    ADULT_TEETH.forEach((tooth) => {
      const quadrant = Math.floor(tooth / 10);
      const position = tooth % 10;
      expect([1, 2, 3, 4]).toContain(quadrant);
      expect(position).toBeGreaterThanOrEqual(1);
      expect(position).toBeLessThanOrEqual(8);
    });
  });

  it('contains exactly 20 child teeth with valid FDI quadrant codes (5-8)', () => {
    expect(CHILD_TEETH.length).toBe(20);
    CHILD_TEETH.forEach((tooth) => {
      const quadrant = Math.floor(tooth / 10);
      const position = tooth % 10;
      expect([5, 6, 7, 8]).toContain(quadrant);
      expect(position).toBeGreaterThanOrEqual(1);
      expect(position).toBeLessThanOrEqual(5);
    });
  });
});
