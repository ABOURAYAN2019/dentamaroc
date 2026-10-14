import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { DEMO_PROCEDURES } from '@/features/auth/demoData';
import { ProcedureCatalogItem, ProcedureCategory } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogCloseButton } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { formatMAD } from '@/lib/formatters';
import { Plus, Search, Edit2, CheckCircle2, Layers } from 'lucide-react';

export const TreatmentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { isDentist } = useAuth();

  const [procedures, setProcedures] = useState<ProcedureCatalogItem[]>(DEMO_PROCEDURES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProcedureCatalogItem | null>(null);

  const [code, setCode] = useState('');
  const [category, setCategory] = useState<ProcedureCategory>('conservative');
  const [nameFr, setNameFr] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number>(400);

  const openCreateModal = () => {
    setEditingItem(null);
    setCode(`ACT-${Date.now().toString().slice(-4)}`);
    setCategory('conservative');
    setNameFr('');
    setNameAr('');
    setDefaultPrice(450);
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProcedureCatalogItem) => {
    setEditingItem(item);
    setCode(item.code || '');
    setCategory(item.category);
    setNameFr(item.nameFr);
    setNameAr(item.nameAr || '');
    setDefaultPrice(item.defaultPrice);
    setIsModalOpen(true);
  };

  const handleSaveProcedure = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingItem) {
      setProcedures((prev) =>
        prev.map((p) =>
          p.id === editingItem.id
            ? { ...p, code, category, nameFr, nameAr: nameAr || undefined, defaultPrice }
            : p
        )
      );
    } else {
      const newItem: ProcedureCatalogItem = {
        id: `proc-${Date.now()}`,
        code,
        category,
        nameFr,
        nameAr: nameAr || undefined,
        defaultPrice,
        active: true,
      };
      setProcedures([newItem, ...procedures]);
    }

    setIsModalOpen(false);
  };

  const filteredProcedures = procedures.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      !q ||
      p.nameFr.toLowerCase().includes(q) ||
      (p.nameAr && p.nameAr.includes(q)) ||
      (p.code && p.code.toLowerCase().includes(q));

    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;

    return matchSearch && matchCategory;
  });

  const getCategoryLabel = (cat: ProcedureCategory) => {
    switch (cat) {
      case 'consultation':
        return 'Consultation & Bilan';
      case 'prevention':
        return 'Prévention & Hygiène';
      case 'conservative':
        return 'Soins Conservateurs';
      case 'endodontics':
        return 'Endodontie';
      case 'surgery':
        return 'Chirurgie Buccale';
      case 'prosthetics':
        return 'Prothèse Dentaire';
      case 'implantology':
        return 'Implantologie';
      case 'orthodontics':
        return 'Orthodontie';
      default:
        return cat;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Catalogue des Actes & Tarifs</h1>
          <p className="text-sm text-slate-500">
            Nomenclature des prestations en Dirhams Marocains (MAD) pour les devis et factures
          </p>
        </div>

        {isDentist && (
          <Button
            onClick={openCreateModal}
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4 me-1.5" />
            Nouvel Acte
          </Button>
        )}
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher un acte dentaire par libellé ou code..."
            className="ps-9 border-slate-200 bg-slate-50/50"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 text-xs rounded-md border border-slate-200 bg-slate-50 px-3 font-semibold text-slate-700 w-full sm:w-auto"
        >
          <option value="all">Toutes les spécialités</option>
          <option value="consultation">Consultations</option>
          <option value="prevention">Prévention & Détartrage</option>
          <option value="conservative">Soins conservateurs</option>
          <option value="endodontics">Endodontie</option>
          <option value="surgery">Chirurgie</option>
          <option value="prosthetics">Prothèses</option>
          <option value="implantology">Implantologie</option>
        </select>
      </div>

      {/* Table of Procedures */}
      <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100">
            {filteredProcedures.map((proc) => (
              <div
                key={proc.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {proc.code && (
                      <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {proc.code}
                      </span>
                    )}
                    <h3 className="font-bold text-sm text-slate-800">{proc.nameFr}</h3>
                    {proc.nameAr && (
                      <span className="text-xs text-slate-500 font-normal font-sans" dir="rtl">
                        ({proc.nameAr})
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] py-0">
                      {getCategoryLabel(proc.category)}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span className="text-base font-extrabold text-teal-800">
                    {formatMAD(proc.defaultPrice)}
                  </span>

                  {isDentist && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditModal(proc)}
                      className="text-slate-500 hover:text-teal-700 h-8 px-2"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal Edit / Add Procedure */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogCloseButton onClose={() => setIsModalOpen(false)} />
        <DialogHeader>
          <DialogTitle>
            {editingItem ? 'Modifier l’acte dentaire' : 'Ajouter un acte au catalogue'}
          </DialogTitle>
          <DialogDescription>
            Configuration du libellé bilingue et du tarif standard en Dirhams
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSaveProcedure} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Code d'acte</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: CONS-01"
              />
            </div>
            <div className="space-y-1">
              <Label>Discipline</Label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProcedureCategory)}
                className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm font-medium"
              >
                <option value="consultation">Consultation & Bilan</option>
                <option value="prevention">Prévention & Détartrage</option>
                <option value="conservative">Soins conservateurs</option>
                <option value="endodontics">Endodontie</option>
                <option value="surgery">Chirurgie</option>
                <option value="prosthetics">Prothèse</option>
                <option value="implantology">Implantologie</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>Libellé en Français *</Label>
            <Input
              required
              value={nameFr}
              onChange={(e) => setNameFr(e.target.value)}
              placeholder="Ex: Détartrage ultrasonique et polissage"
            />
          </div>

          <div className="space-y-1">
            <Label>Libellé en Arabe (optionnel)</Label>
            <Input
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="Ex: إزالة الجير وصقل الأسنان"
              dir="rtl"
            />
          </div>

          <div className="space-y-1">
            <Label>Tarif standard (MAD) *</Label>
            <Input
              type="number"
              required
              min={0}
              value={defaultPrice}
              onChange={(e) => setDefaultPrice(Number(e.target.value))}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">
              Enregistrer
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </div>
  );
};
