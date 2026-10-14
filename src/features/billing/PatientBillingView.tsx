import React, { useState } from 'react';
import { Patient, Invoice, Payment, PaymentMethod } from '@/types';
import { DEMO_INVOICES, DEMO_PAYMENTS, DEMO_CLINIC } from '@/features/auth/demoData';
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
  CreditCard,
  PlusCircle,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';

interface PatientBillingViewProps {
  patient: Patient;
}

export const PatientBillingView: React.FC<PatientBillingViewProps> = ({ patient }) => {
  const { user, isDentist, isSecretary } = useAuth();

  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    DEMO_INVOICES.filter((inv) => inv.patientId === patient.id)
  );

  const [payments, setPayments] = useState<Payment[]>(() =>
    DEMO_PAYMENTS.filter((pay) => pay.patientId === patient.id)
  );

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<number>(500);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentRef, setPaymentRef] = useState<string>('');

  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = payments.reduce((acc, pay) => acc + pay.amount, 0);
  const currentBalance = totalInvoiced - totalPaid;

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;

    const newPayment: Payment = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoiceId || undefined,
      patientId: patient.id,
      patientName: `${patient.lastName} ${patient.firstName}`,
      amount: paymentAmount,
      method: paymentMethod,
      referenceNumber: paymentRef || undefined,
      date: new Date().toISOString(),
      receivedBy: user?.fullName || 'Secrétaire',
      createdAt: new Date().toISOString(),
    };

    setPayments([newPayment, ...payments]);

    // Update invoice status if attached
    if (selectedInvoiceId) {
      setInvoices((prev) =>
        prev.map((inv) => {
          if (inv.id === selectedInvoiceId) {
            const updatedPaid = inv.paidAmount + paymentAmount;
            const remaining = Math.max(0, inv.totalAmount - updatedPaid);
            const status = remaining === 0 ? 'paid' : 'partially_paid';
            return {
              ...inv,
              paidAmount: updatedPaid,
              remainingAmount: remaining,
              status,
            };
          }
          return inv;
        })
      );
    }

    setIsPaymentModalOpen(false);
  };

  // Generate Invoice PDF
  const handlePrintInvoice = (invoice: Invoice) => {
    const doc = new jsPDF();

    // Cabinet Header
    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.text(DEMO_CLINIC.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`${DEMO_CLINIC.address.street}, ${DEMO_CLINIC.address.city}`, 14, 26);
    doc.text(`Tél : ${DEMO_CLINIC.phones.join(' / ')} | ICE : ${DEMO_CLINIC.ice || '001548792000034'}`, 14, 31);
    doc.text(`N° INPE : ${DEMO_CLINIC.licenseNumber}`, 14, 36);

    doc.setDrawColor(200);
    doc.line(14, 40, 196, 40);

    // Invoice title
    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(`FACTURE D'HONORAIRES : ${invoice.invoiceNumber}`, 14, 50);

    doc.setFontSize(10);
    doc.text(`Date : ${formatDateMA(invoice.date)}`, 14, 56);

    // Patient box
    doc.setFillColor(245, 250, 250);
    doc.rect(120, 46, 76, 22, 'F');
    doc.setTextColor(13, 148, 136);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURÉ À :', 124, 53);
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
    doc.text('Désignation de la prestation', 18, y + 5.5);
    doc.text('Dent', 130, y + 5.5);
    doc.text('Total (MAD)', 160, y + 5.5);

    // Items
    y += 12;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(40);

    invoice.items.forEach((item) => {
      doc.text(item.description, 18, y);
      doc.text(item.toothNumber ? `#${item.toothNumber}` : '-', 130, y);
      doc.text(formatMAD(item.total), 160, y);
      y += 8;
    });

    // Summary box
    y += 10;
    doc.setDrawColor(200);
    doc.line(14, y, 196, y);
    y += 8;

    doc.setFont('helvetica', 'bold');
    doc.text('Total Facturé :', 110, y);
    doc.text(formatMAD(invoice.totalAmount), 160, y);
    y += 6;

    doc.text('Montant Réglé :', 110, y);
    doc.setTextColor(16, 185, 129); // Emerald
    doc.text(formatMAD(invoice.paidAmount), 160, y);
    y += 6;

    doc.setTextColor(40);
    doc.text('Solde Restant Dû :', 110, y);
    doc.setTextColor(invoice.remainingAmount > 0 ? 225 : 16, invoice.remainingAmount > 0 ? 29 : 185, invoice.remainingAmount > 0 ? 72 : 129);
    doc.text(formatMAD(invoice.remainingAmount), 160, y);

    // Stamp
    y += 25;
    doc.rect(116, y, 80, 25);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Cachet et mention "Acquitté" :', 118, y + 6);

    doc.save(`Facture_${invoice.invoiceNumber}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Top Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Facturé
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {formatMAD(totalInvoiced)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm bg-white">
          <CardContent className="p-4">
            <span className="text-xs font-semibold text-slate-500 uppercase">
              Total Encaissé
            </span>
            <div className="text-xl font-extrabold text-emerald-600 mt-1">
              {formatMAD(totalPaid)}
            </div>
          </CardContent>
        </Card>

        <Card className={`border shadow-sm ${currentBalance > 0 ? 'bg-rose-50/60 border-rose-200' : 'bg-emerald-50/60 border-emerald-200'}`}>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase text-slate-600">
                Solde Patient
              </span>
              <div className={`text-xl font-extrabold mt-1 ${currentBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatMAD(currentBalance)}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => setIsPaymentModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold h-8"
            >
              <CreditCard className="w-3.5 h-3.5 me-1.5" />
              <span>Encaisser</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Invoices List */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-800">
            Factures Émises
          </CardTitle>
          <CardDescription className="text-xs">
            Factures d'honoraires dentaires conformes aux exigences fiscales marocaines
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {invoices.map((inv) => (
              <div
                key={inv.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">{inv.invoiceNumber}</span>
                    <Badge
                      variant={
                        inv.status === 'paid'
                          ? 'success'
                          : inv.status === 'partially_paid'
                          ? 'warning'
                          : 'destructive'
                      }
                      className="text-[10px]"
                    >
                      {inv.status === 'paid'
                        ? 'Payée'
                        : inv.status === 'partially_paid'
                        ? 'Partielle'
                        : 'Impayée'}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Émise le {formatDateMA(inv.date)} • {inv.items.length} actes facturés
                  </p>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <div className="text-end">
                    <div className="font-extrabold text-sm text-slate-800">
                      {formatMAD(inv.totalAmount)}
                    </div>
                    {inv.remainingAmount > 0 && (
                      <div className="text-xs text-rose-600 font-semibold">
                        Reste : {formatMAD(inv.remainingAmount)}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePrintInvoice(inv)}
                    className="text-xs h-8 text-teal-700 border-teal-200 hover:bg-teal-50"
                  >
                    <Printer className="w-3.5 h-3.5 me-1" />
                    <span>PDF</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payments History */}
      <Card className="border-slate-200 shadow-sm bg-white">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-800">
            Historique des Règlements Encaissés
          </CardTitle>
          <CardDescription className="text-xs">
            Traçabilité des encaissements par mode de règlement
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {payments.map((pay) => (
              <div
                key={pay.id}
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700">
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-800">
                      {formatMAD(pay.amount)} ({pay.method === 'cash' ? 'Espèces' : pay.method === 'card' ? 'Carte TPE' : pay.method === 'check' ? 'Chèque' : 'Virement'})
                    </div>
                    <p className="text-xs text-slate-500">
                      Reçu le {formatDateMA(pay.date)} par {pay.receivedBy}
                      {pay.referenceNumber && ` • Réf : ${pay.referenceNumber}`}
                    </p>
                  </div>
                </div>

                <Badge variant="success" className="text-xs">
                  Encaissé
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Record Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogCloseButton onClose={() => setIsPaymentModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>Encaisser un règlement patient</DialogTitle>
          <DialogDescription>
            Enregistrement en caisse avec délivrance de reçu d'honoraires
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="space-y-1">
            <Label>Facture rattachée</Label>
            <select
              value={selectedInvoiceId}
              onChange={(e) => setSelectedInvoiceId(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              <option value="">Règlement global / acompte sur solde</option>
              {invoices.map((inv) => (
                <option key={inv.id} value={inv.id}>
                  {inv.invoiceNumber} (Reste : {formatMAD(inv.remainingAmount)})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Montant à encaisser (MAD) *</Label>
              <Input
                type="number"
                required
                min={10}
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1">
              <Label>Mode de règlement *</Label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
              >
                <option value="cash">Espèces</option>
                <option value="card">Carte Bancaire (TPE)</option>
                <option value="check">Chèque bancaire</option>
                <option value="transfer">Virement bancaire</option>
              </select>
            </div>
          </div>

          {(paymentMethod === 'check' || paymentMethod === 'transfer' || paymentMethod === 'card') && (
            <div className="space-y-1">
              <Label>
                {paymentMethod === 'check'
                  ? 'N° de Chèque et Banque émettrice'
                  : paymentMethod === 'card'
                  ? 'N° autorisation TPE (CMI)'
                  : 'Référence du virement'}
              </Label>
              <Input
                value={paymentRef}
                onChange={(e) => setPaymentRef(e.target.value)}
                placeholder="Ex: CHK-123456 Attijariwafa"
              />
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPaymentModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold"
            >
              Valider et Encaisser
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
