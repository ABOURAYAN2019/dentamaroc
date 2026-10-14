import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_PATIENTS } from '@/features/auth/demoData';
import { Patient } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatMAD, formatMoroccanPhone } from '@/lib/formatters';
import { formatDateMA, calculateAge } from '@/lib/date-utils';
import {
  Search,
  UserPlus,
  AlertTriangle,
  Phone,
  FileCheck,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDentist, isAssistant, isSecretary } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [patients, setPatients] = useState<Patient[]>(DEMO_PATIENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDebtorOnly, setFilterDebtorOnly] = useState(false);

  // Modal State
  const isNewModalOpen = searchParams.get('action') === 'new';
  const openNewModal = () => setSearchParams({ action: 'new' });
  const closeNewModal = () => setSearchParams({});

  // Form State for new patient
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    birthDate: '1990-01-01',
    gender: 'M' as 'M' | 'F',
    phone: '+2126',
    email: '',
    address: '',
    allergies: '',
    conditions: '',
    bloodGroup: 'O+' as Patient['medicalHistory']['bloodGroup'],
    consentGranted: true,
  });

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        patient.firstName.toLowerCase().includes(q) ||
        patient.lastName.toLowerCase().includes(q) ||
        (patient.nationalId && patient.nationalId.toLowerCase().includes(q)) ||
        patient.phone.includes(q);

      const matchDebtor = !filterDebtorOnly || patient.financialSummary.balance > 0;

      return matchSearch && matchDebtor;
    });
  }, [patients, searchQuery, filterDebtorOnly]);

  const handleCreatePatient = (e: React.FormEvent) => {
    e.preventDefault();
    const newPatient: Patient = {
      id: `pat-${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      nationalId: formData.nationalId.toUpperCase() || undefined,
      birthDate: formData.birthDate,
      gender: formData.gender,
      phone: formData.phone,
      email: formData.email || undefined,
      address: formData.address || undefined,
      city: 'Casablanca',
      medicalHistory: {
        allergies: formData.allergies ? formData.allergies.split(',').map((s) => s.trim()) : [],
        conditions: formData.conditions ? formData.conditions.split(',').map((s) => s.trim()) : [],
        bloodGroup: formData.bloodGroup,
      },
      consent: {
        granted: formData.consentGranted,
        timestamp: new Date().toISOString(),
        signedBy: 'patient',
        notes: 'Consentement accordé à la création du dossier.',
      },
      financialSummary: {
        totalInvoiced: 0,
        totalPaid: 0,
        balance: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPatients([newPatient, ...patients]);
    closeNewModal();
    navigate(`/patients/${newPatient.id}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('patients.title')}</h1>
          <p className="text-sm text-slate-500">
            {patients.length} dossiers actifs • Recherche rapide par CIN, nom ou téléphone (+212)
          </p>
        </div>

        <Button
          onClick={openNewModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
        >
          <UserPlus className="w-4 h-4 me-2" />
          {t('patients.newPatient')}
        </Button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('patients.searchPlaceholder')}
            className="ps-9 border-slate-200 bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterDebtorOnly(!filterDebtorOnly)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              filterDebtorOnly
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Soldes Débiteurs ({patients.filter((p) => p.financialSummary.balance > 0).length})</span>
          </button>
        </div>
      </div>

      {/* Patients List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPatients.map((patient) => {
          const age = calculateAge(patient.birthDate);
          const hasAllergies = patient.medicalHistory.allergies.length > 0;
          const hasConditions = patient.medicalHistory.conditions.length > 0;
          const hasBalance = patient.financialSummary.balance > 0;

          return (
            <Card
              key={patient.id}
              onClick={() => navigate(`/patients/${patient.id}`)}
              className="cursor-pointer hover:border-teal-500 hover:shadow-md transition-all group border-slate-200 bg-white"
            >
              <CardContent className="p-5 space-y-3">
                {/* Header card with name & CIN */}
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-800 group-hover:text-teal-700 transition-colors">
                      {patient.lastName.toUpperCase()} {patient.firstName}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{age} ans ({formatDateMA(patient.birthDate)})</span>
                      {patient.nationalId && (
                        <>
                          <span>•</span>
                          <span className="font-semibold text-slate-700">{patient.nationalId}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                </div>

                {/* Contact phone */}
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-medium">{formatMoroccanPhone(patient.phone)}</span>
                </div>

                {/* Medical alert badges (Visible only if clinical staff) */}
                {!isSecretary && (hasAllergies || hasConditions) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {hasAllergies && (
                      <Badge variant="destructive" className="text-[10px] py-0 px-2 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Allergie: {patient.medicalHistory.allergies.join(', ')}</span>
                      </Badge>
                    )}
                    {hasConditions && (
                      <Badge variant="warning" className="text-[10px] py-0 px-2">
                        {patient.medicalHistory.conditions[0]}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Footer with financial balance & CNDP consent */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] font-medium">CNDP Conforme</span>
                  </div>

                  <div>
                    {hasBalance ? (
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Dû : {formatMAD(patient.financialSummary.balance)}
                      </span>
                    ) : (
                      <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        À jour
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-semibold text-slate-700">Aucun patient trouvé</h3>
          <p className="text-xs text-slate-500 mt-1">
            Modifiez votre recherche ou créez un nouveau dossier patient.
          </p>
        </div>
      )}

      {/* Modal Nouveau Patient */}
      <Dialog open={isNewModalOpen} onOpenChange={(open) => !open && closeNewModal()}>
        <DialogCloseButton onClose={closeNewModal} />
        <DialogHeader>
          <DialogTitle>{t('patients.newPatient')}</DialogTitle>
          <DialogDescription>
            Enregistrement d'un nouveau dossier conformément à la loi 09-08 (CNDP)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreatePatient} className="space-y-4 overflow-y-auto max-h-[70vh] pe-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="lastName">Nom de famille *</Label>
              <Input
                id="lastName"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Ex: BENNANI"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Ex: Karim"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label htmlFor="nationalId">CIN (Maroc)</Label>
              <Input
                id="nationalId"
                value={formData.nationalId}
                onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                placeholder="Ex: BE123456"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="birthDate">Date de naissance *</Label>
              <Input
                id="birthDate"
                type="date"
                required
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="gender">Genre</Label>
              <select
                id="gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'M' | 'F' })}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm"
              >
                <option value="M">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="phone">Téléphone portable * (+212)</Label>
              <Input
                id="phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+2126XXXXXXXX"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="patient@email.com"
              />
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="address">Adresse à Casablanca ou région</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Quartier, Rue, Résidence..."
            />
          </div>

          {/* Antécédents médicaux (Section Clinique) */}
          <div className="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200/80 space-y-3">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-xs uppercase">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Antécédents & Alertes Médicales (Confidentiel)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="allergies" className="text-xs">
                  Allergies connues (séparer par virgule)
                </Label>
                <Input
                  id="allergies"
                  value={formData.allergies}
                  onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                  placeholder="Pénicilline, Latex, Anesthésiques..."
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="conditions" className="text-xs">
                  Pathologies / Traitements à risque
                </Label>
                <Input
                  id="conditions"
                  value={formData.conditions}
                  onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                  placeholder="Hypertension, Diabète, Sintrom..."
                />
              </div>
            </div>
          </div>

          {/* Consentement CNDP */}
          <div className="p-3 bg-teal-50/60 rounded-xl border border-teal-200 text-xs space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.consentGranted}
                onChange={(e) => setFormData({ ...formData, consentGranted: e.target.checked })}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
              />
              <span className="text-slate-700 leading-tight">
                <strong>Consentement patient (Loi 09-08) :</strong> Le patient a été informé et consent
                à la conservation et au traitement informatique de ses données de santé pour son suivi dentaire.
              </span>
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeNewModal}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Créer le dossier et ouvrir
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
