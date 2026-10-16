import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  getEffectiveSurfaces,
  getToothKind,
  isMesialOnRight,
  isUpperTooth,
  isValidFdi,
  regionToSurface,
} from '@/features/odontogram/toothGeometry';
import { ToothSvg } from '@/features/odontogram/ToothSvg';

describe('toothGeometry', () => {
  it('assigns anatomical kinds per FDI position', () => {
    expect(getToothKind(11)).toBe('central');
    expect(getToothKind(22)).toBe('lateral');
    expect(getToothKind(33)).toBe('canine');
    expect(getToothKind(14)).toBe('premolarTwoRoots'); // upper first premolar: 2 roots
    expect(getToothKind(44)).toBe('premolar');
    expect(getToothKind(16)).toBe('molarUpper');
    expect(getToothKind(36)).toBe('molarLower');
    expect(getToothKind(55)).toBe('molarUpper'); // primary molar
    expect(getToothKind(84)).toBe('molarLower');
  });

  it('identifies arches and validates FDI numbers', () => {
    expect(isUpperTooth(26)).toBe(true);
    expect(isUpperTooth(61)).toBe(true);
    expect(isUpperTooth(47)).toBe(false);
    expect(isValidFdi(48)).toBe(true);
    expect(isValidFdi(56)).toBe(false);
    expect(isValidFdi(19)).toBe(false);
  });

  it('places mesial towards the midline for each quadrant', () => {
    // Quadrants 1 & 4 are drawn on the viewer's left: mesial on the right
    expect(isMesialOnRight(16)).toBe(true);
    expect(regionToSurface(16, 'right')).toBe('mesial');
    expect(regionToSurface(46, 'left')).toBe('distal');
    // Quadrants 2 & 3 are drawn on the viewer's right: mesial on the left
    expect(regionToSurface(26, 'left')).toBe('mesial');
    expect(regionToSurface(36, 'right')).toBe('distal');
    expect(regionToSurface(36, 'center')).toBe('occlusal');
    expect(regionToSurface(36, 'top')).toBe('vestibular');
  });

  it('defaults caries/fillings without surfaces to occlusal', () => {
    expect(getEffectiveSurfaces({ state: 'caries' })).toEqual(['occlusal']);
    expect(getEffectiveSurfaces({ state: 'filling', surfaces: ['mesial'] })).toEqual(['mesial']);
    expect(getEffectiveSurfaces({ state: 'crown', surfaces: ['mesial'] })).toEqual([]);
  });
});

describe('ToothSvg', () => {
  it('selects the tooth on click and keyboard', () => {
    const onSelect = vi.fn();
    render(<ToothSvg toothNumber={16} onSelect={onSelect} ariaLabel="Dent 16" />);
    const tooth = screen.getByRole('button', { name: 'Dent 16' });
    fireEvent.click(tooth);
    fireEvent.keyDown(tooth, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(2);
    expect(onSelect).toHaveBeenCalledWith(16);
  });

  it('reports the anatomical surface clicked without re-selecting the tooth', () => {
    const onSelect = vi.fn();
    const onSurfaceClick = vi.fn();
    const { container } = render(
      <ToothSvg toothNumber={26} onSelect={onSelect} onSurfaceClick={onSurfaceClick} />
    );
    const mesial = container.querySelector('[data-surface="mesial"]');
    expect(mesial).not.toBeNull();
    fireEvent.click(mesial as Element);
    expect(onSurfaceClick).toHaveBeenCalledWith('mesial');
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('colours carious surfaces red', () => {
    const { container } = render(
      <ToothSvg toothNumber={36} condition={{ state: 'caries', surfaces: ['distal'] }} />
    );
    expect(container.querySelector('[data-surface="distal"]')?.getAttribute('fill')).toBe('#ef4444');
    expect(container.querySelector('[data-surface="mesial"]')?.getAttribute('fill')).toBe('url(#dm-enamel-occ)');
  });
});
