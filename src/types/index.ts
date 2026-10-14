export type UserRole = 'dentist' | 'assistant' | 'secretary';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone: string;
  clinicId: string;
  active: boolean;
  colorCode?: string;
  createdAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  licenseNumber: string; // N° INPE / Ordre
  ice?: string; // Identifiant Commun de l'Entreprise
  address: {
    street: string;
    city: string;
    postalCode: string;
  };
  phones: string[];
  email: string;
  logoUrl?: string;
  headerTemplate?: string;
  settings: {
    currency: 'MAD';
    timezone: 'Africa/Casablanca';
    defaultLanguage: 'fr' | 'ar';
    appointmentSlotDuration: number; // in minutes
    workHours: Array<{
      dayOfWeek: number; // 0=Sun, 1=Mon, ..., 6=Sat
      start: string;
      end: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

export interface PatientMedicalHistory {
  allergies: string[];
  conditions: string[];
  notes?: string;
  bloodGroup?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
}

export interface PatientConsent {
  granted: boolean;
  timestamp: string;
  signedBy: 'patient' | 'guardian';
  notes?: string;
}

export interface PatientFinancialSummary {
  totalInvoiced: number; // in MAD
  totalPaid: number; // in MAD
  balance: number; // in MAD
}

export interface Patient {
  id: string;
  nationalId?: string; // CIN
  firstName: string;
  lastName: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'M' | 'F';
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  medicalHistory: PatientMedicalHistory;
  consent: PatientConsent;
  financialSummary: PatientFinancialSummary;
  lastVisitAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentStatus =
  | 'scheduled'
  | 'arrived'
  | 'in_progress'
  | 'completed'
  | 'no_show'
  | 'cancelled';

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  dentistId: string;
  dentistName: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  reminderSent: boolean;
  reminderSentAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Odontogram (FDI system)
export type ToothNumber = number;
export type ToothSurface =
  | 'occlusal'
  | 'mesial'
  | 'distal'
  | 'vestibular'
  | 'lingual'
  | 'cervical';

export type ToothState =
  | 'healthy'
  | 'caries'
  | 'filling'
  | 'crown'
  | 'missing'
  | 'implant'
  | 'root_canal'
  | 'bridge'
  | 'extraction_indicated';

export interface ToothCondition {
  state: ToothState;
  material?: 'composite' | 'amalgam' | 'ceramic' | 'metal';
  surfaces?: ToothSurface[];
  notes?: string;
  updatedAt: string;
  updatedBy: string;
}

export interface ToothChart {
  id: string;
  patientId: string;
  type: 'adult' | 'child' | 'mixed';
  teeth: Record<number, ToothCondition>;
  updatedAt: string;
  updatedBy: string;
}

// Procedures and Treatment Plans
export type ProcedureCategory =
  | 'consultation'
  | 'prevention'
  | 'conservative'
  | 'endodontics'
  | 'surgery'
  | 'prosthetics'
  | 'orthodontics'
  | 'implantology';

export interface ProcedureCatalogItem {
  id: string;
  code?: string;
  category: ProcedureCategory;
  nameFr: string;
  nameAr?: string;
  defaultPrice: number; // in MAD
  color?: string;
  active: boolean;
}

export type TreatmentPlanItemStatus =
  | 'proposed'
  | 'accepted'
  | 'in_progress'
  | 'completed'
  | 'abandoned';

export interface TreatmentPlanItem {
  id: string;
  procedureId: string;
  procedureName: string;
  toothNumber?: number;
  surfaces?: ToothSurface[];
  status: TreatmentPlanItemStatus;
  price: number; // in MAD
  estimatedSessions?: number;
  completedAt?: string;
}

export interface TreatmentPlan {
  id: string;
  patientId: string;
  title: string;
  status: 'draft' | 'presented' | 'accepted' | 'in_progress' | 'completed';
  items: TreatmentPlanItem[];
  totalAmount: number; // MAD
  discountAmount?: number;
  finalAmount: number; // MAD
  quoteGeneratedAt?: string;
  quotePdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Invoicing & Cash
export interface InvoiceItem {
  treatmentPlanItemId?: string;
  description: string;
  toothNumber?: number;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'unpaid' | 'partially_paid' | 'paid' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string; // Ex: FAC-2026-0001
  patientId: string;
  patientName: string;
  date: string; // ISO
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  createdAt: string;
  createdBy: string;
}

export type PaymentMethod = 'cash' | 'card' | 'check' | 'transfer';

export interface Payment {
  id: string;
  invoiceId?: string;
  patientId: string;
  patientName: string;
  amount: number; // MAD
  method: PaymentMethod;
  referenceNumber?: string;
  date: string; // ISO
  dailyClosingId?: string;
  receivedBy: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: 'supplies' | 'lab' | 'rent' | 'utilities' | 'salaries' | 'other';
  description: string;
  amount: number; // MAD
  method: PaymentMethod;
  date: string;
  dailyClosingId?: string;
  receiptUrl?: string;
  createdBy: string;
  createdAt: string;
}

export interface CashClosing {
  id: string; // YYYY-MM-DD
  date: string; // YYYY-MM-DD
  openingCash: number;
  totalCashIn: number;
  totalCardIn: number;
  totalCheckIn: number;
  totalTransferIn: number;
  totalCashOut: number;
  expectedCashInDrawer: number;
  countedCash: number;
  difference: number;
  notes?: string;
  closedBy: string;
  closedAt: string;
}

export interface MedicalDocument {
  id: string;
  patientId: string;
  type: 'prescription' | 'medical_certificate' | 'quote' | 'xray' | 'photo';
  title: string;
  language: 'fr' | 'ar';
  fileUrl: string;
  storagePath: string;
  metadata?: {
    toothNumber?: number;
    drugs?: Array<{
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }>;
  };
  createdBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'export' | 'login';
  resourceType: 'patient' | 'appointment' | 'toothChart' | 'invoice' | 'document';
  resourceId: string;
  patientId?: string;
  performedBy: string;
  userRole: string;
  timestamp: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}
