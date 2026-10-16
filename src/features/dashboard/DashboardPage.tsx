import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import {
  DEMO_APPOINTMENTS,
  DEMO_PATIENTS,
  DEMO_INVOICES,
  DEMO_PROCEDURES,
} from '@/features/auth/demoData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMAD, formatMoroccanPhone, getWhatsAppReminderLink } from '@/lib/formatters';
import { formatTimeMA } from '@/lib/date-utils';
import {
  Calendar,
  Users,
  TrendingUp,
  AlertCircle,
  CreditCard,
  MessageCircle,
  Clock,
  CheckCircle2,
  UserCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AppointmentStatus } from '@/types';
import { appConfig } from '@/config/app.config';

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isBillingStaff } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState(DEMO_APPOINTMENTS);

  // Compute KPIs
  const todayAptsCount = appointments.length;
  const inWaitingRoom = appointments.filter((a) => a.status === 'arrived').length;
  const inChair = appointments.filter((a) => a.status === 'in_progress').length;
  const monthlyRevenue = DEMO_INVOICES.reduce((acc, inv) => acc + inv.paidAmount, 0);
  const totalUnpaid = DEMO_PATIENTS.reduce((acc, p) => acc + p.financialSummary.balance, 0);

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
    );
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    const label = t(`agenda.status.${status}`);
    switch (status) {
      case 'arrived':
        return <Badge variant="warning">{label}</Badge>;
      case 'in_progress':
        return <Badge variant="info">{label}</Badge>;
      case 'completed':
        return <Badge variant="success">{label}</Badge>;
      case 'cancelled':
      case 'no_show':
        return <Badge variant="destructive">{label}</Badge>;
      default:
        return <Badge variant="secondary">{label}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
            {t('dashboard.welcome', { name: user?.fullName })}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {t('dashboard.realtimeSubtitle', { city: appConfig.regional.defaultCity })}
          </p>
        </div>

        {/* Quick actions (3-clicks shortcut) */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            onClick={() => navigate('/agenda?action=new')}
            className="flex-1 sm:flex-none bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs h-9 shadow-sm"
          >
            <Calendar className="w-4 h-4 me-1.5" />
            {t('dashboard.newAppointment')}
          </Button>

          <Button
            onClick={() => navigate('/patients?action=new')}
            variant="secondary"
            className="flex-1 sm:flex-none text-xs h-9 font-semibold"
          >
            <Users className="w-4 h-4 me-1.5 text-teal-700" />
            {t('dashboard.newPatient')}
          </Button>

          {isBillingStaff && (
            <Button
              onClick={() => navigate('/billing?action=pay')}
              variant="outline"
              className="flex-1 sm:flex-none text-xs h-9 font-semibold border-teal-300 text-teal-800 hover:bg-teal-50"
            >
              <CreditCard className="w-4 h-4 me-1.5 text-teal-700" />
              {t('dashboard.quickPayment')}
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today appointments */}
        <Card className="hover:shadow-md transition-shadow border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
              {t('dashboard.todayAppointments')}
            </CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-slate-900">{todayAptsCount}</div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-600">
              <span className="font-semibold text-amber-600">
                {t('dashboard.waitingCount', { count: inWaitingRoom })}
              </span>
              <span>•</span>
              <span className="font-semibold text-sky-600">
                {t('dashboard.inChairCount', { count: inChair })}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        {isBillingStaff ? (
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                {t('dashboard.monthlyRevenue')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-emerald-600">
                {formatMAD(monthlyRevenue)}
              </div>
              <p className="text-xs text-slate-500 mt-2">2026</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                {t('dashboard.todayAppointments')}
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-teal-700">{todayAptsCount}</div>
              <p className="text-xs text-slate-500 mt-2">{appConfig.regional.defaultCity}</p>
            </CardContent>
          </Card>
        )}

        {/* Patient Balances */}
        {isBillingStaff ? (
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                {t('dashboard.pendingBalances')}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-rose-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-rose-600">
                {formatMAD(totalUnpaid)}
              </div>
              <p className="text-xs text-slate-500 mt-2">{appConfig.regional.currency}</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="hover:shadow-md transition-shadow border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold text-slate-500 uppercase">
                {t('common.status')}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-extrabold text-teal-600">OK</div>
              <p className="text-xs text-slate-500 mt-2">{appConfig.regional.regulatoryAuthority}</p>
            </CardContent>
          </Card>
        )}

        {/* Waiting Room active */}
        <Card className="hover:shadow-md transition-shadow border-slate-200 bg-amber-50/40">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-amber-800 uppercase">
              {t('dashboard.waitingRoom')}
            </CardTitle>
            <UserCheck className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-800">{inWaitingRoom}</div>
            <p className="text-xs text-amber-700 mt-2">{t('dashboard.readyForInstall')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Section: Today's Timeline & Frequent Procedures */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule Table */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-800">
                {t('dashboard.todaySchedule', { count: appointments.length })}
              </CardTitle>
              <CardDescription>{t('dashboard.todayScheduleDesc')}</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/agenda')}
              className="text-xs"
            >
              {t('dashboard.viewFullAgenda')}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {appointments.map((apt) => {
                const waLink = getWhatsAppReminderLink(
                  apt.patientPhone,
                  `Bonjour ${apt.patientName}, nous vous confirmons votre RDV chez ${appConfig.app.name} aujourd'hui à ${formatTimeMA(apt.startTime)} avec ${apt.dentistName}.`
                );

                return (
                  <div
                    key={apt.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50/80 transition-colors gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col items-center justify-center bg-teal-50 text-teal-800 rounded-lg p-2 min-w-[65px] border border-teal-200/50">
                        <Clock className="w-3.5 h-3.5 text-teal-600 mb-0.5" />
                        <span className="text-xs font-bold">{formatTimeMA(apt.startTime)}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/patients/${apt.patientId}`)}
                            className="font-bold text-sm text-slate-800 hover:text-teal-700 hover:underline text-start"
                          >
                            {apt.patientName}
                          </button>
                          {getStatusBadge(apt.status)}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 font-medium">
                          {apt.reason}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {formatMoroccanPhone(apt.patientPhone)} • {apt.dentistName}
                        </p>
                      </div>
                    </div>

                    {/* Quick status & WhatsApp action */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                        title={t('agenda.sendWhatsAppReminder')}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>

                      {apt.status === 'scheduled' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs h-7 px-2 bg-amber-100 text-amber-800 hover:bg-amber-200"
                          onClick={() => handleUpdateStatus(apt.id, 'arrived')}
                        >
                          {t('dashboard.markArrived')}
                        </Button>
                      )}

                      {apt.status === 'arrived' && (
                        <Button
                          size="sm"
                          className="text-xs h-7 px-2 bg-teal-600 hover:bg-teal-700 text-white"
                          onClick={() => handleUpdateStatus(apt.id, 'in_progress')}
                        >
                          {t('dashboard.sendToChair')}
                        </Button>
                      )}

                      {apt.status === 'in_progress' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleUpdateStatus(apt.id, 'completed')}
                        >
                          {t('dashboard.completeVisit')}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Right side: Most frequent procedures & Quick patient summary */}
        <div className="space-y-4">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-bold text-slate-800">
                {t('dashboard.frequentProcedures')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.pricingSubtitle', { currency: appConfig.regional.currency })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {DEMO_PROCEDURES.slice(0, 5).map((proc) => (
                <div
                  key={proc.id}
                  className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <div className="font-medium text-slate-700 line-clamp-1 pe-2">
                    {proc.nameFr}
                  </div>
                  <div className="font-bold text-teal-800 shrink-0">
                    {formatMAD(proc.defaultPrice)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Compliance & Healthcare Security banner */}
          <div className="p-4 rounded-xl border border-teal-200 bg-teal-50/60 text-teal-900 text-xs space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-teal-800">
              <CheckCircle2 className="w-4 h-4 text-teal-600" />
              <span>
                {t('dashboard.cndpActive', { authority: appConfig.regional.regulatoryAuthority })}
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed">{t('dashboard.cndpAuditDesc')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
