import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_PATIENTS } from '@/features/auth/demoData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatMAD, formatMoroccanPhone } from '@/lib/formatters';
import { formatDateMA, calculateAge } from '@/lib/date-utils';
import { OdontogramView } from '@/features/odontogram/OdontogramView';
import { TreatmentPlansView } from '@/features/treatments/TreatmentPlansView';
import { PatientBillingView } from '@/features/billing/PatientBillingView';
import { PatientCNDPView } from './PatientCNDPView';
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  AlertTriangle,
  Calendar,
  Lock,
} from 'lucide-react';

export const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { isClinicalStaff } = useAuth();

  const patient = DEMO_PATIENTS.find((p) => p.id === id) || DEMO_PATIENTS[0];
  const age = calculateAge(patient.birthDate);
  const hasAllergies = patient.medicalHistory.allergies.length > 0;
  const hasConditions = patient.medicalHistory.conditions.length > 0;
  const hasBalance = patient.financialSummary.balance > 0;

  const [activeTab, setActiveTab] = useState<string>('overview');

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/patients')}
          className="text-xs text-slate-500 hover:text-slate-800 ps-0"
        >
          <ArrowLeft className="w-4 h-4 me-1" />
          <span>Retour à la liste des patients</span>
        </Button>
      </div>

      {/* Patient Header Card */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <div className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-extrabold text-slate-900">
                {patient.lastName.toUpperCase()} {patient.firstName}
              </h1>
              {patient.nationalId && (
                <Badge variant="outline" className="font-mono text-xs font-bold text-slate-700">
                  CIN: {patient.nationalId}
                </Badge>
              )}
              {patient.gender === 'M' ? (
                <span className="text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded-full font-semibold">
                  Homme
                </span>
              ) : (
                <span className="text-xs bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full font-semibold">
                  Femme
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span>{age} ans ({formatDateMA(patient.birthDate)})</span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Phone className="w-3.5 h-3.5 text-teal-600" />
                {formatMoroccanPhone(patient.phone)}
              </span>
              {patient.email && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {patient.email}
                  </span>
                </>
              )}
              {patient.address && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {patient.address}, {patient.city || 'Casablanca'}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Balance & Quick Actions */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
            <div className="text-end">
              <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                Solde Patient
              </span>
              <span
                className={`text-lg font-extrabold ${
                  hasBalance ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {hasBalance ? formatMAD(patient.financialSummary.balance) : 'À jour (0 MAD)'}
              </span>
            </div>

            <Button
              onClick={() => navigate(`/agenda?action=new&patientId=${patient.id}`)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-9 shadow-sm"
            >
              <Calendar className="w-3.5 h-3.5 me-1.5" />
              Nouveau RDV
            </Button>
          </div>
        </div>

        {/* High-Risk Medical Alerts Banner (visible only for Clinical Staff: Dentist & Assistant) */}
        {isClinicalStaff && (hasAllergies || hasConditions) && (
          <div className="bg-rose-50 border-t border-b border-rose-200 px-6 py-2.5 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-rose-800 font-bold text-xs uppercase shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Alerte Médicale :</span>
            </div>
            {hasAllergies && (
              <span className="text-xs font-bold text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300">
                Allergie(s) : {patient.medicalHistory.allergies.join(', ')}
              </span>
            )}
            {hasConditions && (
              <span className="text-xs font-semibold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
                Antécédents : {patient.medicalHistory.conditions.join(', ')}
              </span>
            )}
            {patient.medicalHistory.bloodGroup && (
              <span className="text-xs font-bold text-rose-800">
                Groupe : {patient.medicalHistory.bloodGroup}
              </span>
            )}
          </div>
        )}
      </Card>

      {/* Tabs Menu */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white border border-slate-200 shadow-sm p-1">
          <TabsTrigger value="overview">{t('patients.tabs.overview')}</TabsTrigger>
          {isClinicalStaff && (
            <TabsTrigger value="odontogram">{t('patients.tabs.odontogram')}</TabsTrigger>
          )}
          {isClinicalStaff && (
            <TabsTrigger value="treatments">{t('patients.tabs.treatmentPlans')}</TabsTrigger>
          )}
          <TabsTrigger value="billing">{t('patients.tabs.billing')}</TabsTrigger>
          <TabsTrigger value="cndp">{t('patients.tabs.cndp')}</TabsTrigger>
        </TabsList>

        {/* Tab 1: Overview */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Identity Details */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardContent className="p-6 space-y-4">
                <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider">
                  Informations Administratives
                </h3>
                <div className="divide-y divide-slate-100 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Nom & Prénom</span>
                    <span className="font-semibold text-slate-800">
                      {patient.lastName} {patient.firstName}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">CIN (Maroc)</span>
                    <span className="font-semibold text-slate-800">
                      {patient.nationalId || 'Non renseigné'}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Date de naissance</span>
                    <span className="font-semibold text-slate-800">
                      {formatDateMA(patient.birthDate)} ({age} ans)
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Téléphone mobile</span>
                    <span className="font-semibold text-slate-800">
                      {formatMoroccanPhone(patient.phone)}
                    </span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-500">Adresse</span>
                    <span className="font-semibold text-slate-800">
                      {patient.address || 'Casablanca'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Medical History (Restricted to Clinical Staff) */}
            {isClinicalStaff ? (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider flex items-center justify-between">
                    <span>Antécédents & Questionnaire Médical</span>
                    <Badge variant="outline" className="text-[10px]">
                      Personnel Soignant
                    </Badge>
                  </h3>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="font-semibold text-slate-600 block mb-1">
                        Allergies signalées :
                      </span>
                      {hasAllergies ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patient.medicalHistory.allergies.map((a, i) => (
                            <Badge key={i} variant="destructive">
                              {a}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Aucune allergie connue</span>
                      )}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-600 block mb-1">
                        Pathologies & Traitements chroniques :
                      </span>
                      {hasConditions ? (
                        <div className="flex flex-wrap gap-1.5">
                          {patient.medicalHistory.conditions.map((c, i) => (
                            <Badge key={i} variant="warning">
                              {c}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Aucune pathologie déclarée</span>
                      )}
                    </div>

                    {patient.medicalHistory.notes && (
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-700">
                        <span className="font-semibold block mb-0.5">Note clinique :</span>
                        <p>{patient.medicalHistory.notes}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-2">
                  <Lock className="w-8 h-8 text-slate-400" />
                  <h4 className="font-semibold text-sm text-slate-700">
                    Dossier Médical Confidentiel
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Conformément aux règles de déontologie et de confidentialité, les antécédents médicaux ne sont pas accessibles au personnel d'accueil/secrétariat.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Tab 2: Odontogram */}
        {isClinicalStaff && (
          <TabsContent value="odontogram">
            <OdontogramView patientId={patient.id} />
          </TabsContent>
        )}

        {/* Tab 3: Treatment Plans */}
        {isClinicalStaff && (
          <TabsContent value="treatments">
            <TreatmentPlansView patient={patient} />
          </TabsContent>
        )}

        {/* Tab 4: Billing */}
        <TabsContent value="billing">
          <PatientBillingView patient={patient} />
        </TabsContent>

        {/* Tab 5: CNDP */}
        <TabsContent value="cndp">
          <PatientCNDPView patient={patient} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
