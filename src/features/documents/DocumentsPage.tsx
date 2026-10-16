import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DEMO_PATIENTS, DEMO_CLINIC } from '@/features/auth/demoData';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatDateMA, calculateAge } from '@/lib/date-utils';
import { jsPDF } from 'jspdf';
import {
  Printer,
  Trash2,
} from 'lucide-react';

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const COMMON_DRUGS = [
  { name: 'Amoxicilline 1g', dosage: '1 comprimé', frequency: '2 fois par jour (Matin et Soir)', duration: '6 jours' },
  { name: 'Augmentin 1g (Amoxicilline + Ac. Clavulanique)', dosage: '1 sachet', frequency: '2 fois par jour au milieu des repas', duration: '6 jours' },
  { name: 'Doliprane 1000mg (Paracétamol)', dosage: '1 comprimé', frequency: 'Toutes les 6 heures en cas de douleur (max 3g/j)', duration: '4 jours' },
  { name: 'Bi-Profenid 150mg (Kétoprofène)', dosage: '1 comprimé', frequency: '1 fois par jour au cours du repas', duration: '3 jours' },
  { name: 'Bain de bouche Chlorhexidine 0.12%', dosage: '1 gobelet doseur', frequency: '3 fois par jour après brossage', duration: '7 jours' },
  { name: 'Rodogyl (Spiramycine + Métronidazole)', dosage: '2 comprimés', frequency: '2 fois par jour', duration: '6 jours' },
];

export const DocumentsPage: React.FC = () => {
  const { t } = useTranslation();

  const [documentType, setDocumentType] = useState<'prescription' | 'certificate'>('prescription');
  const [selectedPatientId, setSelectedPatientId] = useState<string>(DEMO_PATIENTS[0].id);

  // Prescription Form State
  const [items, setItems] = useState<PrescriptionItem[]>([
    {
      id: 'item-1',
      name: 'Amoxicilline 1g',
      dosage: '1 comprimé',
      frequency: 'Matin et Soir au milieu du repas',
      duration: '6 jours',
    },
    {
      id: 'item-2',
      name: 'Doliprane 1000mg',
      dosage: '1 comprimé',
      frequency: 'Toutes les 6h si douleur',
      duration: '4 jours',
    },
  ]);

  // Certificate Form State
  const [certificateDays, setCertificateDays] = useState<number>(2);
  const [certificateReason, setCertificateReason] = useState<string>(
    'Intervention chirurgicale d’avulsion de dent de sagesse incluse sous anesthésie locale'
  );

  const selectedPatient =
    DEMO_PATIENTS.find((p) => p.id === selectedPatientId) || DEMO_PATIENTS[0];

  const handleAddDrug = (drug: typeof COMMON_DRUGS[0]) => {
    const newItem: PrescriptionItem = {
      id: `drug-${Date.now()}`,
      name: drug.name,
      dosage: drug.dosage,
      frequency: drug.frequency,
      duration: drug.duration,
    };
    setItems([...items, newItem]);
  };

  const handleRemoveDrug = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  // Generate Prescription PDF
  const handlePrintPrescription = () => {
    const doc = new jsPDF();

    // Cabinet Header
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.text(DEMO_CLINIC.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text('Chirurgie Dentaire & Implantologie', 14, 26);
    doc.text(`${DEMO_CLINIC.address.street}, ${DEMO_CLINIC.address.city}`, 14, 31);
    doc.text(`Tél : ${DEMO_CLINIC.phones.join(' / ')} | INPE : ${DEMO_CLINIC.licenseNumber}`, 14, 36);

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // Date & Place
    doc.setFontSize(10);
    doc.setTextColor(40);
    doc.text(`Casablanca, le ${formatDateMA(new Date())}`, 140, 48);

    // Patient box
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Patient(e) : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`, 14, 56);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(
      `Âge : ${calculateAge(selectedPatient.birthDate)} ans  |  CIN : ${selectedPatient.nationalId || 'N/A'}`,
      14,
      62
    );

    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(14, 68, 196, 68);

    // Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(13, 148, 136);
    doc.text('ORDONNANCE MÉDICALE', 75, 80);

    // Drugs List
    let y = 96;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(30);

    items.forEach((item, index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}.  ${item.name}`, 18, y);
      y += 6;
      doc.setFont('helvetica', 'normal');
      doc.text(`    - Posologie : ${item.dosage}, ${item.frequency}`, 18, y);
      y += 5;
      doc.text(`    - Durée : Pendant ${item.duration}`, 18, y);
      y += 12;
    });

    // Signature stamp
    y = Math.max(y + 10, 220);
    doc.rect(120, y, 76, 35);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Signature et Cachet du Chirurgien-Dentiste :', 124, y + 8);

    doc.save(`Ordonnance_${selectedPatient.lastName}_${formatDateMA(new Date())}.pdf`);
  };

  // Generate Certificate PDF
  const handlePrintCertificate = () => {
    const doc = new jsPDF();

    // Cabinet Header
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.text(DEMO_CLINIC.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${DEMO_CLINIC.address.street}, ${DEMO_CLINIC.address.city}`, 14, 26);
    doc.text(`Tél : ${DEMO_CLINIC.phones.join(' / ')} | INPE : ${DEMO_CLINIC.licenseNumber}`, 14, 31);

    doc.setDrawColor(200);
    doc.line(14, 36, 196, 36);

    // Title
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30);
    doc.text('CERTIFICAT D’APTITUDE / ARRÊT DE TRAVAIL', 40, 56);

    // Content
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 80;
    doc.text(
      `Je soussigné, Dr. Amine TAZI, Chirurgien-Dentiste inscrit à l'Ordre National des Médecins Dentistes`,
      14,
      y
    );
    y += 8;
    doc.text(`sous le N° INPE ${DEMO_CLINIC.licenseNumber}, certifie avoir examiné ce jour :`, 14, y);

    y += 14;
    doc.setFont('helvetica', 'bold');
    doc.text(
      `Madame / Monsieur : ${selectedPatient.lastName.toUpperCase()} ${selectedPatient.firstName}`,
      24,
      y
    );
    y += 8;
    doc.text(`Titulaire de la CIN N° : ${selectedPatient.nationalId || 'N/A'}`, 24, y);

    y += 16;
    doc.setFont('helvetica', 'normal');
    doc.text(`Et atteste que son état de santé bucco-dentaire nécessite :`, 14, y);
    y += 8;
    doc.text(`- Motif : ${certificateReason}`, 24, y);
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(225, 29, 72);
    doc.text(
      `- Un repos médical / arrêt de travail de : ${certificateDays} jour(s) à compter de ce jour, sauf complication.`,
      24,
      y
    );

    y += 24;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(
      `Certificat délivré à l'intéressé(e) en mains propres pour servir et valoir ce que de droit.`,
      14,
      y
    );

    y += 15;
    doc.text(`Fait à Casablanca, le ${formatDateMA(new Date())}`, 120, y);

    // Signature stamp
    y += 15;
    doc.rect(120, y, 76, 35);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Cachet et signature du Praticien :', 124, y + 8);

    doc.save(`Certificat_${selectedPatient.lastName}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {t('nav.documents')}
          </h1>
          <p className="text-sm text-slate-500">
            Émission d'ordonnances dentaires et certificats médicaux avec en-tête officiel
          </p>
        </div>

        {/* Print Action */}
        <Button
          onClick={documentType === 'prescription' ? handlePrintPrescription : handlePrintCertificate}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
        >
          <Printer className="w-4 h-4 me-2" />
          <span>
            Télécharger {documentType === 'prescription' ? 'l\'Ordonnance' : 'le Certificat'} (PDF)
          </span>
        </Button>
      </div>

      {/* Selector: Patient & Document Type */}
      <Card className="border-slate-200 shadow-sm bg-white p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>Patient destinataire *</Label>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-semibold"
            >
              {DEMO_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.lastName.toUpperCase()} {p.firstName} (CIN: {p.nationalId || 'N/A'})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <Label>Type de Document</Label>
            <div className="flex rounded-lg bg-slate-100 p-1">
              <button
                onClick={() => setDocumentType('prescription')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  documentType === 'prescription'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Ordonnance Médicale
              </button>
              <button
                onClick={() => setDocumentType('certificate')}
                className={`flex-1 py-1.5 rounded-md text-xs font-bold transition-all ${
                  documentType === 'certificate'
                    ? 'bg-white text-teal-800 shadow-sm'
                    : 'text-slate-600'
                }`}
              >
                Certificat / Arrêt de Travail
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Mode 1: Prescription Editor */}
      {documentType === 'prescription' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prescription Drugs List */}
          <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-800">
                Lignes de Prescription
              </CardTitle>
              <CardDescription className="text-xs">
                Médicaments prescrits pour {selectedPatient.lastName} {selectedPatient.firstName}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-slate-800">
                        {idx + 1}. {item.name}
                      </div>
                      <div className="text-xs text-slate-600">
                        <span className="font-semibold">Posologie :</span> {item.dosage} •{' '}
                        {item.frequency}
                      </div>
                      <div className="text-xs text-teal-700 font-semibold">
                        Durée : {item.duration}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRemoveDrug(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {items.length === 0 && (
                <div className="text-center py-8 text-slate-400 text-xs">
                  Aucun médicament dans l'ordonnance. Cliquez sur la liste de droite pour en ajouter.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Drug Catalog */}
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800">
                Médicaments Fréquents (1-clic)
              </CardTitle>
              <CardDescription className="text-xs">
                Antibiotiques, antalgiques et bains de bouche usuels au Maroc
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {COMMON_DRUGS.map((drug, i) => (
                <button
                  key={i}
                  onClick={() => handleAddDrug(drug)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-teal-50 hover:border-teal-300 transition-colors text-xs space-y-0.5 group"
                >
                  <div className="font-bold text-slate-800 group-hover:text-teal-800">
                    + {drug.name}
                  </div>
                  <div className="text-slate-500 text-[11px]">{drug.frequency}</div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Mode 2: Medical Certificate Editor */
        <Card className="border-slate-200 shadow-sm bg-white max-w-2xl mx-auto">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base font-bold text-slate-800">
              Certificat Médical & Arrêt de Travail
            </CardTitle>
            <CardDescription className="text-xs">
              Attestation d'incapacité temporaire consécutive aux soins dentaires
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              <Label>Motif clinique / Intervention</Label>
              <Input
                value={certificateReason}
                onChange={(e) => setCertificateReason(e.target.value)}
                placeholder="Ex: Soins chirurgicaux endodontiques, avulsion multiple..."
              />
            </div>

            <div className="space-y-1">
              <Label>Durée de l'arrêt de travail (Nombre de jours)</Label>
              <Input
                type="number"
                min={1}
                max={15}
                value={certificateDays}
                onChange={(e) => setCertificateDays(Number(e.target.value))}
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-2">
              <div className="font-bold text-slate-800">Aperçu du certificat :</div>
              <p className="italic leading-relaxed">
                « Je soussigné Dr. Amine TAZI certifie avoir examiné ce jour le/la patient(e){' '}
                <strong>
                  {selectedPatient.lastName} {selectedPatient.firstName}
                </strong>{' '}
                et atteste que son état de santé bucco-dentaire nécessite un repos médical de{' '}
                <strong>{certificateDays} jour(s)</strong> à compter de ce jour. »
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
