import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ToothChart, ToothCondition, ToothState, ToothSurface } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/AuthContext';
import { Save, History, Check, MousePointerClick } from 'lucide-react';
import { OdontogramDefs, ToothSvg } from './ToothSvg';
import { STATE_COLORS, getEffectiveSurfaces, isSurfaceState } from './toothGeometry';

// FDI Dental Notation (viewer's left = patient's right)
const ADULT_UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const ADULT_UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const ADULT_LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const ADULT_LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const CHILD_UPPER_RIGHT = [55, 54, 53, 52, 51];
const CHILD_UPPER_LEFT = [61, 62, 63, 64, 65];
const CHILD_LOWER_RIGHT = [85, 84, 83, 82, 81];
const CHILD_LOWER_LEFT = [71, 72, 73, 74, 75];

const EDITABLE_SURFACES: ToothSurface[] = ['occlusal', 'mesial', 'distal', 'vestibular', 'lingual'];

const STATE_OPTIONS: ToothState[] = [
  'healthy',
  'caries',
  'filling',
  'crown',
  'root_canal',
  'implant',
  'bridge',
  'missing',
  'extraction_indicated',
];

const LEGEND_STATES: ToothState[] = [
  'caries',
  'filling',
  'crown',
  'root_canal',
  'implant',
  'bridge',
  'missing',
  'extraction_indicated',
];

type Material = NonNullable<ToothCondition['material']>;

interface OdontogramProps {
  patientId?: string;
  initialChart?: ToothChart;
  readOnly?: boolean;
  onSave?: (chart: ToothChart) => void;
}

function createDemoTeeth(): Record<number, ToothCondition> {
  const now = new Date().toISOString();
  const by = 'Dr. Amine TAZI';
  return {
    16: { state: 'caries', surfaces: ['occlusal', 'mesial'], notes: 'Carie profonde émail-dentine', updatedAt: now, updatedBy: by },
    26: { state: 'crown', material: 'ceramic', notes: 'Couronne céramique scellée', updatedAt: now, updatedBy: by },
    36: { state: 'root_canal', notes: 'Dévitalisation 2 racines terminée', updatedAt: now, updatedBy: by },
    46: { state: 'filling', material: 'composite', surfaces: ['occlusal', 'distal'], notes: 'Composite', updatedAt: now, updatedBy: by },
    37: { state: 'filling', material: 'amalgam', surfaces: ['occlusal'], notes: 'Ancien amalgame', updatedAt: now, updatedBy: by },
    24: { state: 'implant', notes: 'Implant posé en 2025', updatedAt: now, updatedBy: by },
    48: { state: 'missing', notes: 'Dent de sagesse extraite en 2024', updatedAt: now, updatedBy: by },
    18: { state: 'extraction_indicated', notes: 'Dent de sagesse en malposition', updatedAt: now, updatedBy: by },
  };
}

export const OdontogramView: React.FC<OdontogramProps> = ({
  patientId = 'pat-1',
  initialChart,
  readOnly = false,
  onSave,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const [dentitionType, setDentitionType] = useState<'adult' | 'child'>(
    initialChart?.type === 'child' ? 'child' : 'adult'
  );
  const [teethData, setTeethData] = useState<Record<number, ToothCondition>>(
    () => initialChart?.teeth ?? createDemoTeeth()
  );

  const [selectedTooth, setSelectedTooth] = useState<number | null>(16);
  const [selectedState, setSelectedState] = useState<ToothState>(teethData[16]?.state ?? 'healthy');
  const [selectedSurfaces, setSelectedSurfaces] = useState<ToothSurface[]>(teethData[16]?.surfaces ?? []);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | undefined>(teethData[16]?.material);
  const [notes, setNotes] = useState(teethData[16]?.notes ?? '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const surfaceLabel = (surface: ToothSurface) => t(`odontogram.surfaces.${surface}`);
  const stateLabel = (state: ToothState) => t(`odontogram.states.${state}`);

  const loadTooth = (num: number) => {
    const existing = teethData[num];
    setSelectedTooth(num);
    setSelectedState(existing?.state ?? 'healthy');
    setSelectedSurfaces(existing?.surfaces ?? []);
    setSelectedMaterial(existing?.material);
    setNotes(existing?.notes ?? '');
  };

  const toggleSurface = (surface: ToothSurface) => {
    setSelectedSurfaces((prev) =>
      prev.includes(surface) ? prev.filter((s) => s !== surface) : [...prev, surface]
    );
  };

  /** Clicking a surface directly on the chart: select tooth + toggle surface (fast entry) */
  const handleChartSurfaceClick = (num: number, surface: ToothSurface) => {
    if (readOnly) {
      loadTooth(num);
      return;
    }
    const isSameTooth = num === selectedTooth;
    const baseState = isSameTooth ? selectedState : teethData[num]?.state ?? 'healthy';
    const baseSurfaces = isSameTooth ? selectedSurfaces : teethData[num]?.surfaces ?? [];
    if (!isSameTooth) loadTooth(num);

    setSelectedSurfaces(
      baseSurfaces.includes(surface) ? baseSurfaces.filter((s) => s !== surface) : [...baseSurfaces, surface]
    );
    if (baseState === 'healthy') setSelectedState('caries');
  };

  const handleDentitionChange = (type: 'adult' | 'child') => {
    setDentitionType(type);
    setSelectedTooth(null);
  };

  const handleApplyToothState = () => {
    if (!selectedTooth) return;

    const surfaceState = isSurfaceState(selectedState);
    const updated: ToothCondition = {
      state: selectedState,
      surfaces: surfaceState ? (selectedSurfaces.length > 0 ? selectedSurfaces : ['occlusal']) : undefined,
      material: selectedState === 'filling' || selectedState === 'crown' || selectedState === 'bridge'
        ? selectedMaterial
        : undefined,
      notes,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.fullName ?? 'Praticien',
    };

    const newTeeth = { ...teethData, [selectedTooth]: updated };
    setTeethData(newTeeth);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);

    onSave?.({
      id: `chart-${patientId}`,
      patientId,
      type: dentitionType,
      teeth: newTeeth,
      updatedAt: new Date().toISOString(),
      updatedBy: user?.id ?? 'unknown',
    });
  };

  const scale = dentitionType === 'adult' ? 1.2 : 1.55;

  const renderTooth = (num: number) => {
    const condition = teethData[num];
    const state = condition?.state ?? 'healthy';
    return (
      <ToothSvg
        key={num}
        toothNumber={num}
        condition={condition}
        scale={scale}
        selected={selectedTooth === num}
        surfaceLabel={surfaceLabel}
        ariaLabel={`${t('odontogram.selectedTooth')} ${num} — ${stateLabel(state)}`}
        onSelect={loadTooth}
        onSurfaceClick={(surface) => handleChartSurfaceClick(num, surface)}
      />
    );
  };

  const renderArch = (patientRight: number[], patientLeft: number[], upper: boolean) => (
    <div className={`flex justify-center ${upper ? 'items-end' : 'items-start'}`}>
      <div className="flex">{patientRight.map(renderTooth)}</div>
      <div className="mx-1 w-0.5 self-stretch rounded-full bg-teal-500/70" aria-hidden="true" />
      <div className="flex">{patientLeft.map(renderTooth)}</div>
    </div>
  );

  const isAdult = dentitionType === 'adult';
  const draftCondition = { state: selectedState, surfaces: selectedSurfaces, material: selectedMaterial };
  const draftSurfaces = getEffectiveSurfaces(draftCondition);
  const showMaterial = selectedState === 'filling' || selectedState === 'crown' || selectedState === 'bridge';
  const materialOptions: Material[] =
    selectedState === 'filling' ? ['composite', 'amalgam'] : ['ceramic', 'metal'];

  return (
    <div className="space-y-6">
      <OdontogramDefs />

      {/* Top Bar with Dentition Switcher & Legend */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isAdult ? 'default' : 'outline'}
            onClick={() => handleDentitionChange('adult')}
          >
            {t('odontogram.adultTeeth')}
          </Button>
          <Button
            size="sm"
            variant={!isAdult ? 'default' : 'outline'}
            onClick={() => handleDentitionChange('child')}
          >
            {t('odontogram.childTeeth')}
          </Button>
        </div>

        <ul className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs" aria-label="Legend">
          {LEGEND_STATES.map((state) => (
            <li key={state} className="flex items-center gap-1.5 font-medium text-slate-600">
              <span
                className="inline-block h-3 w-3 rounded-sm border border-black/10"
                style={{ backgroundColor: STATE_COLORS[state] }}
              />
              {stateLabel(state)}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="xl:col-span-2 border-slate-200 shadow-sm bg-white overflow-hidden">
          <CardHeader className="pb-2 border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-sm font-bold text-slate-800">{t('odontogram.title')}</CardTitle>
            <CardDescription className="text-xs flex items-center gap-1.5">
              <MousePointerClick className="h-3.5 w-3.5" />
              {t('odontogram.clickHint')}
            </CardDescription>
          </CardHeader>
          {/* Dental charts keep anatomical orientation even in RTL (Arabic) */}
          <CardContent dir="ltr" className="p-3 sm:p-5 overflow-x-auto">
            <div className="mx-auto w-max min-w-full">
              <div className="flex justify-between px-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>{t('odontogram.patientRight')}</span>
                <span>{t('odontogram.maxilla')}</span>
                <span>{t('odontogram.patientLeft')}</span>
              </div>

              {isAdult
                ? renderArch(ADULT_UPPER_RIGHT, ADULT_UPPER_LEFT, true)
                : renderArch(CHILD_UPPER_RIGHT, CHILD_UPPER_LEFT, true)}

              <div className="my-3 border-t border-dashed border-slate-300" aria-hidden="true" />

              {isAdult
                ? renderArch(ADULT_LOWER_RIGHT, ADULT_LOWER_LEFT, false)
                : renderArch(CHILD_LOWER_RIGHT, CHILD_LOWER_LEFT, false)}

              <div className="mt-1 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                {t('odontogram.mandible')}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Diagnosis Panel */}
        <Card className="border-slate-200 shadow-sm bg-white">
          <CardHeader className="pb-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-800">
                  {selectedTooth ? `${t('odontogram.selectedTooth')} ${selectedTooth}` : t('odontogram.selectedTooth')}
                </CardTitle>
                <CardDescription className="text-xs">
                  {selectedTooth ? t('odontogram.livePreview') : t('odontogram.selectToothPrompt')}
                </CardDescription>
              </div>
              {selectedTooth && teethData[selectedTooth] && (
                <Badge variant="outline" className="text-xs font-bold">
                  {stateLabel(teethData[selectedTooth].state)}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {selectedTooth ? (
              <>
                {/* Large live preview — surfaces are clickable */}
                <div dir="ltr" className="flex justify-center rounded-xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white py-3">
                  <ToothSvg
                    key={selectedTooth}
                    toothNumber={selectedTooth}
                    condition={draftCondition}
                    scale={2.4}
                    showNumber={false}
                    surfaceLabel={surfaceLabel}
                    ariaLabel={`${t('odontogram.selectedTooth')} ${selectedTooth}`}
                    onSurfaceClick={
                      readOnly
                        ? undefined
                        : (surface) => {
                            toggleSurface(surface);
                            if (selectedState === 'healthy') setSelectedState('caries');
                          }
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="tooth-state" className="text-xs font-semibold text-slate-700">
                    {t('odontogram.clinicalState')}
                  </Label>
                  <select
                    id="tooth-state"
                    value={selectedState}
                    disabled={readOnly}
                    onChange={(e) => setSelectedState(e.target.value as ToothState)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm shadow-sm font-medium focus:border-teal-500"
                  >
                    {STATE_OPTIONS.map((state) => (
                      <option key={state} value={state}>
                        {stateLabel(state)}
                      </option>
                    ))}
                  </select>
                </div>

                {showMaterial && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      {t('odontogram.material')}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {materialOptions.map((material) => (
                        <button
                          key={material}
                          type="button"
                          disabled={readOnly}
                          onClick={() => setSelectedMaterial(material)}
                          className={`rounded-lg border p-2 font-medium transition-colors ${
                            selectedMaterial === material
                              ? 'border-teal-500 bg-teal-50 text-teal-800'
                              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {t(`odontogram.materials.${material}`)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {isSurfaceState(selectedState) && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">
                      {t('odontogram.affectedSurfaces')}
                    </Label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {EDITABLE_SURFACES.map((surface) => {
                        const isChecked = draftSurfaces.includes(surface);
                        return (
                          <button
                            key={surface}
                            type="button"
                            disabled={readOnly}
                            aria-pressed={isChecked}
                            onClick={() => toggleSurface(surface)}
                            className={`flex items-center justify-between p-2 rounded-lg border text-start font-medium transition-colors ${
                              isChecked
                                ? 'bg-teal-50 border-teal-500 text-teal-800'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <span>{surfaceLabel(surface)}</span>
                            {isChecked && <Check className="w-3.5 h-3.5 text-teal-600" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <Label htmlFor="tooth-notes" className="text-xs font-semibold text-slate-700">
                    {t('odontogram.observations')}
                  </Label>
                  <textarea
                    id="tooth-notes"
                    rows={3}
                    disabled={readOnly}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('odontogram.observationsPlaceholder')}
                    className="w-full rounded-md border border-slate-300 p-2 text-xs focus:border-teal-500 focus:outline-none"
                  />
                </div>

                {!readOnly && (
                  <Button onClick={handleApplyToothState} className="w-full font-semibold text-xs py-2 shadow-sm">
                    <Save className="w-4 h-4 me-1.5" />
                    <span>{t('odontogram.saveTooth', { tooth: selectedTooth })}</span>
                  </Button>
                )}

                {savedSuccess && (
                  <div
                    role="status"
                    className="p-2 text-center text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200"
                  >
                    {t('odontogram.savedChanges')}
                  </div>
                )}

                {teethData[selectedTooth] && (
                  <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1 font-semibold text-slate-700">
                      <History className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t('odontogram.lastUpdated')}</span>
                    </div>
                    <p>{t('odontogram.updatedBy', { author: teethData[selectedTooth].updatedBy })}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                {t('odontogram.touchToothPrompt')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
