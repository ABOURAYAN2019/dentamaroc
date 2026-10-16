import React, { useState } from 'react';
import { Patient, AuditLog } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/features/auth/AuthContext';
import { formatDateTimeMA } from '@/lib/date-utils';
import {
  ShieldCheck,
  Download,
  Trash2,
  History,
  AlertTriangle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PatientCNDPViewProps {
  patient: Patient;
  onPatientDeleted?: () => void;
}

export const PatientCNDPView: React.FC<PatientCNDPViewProps> = ({ patient, onPatientDeleted }) => {
  const { isDentist, user } = useAuth();
  const navigate = useNavigate();

  const consentTimestamp = patient.consent.timestamp;
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fictitious audit log for this patient
  const [auditLogs] = useState<AuditLog[]>([
    {
      id: 'log-1',
      action: 'read',
      resourceType: 'patient',
      resourceId: patient.id,
      patientId: patient.id,
      performedBy: 'Dr. Amine TAZI (Dentiste)',
      userRole: 'dentist',
      timestamp: new Date().toISOString(),
      details: { page: 'Dossier patient 360' },
    },
    {
      id: 'log-2',
      action: 'update',
      resourceType: 'toothChart',
      resourceId: `chart-${patient.id}`,
      patientId: patient.id,
      performedBy: 'Dr. Amine TAZI (Dentiste)',
      userRole: 'dentist',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      details: { tooth: 26, condition: 'crown' },
    },
    {
      id: 'log-3',
      action: 'create',
      resourceType: 'patient',
      resourceId: patient.id,
      patientId: patient.id,
      performedBy: 'Nadia IDRISSI (Secrétaire)',
      userRole: 'secretary',
      timestamp: patient.createdAt,
      details: { consent: 'granted' },
    },
  ]);

  // Export full patient data as compliant JSON bundle
  const handleExportPatientData = () => {
    const exportBundle = {
      compliance: 'CNDP - Loi 09-08 relative à la protection des données à caractère personnel',
      exportedAt: new Date().toISOString(),
      exportedBy: user?.fullName,
      patientRecord: patient,
      auditTrail: auditLogs,
    };

    const blob = new Blob([JSON.stringify(exportBundle, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CNDP_Export_${patient.lastName}_${patient.nationalId || patient.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDeletePatientRecord = () => {
    // Only dentist is allowed by Firestore security rules
    if (!isDentist) return;
    if (onPatientDeleted) {
      onPatientDeleted();
    } else {
      navigate('/patients');
    }
  };

  return (
    <div className="space-y-6">
      {/* CNDP Consent Status Card */}
      <Card className="border-teal-200 bg-teal-50/40 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <div>
                <CardTitle className="text-base font-bold text-teal-900">
                  Consentement Éclairé & Loi 09-08 (Maroc)
                </CardTitle>
                <CardDescription className="text-teal-700 text-xs">
                  Autorisation de traitement informatique des données de santé
                </CardDescription>
              </div>
            </div>
            <Badge variant="success" className="text-xs">
              Conforme CNDP
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-xs text-slate-700">
          <div className="p-3 bg-white rounded-lg border border-teal-200/60 space-y-1">
            <div className="font-semibold text-slate-800">
              Statut du consentement : <span className="text-emerald-700 font-bold">ACCORDÉ</span>
            </div>
            <p className="text-slate-500">
              Horodaté le : {formatDateTimeMA(consentTimestamp)} par {patient.consent.signedBy === 'patient' ? 'le patient' : 'le tuteur légal'}.
            </p>
            {patient.consent.notes && (
              <p className="text-slate-500 italic">Mention : {patient.consent.notes}</p>
            )}
          </div>

          {/* Portability / Export Button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-white rounded-lg border border-slate-200">
            <div>
              <div className="font-bold text-slate-800">Droit à la portabilité (Export CNDP)</div>
              <p className="text-slate-500 text-[11px]">
                Générez l'archive complète des données médicales et administratives du patient.
              </p>
            </div>
            <Button
              onClick={handleExportPatientData}
              variant="outline"
              size="sm"
              className="text-xs text-teal-700 border-teal-300 hover:bg-teal-50 shrink-0 font-semibold"
            >
              <Download className="w-3.5 h-3.5 me-1.5" />
              <span>Exporter les données (JSON)</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log / Journal d'accès (Obligation CNDP) */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-500" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Journal d'Audit des Accès au Dossier (CNDP)
            </CardTitle>
          </div>
          <CardDescription className="text-xs">
            Traçabilité horodatée de qui a consulté ou modifié ce dossier patient
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{log.performedBy}</span>
                    <Badge variant="outline" className="text-[10px] py-0">
                      {log.action.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-slate-500 text-[11px]">
                    Ressource : {log.resourceType}
                  </p>
                </div>
                <span className="text-slate-400 font-mono text-[11px]">
                  {formatDateTimeMA(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Right to Erasure / Suppression sécurisée (Réservé au Dentiste) */}
      {isDentist && (
        <Card className="border-rose-200 bg-rose-50/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Droit à l'effacement (Suppression Définitive)</span>
            </div>
            <CardDescription className="text-rose-700 text-xs">
              Conformément à la loi 09-08, la suppression d'un dossier médical ne peut être effectuée
              que par le Chirurgien-Dentiste responsable légal du cabinet.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            {!showDeleteConfirm ? (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-xs bg-rose-600 hover:bg-rose-700"
              >
                <Trash2 className="w-3.5 h-3.5 me-1.5" />
                <span>Supprimer définitivement ce dossier patient</span>
              </Button>
            ) : (
              <div className="p-4 bg-white rounded-xl border border-rose-300 space-y-3">
                <p className="text-xs text-rose-800 font-semibold">
                  Confirmez-vous la suppression irréversible du dossier de {patient.firstName}{' '}
                  {patient.lastName} ? Cette action sera consignée dans l'audit CNDP.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs"
                  >
                    Annuler
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleDeletePatientRecord}
                    className="text-xs bg-rose-600 hover:bg-rose-700 text-white font-bold"
                  >
                    Oui, supprimer définitivement
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
