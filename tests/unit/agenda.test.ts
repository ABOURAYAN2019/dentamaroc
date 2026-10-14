import { describe, it, expect } from 'vitest';

interface TimeSlot {
  start: string;
  end: string;
  dentistId: string;
}

function hasConflict(slotA: TimeSlot, slotB: TimeSlot): boolean {
  if (slotA.dentistId !== slotB.dentistId) return false;
  const startA = new Date(slotA.start).getTime();
  const endA = new Date(slotA.end).getTime();
  const startB = new Date(slotB.start).getTime();
  const endB = new Date(slotB.end).getTime();

  return startA < endB && endA > startB;
}

describe('Agenda Conflict Detection', () => {
  it('detects overlapping slots for the same dentist', () => {
    const slot1: TimeSlot = {
      start: '2026-10-15T10:00:00Z',
      end: '2026-10-15T10:30:00Z',
      dentistId: 'dentist-1',
    };
    const slot2: TimeSlot = {
      start: '2026-10-15T10:15:00Z',
      end: '2026-10-15T10:45:00Z',
      dentistId: 'dentist-1',
    };

    expect(hasConflict(slot1, slot2)).toBe(true);
  });

  it('allows non-overlapping slots for the same dentist', () => {
    const slot1: TimeSlot = {
      start: '2026-10-15T10:00:00Z',
      end: '2026-10-15T10:30:00Z',
      dentistId: 'dentist-1',
    };
    const slot2: TimeSlot = {
      start: '2026-10-15T10:30:00Z',
      end: '2026-10-15T11:00:00Z',
      dentistId: 'dentist-1',
    };

    expect(hasConflict(slot1, slot2)).toBe(false);
  });

  it('allows overlapping slots if dentists are different (multi-praticiens)', () => {
    const slot1: TimeSlot = {
      start: '2026-10-15T10:00:00Z',
      end: '2026-10-15T10:30:00Z',
      dentistId: 'dentist-1',
    };
    const slot2: TimeSlot = {
      start: '2026-10-15T10:00:00Z',
      end: '2026-10-15T10:30:00Z',
      dentistId: 'dentist-2',
    };

    expect(hasConflict(slot1, slot2)).toBe(false);
  });
});
