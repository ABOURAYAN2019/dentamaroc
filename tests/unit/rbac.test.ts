import { describe, it, expect } from 'vitest';
import { UserRole } from '@/types';

function canAccessMedicalRecords(role: UserRole): boolean {
  return role === 'dentist' || role === 'assistant';
}

function canDeletePatient(role: UserRole): boolean {
  return role === 'dentist'; // CNDP strict right
}

function canAccessBilling(role: UserRole): boolean {
  return role === 'dentist' || role === 'secretary';
}

function canManageSettings(role: UserRole): boolean {
  return role === 'dentist';
}

describe('RBAC Permissions Matrix (DentaMaroc)', () => {
  it('Dentist has full permissions across all modules', () => {
    expect(canAccessMedicalRecords('dentist')).toBe(true);
    expect(canDeletePatient('dentist')).toBe(true);
    expect(canAccessBilling('dentist')).toBe(true);
    expect(canManageSettings('dentist')).toBe(true);
  });

  it('Assistant has medical access but cannot delete patients or manage clinic settings', () => {
    expect(canAccessMedicalRecords('assistant')).toBe(true);
    expect(canDeletePatient('assistant')).toBe(false);
    expect(canManageSettings('assistant')).toBe(false);
  });

  it('Secretary has billing & agenda access but NO clinical/medical records access', () => {
    expect(canAccessBilling('secretary')).toBe(true);
    expect(canAccessMedicalRecords('secretary')).toBe(false);
    expect(canDeletePatient('secretary')).toBe(false);
  });
});
