import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';
import {
  DEMO_APPOINTMENTS,
  DEMO_PATIENTS,
  DEMO_CLINIC,
} from '@/features/auth/demoData';
import { Appointment, AppointmentStatus } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatTimeMA, formatDateMA } from '@/lib/date-utils';
import { formatMoroccanPhone, getWhatsAppReminderLink } from '@/lib/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  MessageCircle,
  AlertTriangle,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const AgendaPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDentist, isAssistant, isSecretary } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [appointments, setAppointments] = useState<Appointment[]>(DEMO_APPOINTMENTS);
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [selectedDentist, setSelectedDentist] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Modal State
  const isNewModalOpen = searchParams.get('action') === 'new';
  const openNewModal = () => setSearchParams({ action: 'new' });
  const closeNewModal = () => setSearchParams({});

  // Form State
  const [patientId, setPatientId] = useState<string>(
    searchParams.get('patientId') || DEMO_PATIENTS[0].id
  );
  const [appointmentDate, setAppointmentDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [startTime, setStartTime] = useState<string>('10:00');
  const [durationMinutes, setDurationMinutes] = useState<number>(30);
  const [dentistId, setDentistId] = useState<string>('user-dentist-1');
  const [reason, setReason] = useState<string>('Consultation & Contrôle');
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  // Check Conflict Function
  const checkConflict = (newStartISO: string, newEndISO: string, pDentistId: string) => {
    const startTimestamp = new Date(newStartISO).getTime();
    const endTimestamp = new Date(newEndISO).getTime();

    const conflict = appointments.find((apt) => {
      if (apt.dentistId !== pDentistId || apt.status === 'cancelled') return false;
      const aptStart = new Date(apt.startTime).getTime();
      const aptEnd = new Date(apt.endTime).getTime();

      // Check overlap
      return startTimestamp < aptEnd && endTimestamp > aptStart;
    });

    return conflict;
  };

  const handleCreateAppointment = (e: React.FormEvent) => {
    e.preventDefault();

    const startDateTime = new Date(`${appointmentDate}T${startTime}:00`);
    const endDateTime = new Date(startDateTime.getTime() + durationMinutes * 60000);

    const startISO = startDateTime.toISOString();
    const endISO = endDateTime.toISOString();

    const conflict = checkConflict(startISO, endISO, dentistId);
    if (conflict) {
      setConflictWarning(
        `Conflit détecté : Le praticien a déjà un RDV avec ${conflict.patientName} à cette heure.`
      );
      return;
    }

    const patient = DEMO_PATIENTS.find((p) => p.id === patientId) || DEMO_PATIENTS[0];

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      dentistId,
      dentistName: 'Dr. Amine TAZI',
      startTime: startISO,
      endTime: endISO,
      status: 'scheduled',
      reason,
      reminderSent: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setAppointments([...appointments, newApt]);
    setConflictWarning(null);
    closeNewModal();
  };

  const handleUpdateStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (selectedDentist !== 'all' && apt.dentistId !== selectedDentist) return false;
    // In day mode, filter by date
    if (viewMode === 'day') {
      return apt.startTime.startsWith(selectedDate);
    }
    return true;
  });

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'arrived':
        return <Badge variant="warning">En attente</Badge>;
      case 'in_progress':
        return <Badge variant="info">Au fauteuil</Badge>;
      case 'completed':
        return <Badge variant="success">Terminé</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Annulé</Badge>;
      case 'no_show':
        return <Badge variant="destructive">Absent</Badge>;
      default:
        return <Badge variant="secondary">Planifié</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('agenda.title')}</h1>
          <p className="text-sm text-slate-500">
            Agenda tactile multi-praticiens et rappels WhatsApp direct (wa.me)
          </p>
        </div>

        <Button
          onClick={openNewModal}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
        >
          <Plus className="w-4 h-4 me-1.5" />
          {t('agenda.newAppointment')}
        </Button>
      </div>

      {/* Control bar: Day/Week Switch, Date Navigator, Dentist filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          {/* Day / Week Buttons */}
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Jour
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-teal-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vue Semaine
            </button>
          </div>

          {/* Date Picker */}
          <div className="flex items-center gap-1.5 ps-2">
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="h-9 text-xs w-36"
            />
          </div>
        </div>

        {/* Practitioner Filter */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-medium text-slate-500 hidden sm:inline">Praticien :</span>
          <select
            value={selectedDentist}
            onChange={(e) => setSelectedDentist(e.target.value)}
            className="h-9 text-xs rounded-md border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-700"
          >
            <option value="all">Tous les praticiens</option>
            <option value="user-dentist-1">Dr. Amine TAZI</option>
          </select>
        </div>
      </div>

      {/* Appointment Slots / Timeline */}
      <div className="grid grid-cols-1 gap-3">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((apt) => {
            const waMessage = `Bonjour ${apt.patientName}, votre chirurgien-dentiste ${apt.dentistName} vous attend pour votre RDV du ${formatDateMA(apt.startTime)} à ${formatTimeMA(apt.startTime)}. Cabinet ${DEMO_CLINIC.name}.`;
            const waLink = getWhatsAppReminderLink(apt.patientPhone, waMessage);

            return (
              <Card
                key={apt.id}
                className="border-slate-200 shadow-sm hover:border-teal-400 transition-all bg-white"
              >
                <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  {/* Time & Patient Info */}
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-teal-50 border border-teal-200/60 min-w-[80px]">
                      <span className="text-sm font-extrabold text-teal-800">
                        {formatTimeMA(apt.startTime)}
                      </span>
                      <span className="text-[10px] text-teal-600 font-medium">
                        {formatTimeMA(apt.endTime)}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-slate-800">
                          {apt.patientName}
                        </h3>
                        {getStatusBadge(apt.status)}
                      </div>
                      <p className="text-xs font-medium text-slate-600">{apt.reason}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span>{formatMoroccanPhone(apt.patientPhone)}</span>
                        <span>•</span>
                        <span>{apt.dentistName}</span>
                        {apt.notes && (
                          <>
                            <span>•</span>
                            <span className="italic text-slate-500">Note: {apt.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    {/* WhatsApp 1-Click Reminder */}
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors"
                      title="Ouvrir WhatsApp Web avec message pré-rempli"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Rappel WhatsApp</span>
                    </a>

                    {/* Status Changer */}
                    <select
                      value={apt.status}
                      onChange={(e) =>
                        handleUpdateStatus(apt.id, e.target.value as AppointmentStatus)
                      }
                      className="h-8 text-xs rounded-lg border border-slate-300 bg-white px-2.5 font-medium"
                    >
                      <option value="scheduled">Planifié</option>
                      <option value="arrived">En salle d'attente</option>
                      <option value="in_progress">Au fauteuil</option>
                      <option value="completed">Terminé</option>
                      <option value="no_show">Absent</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <h3 className="text-base font-semibold text-slate-700">Aucun rendez-vous ce jour</h3>
            <p className="text-xs text-slate-500 mt-1">
              Sélectionnez une autre date ou planifiez un nouveau créneau.
            </p>
          </div>
        )}
      </div>

      {/* Modal Nouveau Rendez-vous */}
      <Dialog open={isNewModalOpen} onOpenChange={(open) => !open && closeNewModal()}>
        <DialogCloseButton onClose={closeNewModal} />
        <DialogHeader>
          <DialogTitle>Planifier un rendez-vous</DialogTitle>
          <DialogDescription>
            Attribution d'un créneau horaire avec détection automatique de chevauchement
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateAppointment} className="space-y-4">
          {conflictWarning && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-lg text-xs text-rose-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{conflictWarning}</span>
            </div>
          )}

          <div className="space-y-1">
            <Label>Patient *</Label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              {DEMO_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName.toUpperCase()} {p.firstName} ({formatMoroccanPhone(p.phone)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Date *</Label>
              <Input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => {
                  setAppointmentDate(e.target.value);
                  setConflictWarning(null);
                }}
              />
            </div>
            <div className="space-y-1">
              <Label>Heure de début *</Label>
              <Input
                type="time"
                required
                value={startTime}
                onChange={(e) => {
                  setStartTime(e.target.value);
                  setConflictWarning(null);
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Durée estimée</Label>
              <select
                value={durationMinutes}
                onChange={(e) => {
                  setDurationMinutes(Number(e.target.value));
                  setConflictWarning(null);
                }}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
              >
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 heure</option>
                <option value={90}>1h30 (Chirurgie)</option>
              </select>
            </div>

            <div className="space-y-1">
              <Label>Praticien traitant</Label>
              <select
                value={dentistId}
                onChange={(e) => {
                  setDentistId(e.target.value);
                  setConflictWarning(null);
                }}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
              >
                <option value="user-dentist-1">Dr. Amine TAZI</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Motif du RDV *</Label>
            <Input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Soin carie, détartrage, urgence, pose couronne..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={closeNewModal}>
              Annuler
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Confirmer le RDV
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
