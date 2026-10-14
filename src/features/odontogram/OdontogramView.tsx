import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToothChart, ToothNumber, ToothCondition, ToothState, ToothSurface } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/AuthContext';
import { Save, History, Sparkles, Check, AlertCircle } from 'lucide-react';

// FDI Dental Notation
const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];

interface OdontogramProps {
  patientId?: string;
  initialChart?: ToothChart;
  readOnly?: boolean;
  onSave?: (chart: ToothChart) => void;
}

export const OdontogramView: React.FC<OdontogramProps> = ({
  patientId = 'pat-1',
  initialChart,
  readOnly = false,
  onSave,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [dentitionType, setDentitionType] = useState<'adult' | 'child'>('adult');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(16);

  // Default seed conditions for demonstration
  const [teethData, setTeethData] = useState<Record<number, ToothCondition>>(() => {
    if (initialChart?.teeth) return initialChart.teeth;
    return {
      16: {
        state: 'caries',
        surfaces: ['occlusal', 'mesial'],
        notes: 'Carie profonde émail-dentine',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Dr. Amine TAZI',
      },
      26: {
        state: 'crown',
        material: 'ceramic',
        notes: 'Couronne CCM scellée',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Dr. Amine TAZI',
      },
      36: {
        state: 'root_canal',
        surfaces: ['occlusal'],
        notes: 'Dévitalisation 3 canaux terminée',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Dr. Amine TAZI',
      },
      46: {
        state: 'filling',
        material: 'composite',
        surfaces: ['occlusal'],
        notes: 'Composite esthétique antérieur',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Dr. Amine TAZI',
      },
      48: {
        state: 'missing',
        notes: 'Dent de sagesse extraite en 2024',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Dr. Amine TAZI',
      },
    };
  });

  const [selectedState, setSelectedState] = useState<ToothState>('caries');
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>(['occlusal']);
  const [notes, setNotes] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToothClick = (num: number) => {
    setSelectedTooth(num);
    const existing = teethData[num];
    if (existing) {
      setSelectedState(existing.state);
      setSelectedSurfaces(existing.surfaces || ['occlusal']);
      setNotes(existing.notes || '');
    } else {
      setSelectedState('healthy');
      setSelectedSurfaces(['occlusal']);
      setNotes('');
    }
  };

  const handleApplyToothState = () => {
    if (!selectedTooth) return;

    const updated: ToothCondition = {
      state: selectedState,
      surfaces: selectedSurfaces,
      notes,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.fullName || 'Praticien',
    };

    const newTeeth = { ...teethData, [selectedTooth]: updated };
    setTeethData(newTeeth);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    if (onSave) {
      onSave({
        id: `chart-${patientId}`,
        patientId,
        type: dentitionType,
        teeth: newTeeth,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.id || 'user-1',
      });
    }
  };

  const toggleSurface = (surf: ToothSurface) => {
    setSelectedSurfaces((prev) =>
      prev.includes(surf) ? prev.filter((s) => s !== surf) : [...prev, surf]
    );
  };

  // Helper for color by tooth state
  const getToothFill = (condition?: ToothCondition) => {
    if (!condition) return '#f8fafc'; // Default healthy light
    switch (condition.state) {
      case 'caries':
        return '#f87171'; // Red
      case 'filling':
        return '#60a5fa'; // Blue
      case 'crown':
        return '#facc15'; // Gold/Yellow
      case 'root_canal':
        return '#c084fc'; // Purple
      case 'implant':
        return '#34d399'; // Emerald
      case 'missing':
        return '#94a3b8'; // Slate
      case 'extraction_indicated':
        return '#fb923c'; // Orange
      default:
        return '#f8fafc';
    }
  };

  // Render individual SVG interactive tooth representation
  const renderToothSVG = (toothNum: number) => {
    const isSelected = selectedTooth === toothNum;
    const condition = teethData[toothNum];
    const fill = getToothFill(condition);
    const isMissing = condition?.state === 'missing';

    return (
      <div
        key={toothNum}
        onClick={() => handleToothClick(toothNum)}
        className={`flex flex-col items-center cursor-pointer p-1.5 rounded-xl transition-all select-none ${
          isSelected
            ? 'bg-teal-100/80 ring-2 ring-teal-600 shadow-md scale-105'
            : 'hover:bg-slate-100 hover:scale-102'
        }`}
      >
        <span className="text-[11px] font-bold text-slate-700 mb-1">{toothNum}</span>

        {/* 5-surface Anatomical Tooth SVG */}
        <div className="relative w-10 h-10">
          <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-sm">
            {/* Occlusal (Center) */}
            <polygon
              points="30,30 70,30 70,70 30,70"
              fill={condition?.surfaces?.includes('occlusal') ? fill : '#ffffff'}
              stroke="#64748b"
              strokeWidth="3"
            />
            {/* Vestibular (Top) */}
            <polygon
              points="10,10 90,10 70,30 30,30"
              fill={condition?.surfaces?.includes('vestibular') ? fill : '#ffffff'}
              stroke="#64748b"
              strokeWidth="3"
            />
            {/* Distal (Right) */}
            <polygon
              points="90,10 90,90 70,70 70,30"
              fill={condition?.surfaces?.includes('distal') ? fill : '#ffffff'}
              stroke="#64748b"
              strokeWidth="3"
            />
            {/* Lingual (Bottom) */}
            <polygon
              points="30,70 70,70 90,90 10,90"
              fill={condition?.surfaces?.includes('lingual') ? fill : '#ffffff'}
              stroke="#64748b"
              strokeWidth="3"
            />
            {/* Mesial (Left) */}
            <polygon
              points="10,10 30,30 30,70 10,90"
              fill={condition?.surfaces?.includes('mesial') ? fill : '#ffffff'}
              stroke="#64748b"
              strokeWidth="3"
            />

            {/* If missing: big cross */}
            {isMissing && (
              <g stroke="#dc2626" strokeWidth="6" strokeLinecap="round">
                <line x1="15" y1="15" x2="85" y2="85" />
                <line x1="85" y1="15" x2="15" y2="85" />
              </g>
            )}
          </svg>
        </div>

        {/* Status mini tag */}
        <div className="h-3.5 mt-1">
          {condition && condition.state !== 'healthy' && (
            <span
              className="text-[9px] px-1 rounded font-extrabold"
              style={{
                backgroundColor: fill,
                color: condition.state === 'crown' ? '#854d0e' : '#ffffff',
              }}
            >
              {condition.state.slice(0, 3).toUpperCase()}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Bar with Dentition Switcher & Legends */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={dentitionType === 'adult' ? 'default' : 'outline'}
            onClick={() => setDentitionType('adult')}
            className={dentitionType === 'adult' ? 'bg-teal-600 text-white' : ''}
          >
            {t('odontogram.adultTeeth')}
          </Button>
          <Button
            size="sm"
            variant={dentitionType === 'child' ? 'default' : 'outline'}
            onClick={() => setDentitionType('child')}
            className={dentitionType === 'child' ? 'bg-teal-600 text-white' : ''}
          >
            {t('odontogram.childTeeth')}
          </Button>
        </div>

        {/* Legend color pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-red-400 inline-block border border-red-500" />
            Carie
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-blue-400 inline-block border border-blue-500" />
            Obturation
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-amber-400 inline-block border border-amber-500" />
            Couronne
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-purple-400 inline-block border border-purple-500" />
            Endodontie
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block border border-emerald-500" />
            Implant
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <span className="w-3 h-3 rounded-full bg-slate-400 inline-block border border-slate-500" />
            Absente
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Odontogram Graphical Canvas */}
        <Card className="lg:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800">
              Système FDI Standard (Haut / Bas • Droite / Gauche)
            </CardTitle>
            <CardDescription className="text-xs">
              Touchez ou cliquez sur une dent pour ouvrir ses faces et son état pathologique
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-6">
            {dentitionType === 'adult' ? (
              <>
                {/* Maxillary / Upper Jaw */}
                <div>
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Maxillaire Supérieur (Arcade 1 & 2)
                  </div>
                  <div className="flex justify-center items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                    <div className="flex gap-1 border-e-2 border-teal-500 pe-2">
                      {ADULT_UPPER_RIGHT.map(renderToothSVG)}
                    </div>
                    <div className="flex gap-1 ps-2">
                      {ADULT_UPPER_LEFT.map(renderToothSVG)}
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-slate-200" />

                {/* Mandibular / Lower Jaw */}
                <div>
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Mandibule Inférieure (Arcade 4 & 3)
                  </div>
                  <div className="flex justify-center items-center gap-1 sm:gap-2 overflow-x-auto pb-2">
                    <div className="flex gap-1 border-e-2 border-teal-500 pe-2">
                      {ADULT_LOWER_RIGHT.map(renderToothSVG)}
                    </div>
                    <div className="flex gap-1 ps-2">
                      {ADULT_LOWER_LEFT.map(renderToothSVG)}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Child Upper */}
                <div>
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Dents Temporaires Supérieures (Arcade 5 & 6)
                  </div>
                  <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex gap-1 border-e-2 border-teal-500 pe-2">
                      {CHILD_UPPER_RIGHT.map(renderToothSVG)}
                    </div>
                    <div className="flex gap-1 ps-2">
                      {CHILD_UPPER_LEFT.map(renderToothSVG)}
                    </div>
                  </div>
                </div>

                <div className="w-full border-t border-dashed border-slate-200" />

                {/* Child Lower */}
                <div>
                  <div className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                    Dents Temporaires Inférieures (Arcade 8 & 7)
                  </div>
                  <div className="flex justify-center items-center gap-2 overflow-x-auto pb-2">
                    <div className="flex gap-1 border-e-2 border-teal-500 pe-2">
                      {CHILD_LOWER_RIGHT.map(renderToothSVG)}
                    </div>
                    <div className="flex gap-1 ps-2">
                      {CHILD_LOWER_LEFT.map(renderToothSVG)}
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Tooth Diagnosis Panel */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">
                  Dent {selectedTooth ? `#${selectedTooth}` : 'Non sélectionnée'}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedTooth ? 'Édition de l’état et des faces' : 'Sélectionnez une dent'}
                </CardDescription>
              </div>
              {selectedTooth && teethData[selectedTooth] && (
                <Badge variant="outline" className="text-xs font-bold">
                  {teethData[selectedTooth].state.toUpperCase()}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {selectedTooth ? (
              <>
                {/* State selector */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">État clinique</Label>
                  <select
                    value={selectedState}
                    disabled={readOnly}
                    onChange={(e) => setSelectedState(e.target.value as ToothState)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm font-medium focus:border-teal-500"
                  >
                    <option value="healthy">Saine</option>
                    <option value="caries">Carie active</option>
                    <option value="filling">Obturation (composite / amalgame)</option>
                    <option value="crown">Couronne prothétique</option>
                    <option value="root_canal">Traitement de racine (Endo)</option>
                    <option value="implant">Implant ostéo-intégré</option>
                    <option value="missing">Dent absente</option>
                    <option value="extraction_indicated">Indication d'extraction</option>
                  </select>
                </div>

                {/* Surfaces selector */}
                {selectedState !== 'missing' && selectedState !== 'healthy' && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Faces concernées</Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {(
                        [
                          { key: 'occlusal', label: 'Occlusale' },
                          { key: 'mesial', label: 'Mésiale' },
                          { key: 'distal', label: 'Distale' },
                          { key: 'vestibular', label: 'Vestibulaire' },
                          { key: 'lingual', label: 'Linguale' },
                        ] as const
                      ).map((s) => {
                        const isChecked = selectedSurfaces.includes(s.key);
                        return (
                          <button
                            key={s.key}
                            type="button"
                            disabled={readOnly}
                            onClick={() => toggleSurface(s.key)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-left font-medium transition-colors ${
                              isChecked
                                ? 'bg-teal-50 border-teal-500 text-teal-800'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{s.label}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-teal-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Clinical Notes */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Observations / Diagnostic</Label>
                  <textarea
                    rows={3}
                    disabled={readOnly}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Carie juxta-gingivale, sensibilité au froid..."
                    className="w-full rounded-md border border-slate-300 p-2 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {!readOnly && (
                  <Button
                    onClick={handleApplyToothState}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs py-2 shadow-sm"
                  >
                    <Save className="w-4 h-4 me-1.5" />
                    <span>Appliquer à la dent #{selectedTooth}</span>
                  </Button>
                )}

                {savedSuccess && (
                  <div className="p-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200 animate-in fade-in">
                    Modifications enregistrées !
                  </div>
                )}

                {/* History if available */}
                {teethData[selectedTooth] && (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>Dernière mise à jour</span>
                    </div>
                    <p>Par {teethData[selectedTooth].updatedBy}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                Touchez une dent sur le schéma pour saisir un diagnostic
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
