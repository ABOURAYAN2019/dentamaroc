import type { ToothCondition, ToothState, ToothSurface } from '@/types';

/**
 * Anatomical geometry for the FDI odontogram.
 *
 * All shapes are drawn in "upper tooth" orientation (roots pointing up, crown at the bottom)
 * inside a 90-unit tall vestibular viewBox centred on x = 20. Lower teeth are rendered by
 * flipping vertically, so a single set of shapes serves both arches.
 */

export type ToothKind =
  | 'central'
  | 'lateral'
  | 'canine'
  | 'premolar'
  | 'premolarTwoRoots'
  | 'molarUpper'
  | 'molarLower';

export type OcclusalRegion = 'top' | 'bottom' | 'left' | 'right' | 'center';

export interface OcclusalShape {
  outline: string;
  /** Half-size of the central (occlusal / incisal) surface */
  ix: number;
  iy: number;
  fissures?: string;
}

export interface ToothShape {
  /** viewBox width, centred on TOOTH_CENTER_X */
  width: number;
  crown: string;
  root: string;
  /** Root canal centre lines (one per root) */
  canals: string[];
  occlusal: OcclusalShape;
}

export const TOOTH_CENTER_X = 20;
export const VESTIBULAR_HEIGHT = 90;
export const CERVICAL_Y = 57;
export const OCCLUSAL_CENTER_Y = 20;
export const OCCLUSAL_TOP = 4;
export const OCCLUSAL_HEIGHT = 32;

export const OCCLUSAL_REGIONS: OcclusalRegion[] = ['top', 'bottom', 'left', 'right', 'center'];

/** States that apply to individual surfaces rather than the whole tooth */
export const SURFACE_STATES: ToothState[] = ['caries', 'filling'];

/** Single source of truth for state colours (chart + legend) */
export const STATE_COLORS: Record<ToothState, string> = {
  healthy: '#f5efe0',
  caries: '#dc2626',
  filling: '#2563eb',
  crown: '#d4a017',
  missing: '#64748b',
  implant: '#94a3b8',
  root_canal: '#9333ea',
  bridge: '#b45309',
  extraction_indicated: '#ea580c',
};

const SINGLE_ROOT_CANAL = 'M20 56 C20 40 20 22 20 9';

const SHAPES: Record<ToothKind, ToothShape> = {
  central: {
    width: 30,
    crown: 'M10 56 C9 66 6 78 7 85 Q8 88 12 88 L28 88 Q32 88 33 85 C34 78 31 66 30 56 Z',
    root: 'M11 58 C11 40 15 14 19 6 Q20 4 21 6 C25 14 29 40 29 58 Z',
    canals: [SINGLE_ROOT_CANAL],
    occlusal: { outline: 'M8.5 17 Q20 12 31.5 17 Q30 24 20 28 Q10 24 8.5 17 Z', ix: 7, iy: 1.3 },
  },
  lateral: {
    width: 27,
    crown: 'M11.5 56 C10.5 66 8 78 9 85 Q10 88 13.5 88 L26.5 88 Q30 88 31 85 C32 78 29.5 66 28.5 56 Z',
    root: 'M12.5 58 C12.5 40 16 16 19.2 8 Q20 6 20.8 8 C24 16 27.5 40 27.5 58 Z',
    canals: [SINGLE_ROOT_CANAL],
    occlusal: { outline: 'M10 17 Q20 12.5 30 17 Q28.5 23.5 20 27 Q11.5 23.5 10 17 Z', ix: 6, iy: 1.3 },
  },
  canine: {
    width: 30,
    crown: 'M10 56 C8 66 6 76 8 81 Q14 86 20 89 Q26 86 32 81 C34 76 32 66 30 56 Z',
    root: 'M11 58 C11 38 15 8 19 1.5 Q20 0.5 21 1.5 C25 8 29 38 29 58 Z',
    canals: ['M20 56 L20 5'],
    occlusal: { outline: 'M9 19 Q14 13 20 12.5 Q26 13 31 19 Q27 26 20 28 Q13 26 9 19 Z', ix: 3.5, iy: 2.5 },
  },
  premolar: {
    width: 32,
    crown:
      'M9 56 C7 64 5 74 6 80 Q9 86 14 87 Q17 84 20 85 Q23 84 26 87 Q31 86 34 80 C35 74 33 64 31 56 Z',
    root: 'M11 58 C11 42 15 16 19 9 Q20 7 21 9 C25 16 29 42 29 58 Z',
    canals: [SINGLE_ROOT_CANAL],
    occlusal: {
      outline:
        'M9.5 20 C9.5 13 14 10.5 20 10.5 C26 10.5 30.5 13 30.5 20 C30.5 27 26 29.5 20 29.5 C14 29.5 9.5 27 9.5 20 Z',
      ix: 5,
      iy: 3.5,
      fissures: 'M14.5 20 Q20 18.6 25.5 20',
    },
  },
  premolarTwoRoots: {
    width: 32,
    crown:
      'M9 56 C7 64 5 74 6 80 Q9 86 14 87 Q17 84 20 85 Q23 84 26 87 Q31 86 34 80 C35 74 33 64 31 56 Z',
    root: 'M11 58 C10 44 12 22 14 12 Q15.5 9 17 12 C18 24 19 40 20 46 C21 40 22 24 23 12 Q24.5 9 26 12 C28 22 30 44 29 58 Z',
    canals: ['M17 56 C16 40 15.5 24 15.5 14', 'M23 56 C24 40 24.5 24 24.5 14'],
    occlusal: {
      outline:
        'M9.5 20 C9.5 13 14 10.5 20 10.5 C26 10.5 30.5 13 30.5 20 C30.5 27 26 29.5 20 29.5 C14 29.5 9.5 27 9.5 20 Z',
      ix: 5,
      iy: 3.5,
      fissures: 'M14.5 20 Q20 18.6 25.5 20',
    },
  },
  molarUpper: {
    width: 40,
    crown:
      'M5 56 C3 64 2 74 3 80 Q5 87 10 87 Q13 84 16 86 Q20 83 24 86 Q27 84 30 87 Q35 87 37 80 C38 74 37 64 35 56 Z',
    root: 'M6 58 C5 44 6 26 8 14 Q9.5 10 11 14 C13 26 15 40 17 44 C18 34 19 18 20 8 Q21 5 22 8 C23 18 24 34 25 44 C27 40 29 26 31 14 Q32.5 10 34 14 C36 26 36 44 34 58 Z',
    canals: ['M12 56 C11 44 10 28 9.5 15', 'M20.5 56 L21 9', 'M28 56 C29 44 31 28 32.5 15'],
    occlusal: {
      outline: 'M5 12 Q5 6 11 6 L29 6 Q35 6 35 12 L35.5 28 Q35 34 29 34 L11 34 Q5 34 4.5 28 Z',
      ix: 7,
      iy: 6,
      fissures: 'M13 15 L20 20 L27 15.5 M20 20 L19 26.5 M15 25 L19 26.5',
    },
  },
  molarLower: {
    width: 40,
    crown:
      'M5 56 C3 64 2 74 3 80 Q5 87 10 87 Q13 84 16 86 Q20 83 24 86 Q27 84 30 87 Q35 87 37 80 C38 74 37 64 35 56 Z',
    root: 'M6 58 C5 44 7 24 10 12 Q12 8 14 12 C16 24 18 38 20 42 C22 38 24 24 26 12 Q28 8 30 12 C33 24 35 44 34 58 Z',
    canals: ['M13 56 C12 42 11.5 26 12 13', 'M27 56 C28 42 28.5 26 28 13'],
    occlusal: {
      outline: 'M5 12 Q5 6 11 6 L29 6 Q35 6 35 12 L35.5 28 Q35 34 29 34 L11 34 Q5 34 4.5 28 Z',
      ix: 7,
      iy: 6,
      fissures: 'M11 20 Q20 18.5 29 20 M16.5 20 L15.5 26 M24 20 L25 26 M20 19 L20 13.5',
    },
  },
};

export function getQuadrant(toothNumber: number): number {
  return Math.floor(toothNumber / 10);
}

export function isValidFdi(toothNumber: number): boolean {
  const quadrant = getQuadrant(toothNumber);
  const position = toothNumber % 10;
  if (quadrant >= 1 && quadrant <= 4) return position >= 1 && position <= 8;
  if (quadrant >= 5 && quadrant <= 8) return position >= 1 && position <= 5;
  return false;
}

export function isUpperTooth(toothNumber: number): boolean {
  const q = getQuadrant(toothNumber);
  return q === 1 || q === 2 || q === 5 || q === 6;
}

export function isPrimaryTooth(toothNumber: number): boolean {
  return getQuadrant(toothNumber) >= 5;
}

/**
 * Quadrants on the patient's right (1, 4, 5, 8) are displayed on the viewer's left,
 * so their mesial side (towards the midline) is on the right of the drawing.
 */
export function isMesialOnRight(toothNumber: number): boolean {
  const q = getQuadrant(toothNumber);
  return q === 1 || q === 4 || q === 5 || q === 8;
}

export function getToothKind(toothNumber: number): ToothKind {
  const position = toothNumber % 10;
  const upper = isUpperTooth(toothNumber);

  if (position === 1) return 'central';
  if (position === 2) return 'lateral';
  if (position === 3) return 'canine';

  if (isPrimaryTooth(toothNumber)) {
    // Primary dentition: positions 4 and 5 are deciduous molars
    return upper ? 'molarUpper' : 'molarLower';
  }

  if (position === 4) return upper ? 'premolarTwoRoots' : 'premolar';
  if (position === 5) return 'premolar';
  return upper ? 'molarUpper' : 'molarLower';
}

export function getToothShape(toothNumber: number): ToothShape {
  return SHAPES[getToothKind(toothNumber)];
}

/**
 * Maps a region of the occlusal drawing (in un-flipped coordinates) to an anatomical surface.
 * Top is always vestibular because lower teeth are flipped vertically when rendered.
 */
export function regionToSurface(toothNumber: number, region: OcclusalRegion): ToothSurface {
  switch (region) {
    case 'center':
      return 'occlusal';
    case 'top':
      return 'vestibular';
    case 'bottom':
      return 'lingual';
    case 'left':
      return isMesialOnRight(toothNumber) ? 'distal' : 'mesial';
    case 'right':
      return isMesialOnRight(toothNumber) ? 'mesial' : 'distal';
  }
}

/** Polygon point lists for the 5 occlusal regions (clipped by the tooth outline at render time) */
export function getOcclusalRegions(shape: ToothShape): Record<OcclusalRegion, string> {
  const cx = TOOTH_CENTER_X;
  const cy = OCCLUSAL_CENTER_Y;
  const { ix, iy } = shape.occlusal;
  const far = 24;

  const outerTL = `${cx - far},${cy - far}`;
  const outerTR = `${cx + far},${cy - far}`;
  const outerBL = `${cx - far},${cy + far}`;
  const outerBR = `${cx + far},${cy + far}`;
  const innerTL = `${cx - ix},${cy - iy}`;
  const innerTR = `${cx + ix},${cy - iy}`;
  const innerBL = `${cx - ix},${cy + iy}`;
  const innerBR = `${cx + ix},${cy + iy}`;

  return {
    top: [outerTL, outerTR, innerTR, innerTL].join(' '),
    bottom: [innerBL, innerBR, outerBR, outerBL].join(' '),
    left: [outerTL, innerTL, innerBL, outerBL].join(' '),
    right: [innerTR, outerTR, outerBR, innerBR].join(' '),
    center: [innerTL, innerTR, innerBR, innerBL].join(' '),
  };
}

export function isSurfaceState(state: ToothState): boolean {
  return SURFACE_STATES.includes(state);
}

/** Caries/fillings recorded without surfaces default to the occlusal surface */
export function getEffectiveSurfaces(condition?: Pick<ToothCondition, 'state' | 'surfaces'>): ToothSurface[] {
  if (!condition || !isSurfaceState(condition.state)) return [];
  return condition.surfaces && condition.surfaces.length > 0 ? condition.surfaces : ['occlusal'];
}

export interface MarkerPosition {
  x: number;
  y: number;
  /** Lingual surfaces are not visible from the vestibular view: drawn semi-transparent */
  behind: boolean;
}

/** Where to draw a caries/filling marker on the vestibular (front) view */
export function getVestibularMarkerPosition(toothNumber: number, surface: ToothSurface): MarkerPosition {
  const shape = getToothShape(toothNumber);
  const offset = shape.width * 0.27;
  const mesialRight = isMesialOnRight(toothNumber);
  const cx = TOOTH_CENTER_X;

  switch (surface) {
    case 'occlusal':
      return { x: cx, y: 83, behind: false };
    case 'vestibular':
      return { x: cx, y: 72, behind: false };
    case 'lingual':
      return { x: cx, y: 67, behind: true };
    case 'mesial':
      return { x: mesialRight ? cx + offset : cx - offset, y: 74, behind: false };
    case 'distal':
      return { x: mesialRight ? cx - offset : cx + offset, y: 74, behind: false };
    case 'cervical':
      return { x: cx, y: 60.5, behind: false };
  }
}
