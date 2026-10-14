import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import {
  DEMO_INVOICES,
  DEMO_PAYMENTS,
  DEMO_CASH_CLOSING,
  DEMO_CLINIC,
  DEMO_PATIENTS,
} from '@/features/auth/demoData';
import { Invoice, Payment, CashClosing, Expense, PaymentMethod } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { formatMAD } from '@/lib/formatters';
import { formatDateMA, formatDateTimeMA } from '@/lib/date-utils';
import { jsPDF } from 'jspdf';
import {
  Receipt,
  CreditCard,
  Lock,
  PlusCircle,
  FileCheck2,
  DollarSign,
  AlertCircle,
  TrendingDown,
  Printer,
  Calendar,
} from 'lucide-react';

export const BillingPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isDentist, isSecretary } = useAuth();

  const [activeTab, setActiveTab] = useState<'invoices' | 'payments' | 'closing' | 'expenses'>('closing');
  const [invoices, setInvoices] = useState<Invoice[]>(DEMO_INVOICES);
  const [payments, setPayments] = useState<Payment[]>(DEMO_PAYMENTS);

  // Daily Cash Closing State
  const [cashClosing, setCashClosing] = useState<CashClosing>(DEMO_CASH_CLOSING);
  const [countedCash, setCountedCash] = useState<number>(DEMO_CASH_CLOSING.countedCash);
  const [closingNotes, setClosingNotes] = useState<string>(DEMO_CASH_CLOSING.notes || '');
  const [isClosingFinalized, setIsClosingFinalized] = useState<boolean>(false);

  // Expenses State
  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: 'exp-1',
      category: 'supplies',
      description: 'Achat de compresses stériles et gants nitrile en urgence',
      amount: 200,
      method: 'cash',
      date: new Date().toISOString(),
      dailyClosingId: new Date().toISOString().slice(0, 10),
      createdBy: 'user-secretary-1',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState(150);
  const [newExpenseCategory, setNewExpenseCategory] = useState<Expense['category']>('supplies');

  // Compute live day totals
  const todayCashIn = payments
    .filter((p) => p.method === 'cash')
    .reduce((acc, p) => acc + p.amount, 0);
  const todayCardIn = payments
    .filter((p) => p.method === 'card')
    .reduce((acc, p) => acc + p.amount, 0);
  const todayCheckIn = payments
    .filter((p) => p.method === 'check')
    .reduce((acc, p) => acc + p.amount, 0);
  const todayTransferIn = payments
    .filter((p) => p.method === 'transfer')
    .reduce((acc, p) => acc + p.amount, 0);
  const todayCashOut = expenses
    .filter((e) => e.method === 'cash')
    .reduce((acc, e) => acc + e.amount, 0);

  const openingFund = cashClosing.openingCash;
  const expectedPhysicalCash = openingFund + todayCashIn - todayCashOut;
  const cashDifference = countedCash - expectedPhysicalCash;

  const handleFinalizeCashClosing = () => {
    setCashClosing({
      ...cashClosing,
      totalCashIn: todayCashIn,
      totalCardIn: todayCardIn,
      totalCheckIn: todayCheckIn,
      totalTransferIn: todayTransferIn,
      totalCashOut: todayCashOut,
      expectedCashInDrawer: expectedPhysicalCash,
      countedCash,
      difference: cashDifference,
      notes: closingNotes,
      closedBy: user?.fullName || 'Secrétaire',
      closedAt: new Date().toISOString(),
    });
    setIsClosingFinalized(true);
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      category: newExpenseCategory,
      description: newExpenseDesc,
      amount: newExpenseAmount,
      method: 'cash',
      date: new Date().toISOString(),
      dailyClosingId: new Date().toISOString().slice(0, 10),
      createdBy: user?.fullName || 'Secrétaire',
      createdAt: new Date().toISOString(),
    };
    setExpenses([newExp, ...expenses]);
    setIsExpenseModalOpen(false);
    setNewExpenseDesc('');
  };

  // Export Daily Z Report (PDF)
  const handlePrintDailyClosingPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setTextColor(13, 148, 136);
    doc.text(DEMO_CLINIC.name.toUpperCase(), 14, 20);

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Tél : ${DEMO_CLINIC.phones.join(' / ')} | ICE : ${DEMO_CLINIC.ice || '001548792000034'}`, 14, 26);
    doc.text(`N° INPE : ${DEMO_CLINIC.licenseNumber}`, 14, 31);

    doc.setDrawColor(200);
    doc.line(14, 36, 196, 36);

    doc.setFontSize(14);
    doc.setTextColor(30);
    doc.text(`CLÔTURE DE CAISSE JOURNALIÈRE (Z DE CAISSE)`, 14, 46);

    doc.setFontSize(10);
    doc.text(`Date de caisse : ${formatDateMA(cashClosing.date)}`, 14, 52);
    doc.text(`Clôturé par : ${cashClosing.closedBy || user?.fullName} le ${formatDateTimeMA(new Date())}`, 14, 58);

    let y = 70;
    doc.setFillColor(245, 250, 250);
    doc.rect(14, y, 182, 60, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text('SYNTHÈSE DES ENCAISSEMENTS ET DÉCAISSEMENTS :', 18, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.text(`• Fond de caisse initial :`, 20, y + 16);
    doc.text(formatMAD(openingFund), 140, y + 16);

    doc.text(`• Encaissements Espèces (+) :`, 20, y + 23);
    doc.setTextColor(16, 185, 129);
    doc.text(formatMAD(todayCashIn), 140, y + 23);

    doc.setTextColor(40);
    doc.text(`• Dépenses payées en espèces (-) :`, 20, y + 30);
    doc.setTextColor(225, 29, 72);
    doc.text(formatMAD(todayCashOut), 140, y + 30);

    doc.setTextColor(40);
    doc.setFont('helvetica', 'bold');
    doc.text(`= Espèces physiques attendues dans le tiroir :`, 20, y + 38);
    doc.text(formatMAD(expectedPhysicalCash), 140, y + 38);

    doc.text(`• Espèces réellement comptées :`, 20, y + 45);
    doc.text(formatMAD(countedCash), 140, y + 45);

    doc.text(`• Écart de caisse :`, 20, y + 52);
    doc.setTextColor(cashDifference === 0 ? 16 : 225, cashDifference === 0 ? 185 : 29, cashDifference === 0 ? 129 : 72);
    doc.text(formatMAD(cashDifference), 140, y + 52);

    // Other payment methods
    y = 138;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40);
    doc.text('AUTRES ENCAISSEMENTS BANCAIRES :', 14, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.text(`• Total Cartes Bancaires (TPE CMI) :`, 20, y);
    doc.text(formatMAD(todayCardIn), 140, y);
    y += 7;
    doc.text(`• Total Chèques bancaires :`, 20, y);
    doc.text(formatMAD(todayCheckIn), 140, y);
    y += 7;
    doc.text(`• Total Virements reçus :`, 20, y);
    doc.text(formatMAD(todayTransferIn), 140, y);

    y += 15;
    doc.setDrawColor(13, 148, 136);
    doc.setLineWidth(0.5);
    doc.line(14, y, 196, y);

    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136);
    const totalDayInflow = todayCashIn + todayCardIn + todayCheckIn + todayTransferIn;
    doc.text(`TOTAL REVENUE JOURNÉE : ${formatMAD(totalDayInflow)}`, 14, y);

    // Signatures
    y += 30;
    doc.rect(14, y, 80, 25);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Signature de la Secrétaire / Caissière :', 16, y + 6);

    doc.rect(116, y, 80, 25);
    doc.text('Visa du Dr. Responsable :', 118, y + 6);

    doc.save(`Cloture_Caisse_${cashClosing.date}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">{t('billing.title')}</h1>
          <p className="text-sm text-slate-500">
            Facturation en MAD, encaissements échelonnés et clôture de caisse quotidienne
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handlePrintDailyClosingPDF}
            className="text-xs h-9 text-teal-700 border-teal-300 hover:bg-teal-50"
          >
            <Printer className="w-4 h-4 me-1.5" />
            <span>Imprimer Z de Caisse (PDF)</span>
          </Button>

          <Button
            size="sm"
            onClick={() => setIsExpenseModalOpen(true)}
            variant="secondary"
            className="text-xs h-9 font-semibold text-rose-700 border-rose-200 bg-rose-50 hover:bg-rose-100"
          >
            <TrendingDown className="w-4 h-4 me-1.5" />
            <span>Enregistrer une Dépense</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as typeof activeTab)}>
        <TabsList className="bg-white border border-slate-200 shadow-sm p-1">
          <TabsTrigger value="closing">
            <Lock className="w-3.5 h-3.5 me-1.5" />
            {t('billing.dailyClosing')}
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <Receipt className="w-3.5 h-3.5 me-1.5" />
            Factures Émises ({invoices.length})
          </TabsTrigger>
          <TabsTrigger value="payments">
            <CreditCard className="w-3.5 h-3.5 me-1.5" />
            Journal des Règlements ({payments.length})
          </TabsTrigger>
          <TabsTrigger value="expenses">
            <TrendingDown className="w-3.5 h-3.5 me-1.5" />
            Dépenses Caisse ({expenses.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab Clôture de Caisse */}
        <TabsContent value="closing">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cash count and validation */}
            <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-bold text-slate-800">
                      Arrêté du Tiroir-Caisse ({formatDateMA(cashClosing.date)})
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Contrôle des flux physiques d'espèces avant fermeture du cabinet
                    </CardDescription>
                  </div>
                  {isClosingFinalized && (
                    <Badge variant="success" className="text-xs">
                      Clôturée & Validée
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      Fond de Caisse Matinal
                    </span>
                    <div className="text-xl font-extrabold text-slate-800">
                      {formatMAD(openingFund)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                    <span className="text-xs font-semibold text-emerald-700 uppercase">
                      Espèces Encaissées (+)
                    </span>
                    <div className="text-xl font-extrabold text-emerald-700">
                      {formatMAD(todayCashIn)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-1">
                    <span className="text-xs font-semibold text-rose-700 uppercase">
                      Dépenses Espèces du Jour (-)
                    </span>
                    <div className="text-xl font-extrabold text-rose-700">
                      {formatMAD(todayCashOut)}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 space-y-1">
                    <span className="text-xs font-semibold text-teal-800 uppercase">
                      Espèces Théoriques dans le tiroir
                    </span>
                    <div className="text-xl font-extrabold text-teal-800">
                      {formatMAD(expectedPhysicalCash)}
                    </div>
                  </div>
                </div>

                {/* Cash count input */}
                <div className="p-5 rounded-xl border border-slate-300 bg-white shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <Label className="text-sm font-bold text-slate-800">
                      Montant physique compté dans le tiroir (MAD) :
                    </Label>
                    <div className="w-48">
                      <Input
                        type="number"
                        value={countedCash}
                        onChange={(e) => setCountedCash(Number(e.target.value))}
                        className="text-lg font-bold text-end"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-sm">
                    <span className="font-semibold text-slate-600">Écart de caisse :</span>
                    <span
                      className={`font-extrabold text-base ${
                        cashDifference === 0
                          ? 'text-emerald-600'
                          : cashDifference > 0
                          ? 'text-blue-600'
                          : 'text-rose-600'
                      }`}
                    >
                      {cashDifference === 0
                        ? 'Caisse parfaite (0,00 MAD)'
                        : `${cashDifference > 0 ? '+' : ''}${formatMAD(cashDifference)}`}
                    </span>
                  </div>

                  <div className="space-y-1 pt-2">
                    <Label className="text-xs text-slate-500">Observations / Justifications</Label>
                    <Input
                      value={closingNotes}
                      onChange={(e) => setClosingNotes(e.target.value)}
                      placeholder="Ex: Facture pharmacie payée en espèces..."
                    />
                  </div>

                  <Button
                    onClick={handleFinalizeCashClosing}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold mt-2"
                  >
                    <FileCheck2 className="w-4 h-4 me-2" />
                    Valider la Clôture et Verrouiller le Jour
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Non-cash breakdown */}
            <Card className="border-slate-200 shadow-sm bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-sm font-bold text-slate-800">
                  Règlements Hors Espèces du Jour
                </CardTitle>
                <CardDescription className="text-xs">
                  Totaux à rapprocher avec les bordereaux bancaires
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Cartes Bancaires (TPE CMI) :</span>
                  <span className="font-bold text-slate-900">{formatMAD(todayCardIn)}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Chèques à encaisser :</span>
                  <span className="font-bold text-slate-900">{formatMAD(todayCheckIn)}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-700">Virements bancaires :</span>
                  <span className="font-bold text-slate-900">{formatMAD(todayTransferIn)}</span>
                </div>

                <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1">
                  <span className="text-xs uppercase font-bold text-teal-800 block">
                    Recette Totale du Jour
                  </span>
                  <div className="text-2xl font-extrabold text-teal-800">
                    {formatMAD(todayCashIn + todayCardIn + todayCheckIn + todayTransferIn)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Invoices */}
        <TabsContent value="invoices">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800">
                          {inv.invoiceNumber}
                        </span>
                        <span className="font-semibold text-xs text-teal-700">
                          • {inv.patientName}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Date : {formatDateMA(inv.date)} • {inv.items.length} actes
                      </p>
                    </div>

                    <div className="text-end">
                      <div className="font-bold text-sm text-slate-900">
                        {formatMAD(inv.totalAmount)}
                      </div>
                      {inv.remainingAmount > 0 ? (
                        <span className="text-xs text-rose-600 font-semibold">
                          Reste dû : {formatMAD(inv.remainingAmount)}
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold">
                          Totalement payée
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Payments */}
        <TabsContent value="payments">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm">
                        {formatMAD(p.amount)}
                      </span>
                      <p className="text-slate-500">
                        Patient : <strong>{p.patientName}</strong> • Reçu par {p.receivedBy}
                      </p>
                    </div>

                    <div className="text-end">
                      <Badge variant="outline" className="font-semibold">
                        {p.method === 'cash'
                          ? 'Espèces'
                          : p.method === 'card'
                          ? 'Carte TPE'
                          : p.method === 'check'
                          ? 'Chèque'
                          : 'Virement'}
                      </Badge>
                      <div className="text-slate-400 text-[11px] mt-0.5">
                        {formatDateMA(p.date)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab Expenses */}
        <TabsContent value="expenses">
          <Card className="border-slate-200 shadow-sm bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 text-sm">{exp.description}</span>
                      <p className="text-slate-500 mt-0.5">
                        Enregistré par {exp.createdBy} le {formatDateMA(exp.date)}
                      </p>
                    </div>
                    <span className="font-extrabold text-sm text-rose-600">
                      -{formatMAD(exp.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal New Expense */}
      <Dialog open={isExpenseModalOpen} onOpenChange={setIsExpenseModalOpen}>
        <DialogCloseButton onClose={() => setIsExpenseModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>Enregistrer une dépense courante de caisse</DialogTitle>
          <DialogDescription>
            Toute sortie d'espèces diminue immédiatement le cash physique théorique du tiroir
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateExpense} className="space-y-4">
          <div className="space-y-1">
            <Label>Catégorie</Label>
            <select
              value={newExpenseCategory}
              onChange={(e) => setNewExpenseCategory(e.target.value as Expense['category'])}
              className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
            >
              <option value="supplies">Fournitures médicales & pharmacie</option>
              <option value="lab">Prothèse & laboratoire</option>
              <option value="rent">Loyer ou charges cabinet</option>
              <option value="utilities">Facture Eau / Électricité / Internet</option>
              <option value="other">Autre charge diverse</option>
            </select>
          </div>

          <div className="space-y-1">
            <Label>Description / Motif de la dépense *</Label>
            <Input
              required
              value={newExpenseDesc}
              onChange={(e) => setNewExpenseDesc(e.target.value)}
              placeholder="Ex: Achat d'anesthésiques, frais coursier..."
            />
          </div>

          <div className="space-y-1">
            <Label>Montant payé en espèces (MAD) *</Label>
            <Input
              type="number"
              required
              min={1}
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(Number(e.target.value))}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsExpenseModalOpen(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-rose-600 hover:bg-rose-700 text-white font-semibold"
            >
              Valider la Dépense
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
