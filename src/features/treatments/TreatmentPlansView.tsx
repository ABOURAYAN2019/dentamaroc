import React, { useState } from 'react';
import { DEMO_PROCEDURES, DEMO_CLINIC } from '@/features/auth/demoData';
import {
  TreatmentPlan,
  TreatmentPlanItem,
  TreatmentPlanItemStatus,
  Patient,
} from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { formatMAD } from '@/lib/formatters';
import { formatDateMA } from '@/lib/date-utils';
import { jsPDF } from 'jspdf';
import {
  PlusCircle,
  Printer,
} from 'lucide-react';

interface TreatmentPlansViewProps {
  patient: Patient;
}

export const TreatmentPlansView: React.FC<TreatmentPlansViewProps> = ({ patient }) => {

  const [plans, setPlans] = useState<TreatmentPlan[]>([
    {
      id: 'plan-1',
      patientId: patient.id,
      title: 'Plan Global Réhabilitation Secteur 2 & Soins',
      status: 'in_progress',
      items: [
        {
          id: 'item-1',
          procedureId: 'proc-5',
          procedureName: 'Traitement endodontique molaire (Dévitalisation)',
          toothNumber: 26,
          status: 'completed',
          price: 1200,
          completedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        },
        {
          id: 'item-2',
          procedureId: 'proc-8',
          procedureName: 'Couronne Céramo-Métallique (CCM)',
          toothNumber: 26,
          status: 'in_progress',
          price: 2200,
        },
        {
          id: 'item-3',
          procedureId: 'proc-3',
          procedureName: 'Obturation composite 1 face',
          toothNumber: 15,
          status: 'accepted',
          price: 450,
        },
      ],
      totalAmount: 3850,
      finalAmount: 3850,
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]);

  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');
  const [selectedProcedureId, setSelectedProcedureId] = useState<string>(DEMO_PROCEDURES[0].id);
  const [toothNumber, setToothNumber] = useState<string>('26');
  const [customPrice, setCustomPrice] = useState<number>(DEMO_PROCEDURES[0].defaultPrice);

  const handleProcedureSelect = (procId: string) => {
    setSelectedProcedureId(procId);
    const proc = DEMO_PROCEDURES.find((p) => p.id === procId);
    if (proc) {
      setCustomPrice(proc.defaultPrice);
    }
  };

  const handleAddItemToPlan = (e: React.FormEvent) => {
    e.preventDefault();
    const proc = DEMO_PROCEDURES.find((p) => p.id === selectedProcedureId);
    if (!proc) return;

    const newItem: TreatmentPlanItem = {
      id: `item-${Date.now()}`,
      procedureId: proc.id,
      procedureName: proc.nameFr,
      toothNumber: toothNumber ? parseInt(toothNumber, 10) : undefined,
      status: 'accepted',
      price: customPrice,
    };

    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === selectedPlanId) {
          const newItems = [...plan.items, newItem];
          const newTotal = newItems.reduce((acc, i) => acc + i.price, 0);
          return {
            ...plan,
            items: newItems,
            totalAmount: newTotal,
            finalAmount: newTotal,
            updatedAt: new Date().toISOString(),
          };
        }
        return plan;
      })
    );

    setIsAddItemModalOpen(false);
  };

  const handleUpdateItemStatus = (
    planId: string,
    itemId: string,
    newStatus: TreatmentPlanItemStatus
  ) => {
    setPlans((prev) =>
      prev.map((plan) => {
        if (plan.id === planId) {
          const updatedItems = plan.items.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  status: newStatus,
                  completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
                }
              : item
          );
          return { ...plan, items: updatedItems, updatedAt: new Date().toISOString() };
        }
        return plan;
      })
    );
  };

  // Generate official Dental Quote PDF in MAD
  const handleGenerateQuotePDF = (plan: TreatmentPlan) => {
    const doc = new jsPDF();

    // Header Cabinet
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136); // Teal
    doc.text(DEMO_CLINIC.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${DEMO_CLINIC.address.street}, ${DEMO_CLINIC.address.city}`, 14, 26);
    doc.text(`Tél : ${DEMO_CLINIC.phones.join(' / ')} | ICE : ${DEMO_CLINIC.ice || '001548792000034'}`, 14, 31);
    doc.text(`N° Ordre / INPE : ${DEMO_CLINIC.licenseNumber}`, 14, 36);

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // Title & Patient Box
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text('DEVIS DENTAIRE ESTIMATIF', 14, 50);

    doc.setFontSize(10);
    doc.text(`Date : ${formatDateMA(new Date())}`, 14, 56);
    doc.text(`Référence : DEV-${plan.id.toUpperCase()}`, 14, 62);

    // Patient info block
    doc.setFillColor(245, 250, 250);
    doc.rect(120, 46, 76, 22, 'F');
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT(E) :', 124, 53);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);
    doc.text(`${patient.lastName.toUpperCase()} ${patient.firstName}`, 124, 59);
    doc.text(`CIN : ${patient.nationalId || 'N/A'} - Tél : ${patient.phone}`, 124, 65);

    // Table Header
    let y = 78;
    doc.setFillColor(13, 148, 136);
    doc.rect(14, y, 182, 8, 'F');
    doc.setTextColor(255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('Dent', 18, y + 5.5);
    doc.text('Désignation de l\'acte dentaire', 40, y + 5.5);
    doc.text('Montant (MAD)', 160, y + 5.5);

    // Table items
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    plan.items.forEach((item) => {
      doc.text(item.toothNumber ? `#${item.toothNumber}` : '-', 18, y);
      doc.text(item.procedureName, 40, y);
      doc.text(formatMAD(item.price), 160, y);
      y += 8;
    });

    // Total Line
    y += 4;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('TOTAL DU PLAN DE TRAITEMENT :', 95, y);
    doc.setTextColor(13, 148, 136);
    doc.text(formatMAD(plan.finalAmount), 160, y);

    // Legal & Signature Notice
    y += 24;
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.setFont('helvetica', 'normal');
    doc.text('Devis valable 90 jours à compter de son émission. Honoraires libres en Dirhams Marocains.', 14, y);
    doc.text('Bon pour accord et exécution des soins (Signature du patient précédée de la mention manuscrite) :', 14, y + 6);

    doc.rect(14, y + 10, 80, 25);
    doc.text('Signature du patient :', 16, y + 16);

    doc.rect(116, y + 10, 80, 25);
    doc.text('Cachet et signature du praticien :', 118, y + 16);

    doc.save(`Devis_${patient.lastName}_${plan.id}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Plans List */}
      {plans.map((plan) => {
        const completedCount = plan.items.filter((i) => i.status === 'completed').length;
        const progressPct = plan.items.length > 0 ? Math.round((completedCount / plan.items.length) * 100) : 0;

        return (
          <Card key={plan.id} className="border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-slate-800">
                    {plan.title}
                  </CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {plan.status === 'in_progress' ? 'En cours' : 'Terminé'}
                  </Badge>
                </div>
                <CardDescription className="text-xs mt-0.5">
                  Créé le {formatDateMA(plan.createdAt)} • Progression : {completedCount} / {plan.items.length} actes ({progressPct}%)
                </CardDescription>
              </div>

              {/* PDF & Actions */}
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleGenerateQuotePDF(plan)}
                  className="text-xs h-8 text-teal-700 border-teal-300 hover:bg-teal-50"
                >
                  <Printer className="w-3.5 h-3.5 me-1.5" />
                  <span>Imprimer Devis (PDF)</span>
                </Button>

                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedPlanId(plan.id);
                    setIsAddItemModalOpen(true);
                  }}
                  className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8"
                >
                  <PlusCircle className="w-3.5 h-3.5 me-1.5" />
                  <span>Ajouter un acte</span>
                </Button>
              </div>
            </CardHeader>

            {/* Progress bar */}
            <div className="px-6 pb-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-teal-600 h-full transition-all duration-500 rounded-full"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {plan.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {item.toothNumber && (
                        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-extrabold text-xs">
                          #{item.toothNumber}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-sm text-slate-800">
                          {item.procedureName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2">
                          <span className="font-bold text-teal-700">{formatMAD(item.price)}</span>
                          {item.completedAt && (
                            <span>• Réalisé le {formatDateMA(item.completedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status switcher */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <select
                        value={item.status}
                        onChange={(e) =>
                          handleUpdateItemStatus(
                            plan.id,
                            item.id,
                            e.target.value as TreatmentPlanItemStatus
                          )
                        }
                        className="text-xs h-8 rounded-md border border-slate-300 bg-white px-2 font-medium"
                      >
                        <option value="proposed">Proposé</option>
                        <option value="accepted">Accepté</option>
                        <option value="in_progress">En cours</option>
                        <option value="completed">Terminé / Réalisé</option>
                        <option value="abandoned">Abandonné</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Plan Footer Total */}
              <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Montant Total du Devis
                </span>
                <span className="text-base font-extrabold text-teal-800">
                  {formatMAD(plan.finalAmount)}
                </span>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Modal Add Procedure to Plan */}
      <Dialog open={isAddItemModalOpen} onOpenChange={setIsAddItemModalOpen}>
        <DialogCloseButton onClose={() => setIsAddItemModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>Ajouter un acte au plan de traitement</DialogTitle>
          <DialogDescription>
            Sélectionnez l'acte dans la nomenclature et définissez la dent concernée
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleAddItemToPlan} className="space-y-4">
          <div className="space-y-1">
            <Label>Acte dentaire</Label>
            <select
              value={selectedProcedureId}
              onChange={(e) => handleProcedureSelect(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              {DEMO_PROCEDURES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameFr} ({formatMAD(p.defaultPrice)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Dent (N° FDI)</Label>
              <Input
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
                placeholder="Ex: 16, 26, 48..."
              />
            </div>
            <div className="space-y-1">
              <Label>Tarif en Dirhams (MAD)</Label>
              <Input
                type="number"
                value={customPrice}
                onChange={(e) => setCustomPrice(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsAddItemModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Ajouter au plan
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
