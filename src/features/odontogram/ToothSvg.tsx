import { useId } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type { ToothCondition, ToothState, ToothSurface } from '@/types';
import { cn } from '@/lib/utils';
import {
  CERVICAL_Y,
  OCCLUSAL_CENTER_Y,
  OCCLUSAL_HEIGHT,
  OCCLUSAL_REGIONS,
  OCCLUSAL_TOP,
  STATE_COLORS,
  TOOTH_CENTER_X,
  VESTIBULAR_HEIGHT,
  getEffectiveSurfaces,
  getOcclusalRegions,
  getToothShape,
  getVestibularMarkerPosition,
  isPrimaryTooth,
  isUpperTooth,
  regionToSurface,
  type ToothShape,
} from './toothGeometry';

type Material = ToothCondition['material'];

const OUTLINE = '#8b7f69';
const AMALGAM = '#64748b';

/**
 * Shared gradients. Render once per page (ids are global to the document).
 */
export function OdontogramDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="dm-enamel" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#e6ddc7" />
          <stop offset="0.35" stopColor="#fbf8ef" />
          <stop offset="0.55" stopColor="#fffdf7" />
          <stop offset="1" stopColor="#d9ceb4" />
        </linearGradient>
        <linearGradient id="dm-root" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#d6c194" />
          <stop offset="0.5" stopColor="#efe2c2" />
          <stop offset="1" stopColor="#c9b086" />
        </linearGradient>
        <linearGradient id="dm-gold" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#a87a12" />
          <stop offset="0.4" stopColor="#f2d270" />
          <stop offset="0.6" stopColor="#fbe7a1" />
          <stop offset="1" stopColor="#a1730f" />
        </linearGradient>
        <linearGradient id="dm-ceramic" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#dbe4ee" />
          <stop offset="0.5" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c8d3e0" />
        </linearGradient>
        <linearGradient id="dm-titanium" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#5b6878" />
          <stop offset="0.45" stopColor="#e2e8f0" />
          <stop offset="1" stopColor="#3f4a59" />
        </linearGradient>
        <linearGradient id="dm-gum" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbcfe8" stopOpacity="0" />
          <stop offset="0.55" stopColor="#fbcfe8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#f4a6c6" stopOpacity="0.9" />
        </linearGradient>
        <radialGradient id="dm-enamel-occ" cx="0.5" cy="0.5" r="0.6">
          <stop offset="0" stopColor="#fffdf8" />
          <stop offset="0.7" stopColor="#f6f0e2" />
          <stop offset="1" stopColor="#e2d7bf" />
        </radialGradient>
      </defs>
    </svg>
  );
}

function fillingColor(material: Material): string {
  return material === 'amalgam' || material === 'metal' ? AMALGAM : STATE_COLORS.filling;
}

/** Prosthetic crowns: gold for metal, ceramic (white/blue rim) otherwise */
function prostheticFill(material: Material): string {
  return material === 'metal' ? 'url(#dm-gold)' : 'url(#dm-ceramic)';
}

function getSurfaceFill(
  state: ToothState,
  surfaces: ToothSurface[],
  surface: ToothSurface,
  material: Material
): string {
  if (state === 'crown' || state === 'bridge') return prostheticFill(material);
  if (state === 'implant') return 'url(#dm-ceramic)';
  if (!surfaces.includes(surface)) return 'url(#dm-enamel-occ)';
  if (state === 'caries') return '#ef4444';
  if (state === 'filling') return fillingColor(material);
  return 'url(#dm-enamel-occ)';
}

function ImplantScrew() {
  const threads = [16, 21, 26, 31, 36, 41, 46];
  return (
    <g>
      <path
        d="M15 59 L15 18 Q15 10 20 8 Q25 10 25 18 L25 59 Z"
        fill="url(#dm-titanium)"
        stroke="#334155"
        strokeWidth={0.8}
      />
      {threads.map((y) => (
        <path
          key={y}
          d={`M14 ${y + 2} L26 ${y}`}
          stroke="#334155"
          strokeWidth={1.1}
          strokeLinecap="round"
        />
      ))}
      <rect x={16.5} y={50} width={7} height={8} fill="#cbd5e1" stroke="#334155" strokeWidth={0.6} />
    </g>
  );
}

interface ViewProps {
  toothNumber: number;
  shape: ToothShape;
  state: ToothState;
  surfaces: ToothSurface[];
  material: Material;
}

function SurfaceMarker({
  toothNumber,
  shape,
  surface,
  state,
  material,
}: Omit<ViewProps, 'surfaces'> & { surface: ToothSurface }) {
  const pos = getVestibularMarkerPosition(toothNumber, surface);
  const rx = Math.max(2.4, shape.width * 0.1);
  const opacity = pos.behind ? 0.45 : 1;

  if (state === 'caries') {
    return (
      <ellipse
        cx={pos.x}
        cy={pos.y}
        rx={rx}
        ry={3}
        fill="#451a03"
        stroke={STATE_COLORS.caries}
        strokeWidth={1.1}
        opacity={opacity}
      />
    );
  }

  return (
    <rect
      x={pos.x - rx}
      y={pos.y - 3}
      width={rx * 2}
      height={6}
      rx={2}
      fill={fillingColor(material)}
      stroke="#1e3a8a"
      strokeWidth={0.6}
      opacity={opacity}
    />
  );
}

function VestibularView({ toothNumber, shape, state, surfaces, material }: ViewProps) {
  const upper = isUpperTooth(toothNumber);
  const x0 = TOOTH_CENTER_X - shape.width / 2;
  const flip = upper ? undefined : `translate(0 ${VESTIBULAR_HEIGHT}) scale(1 -1)`;
  // Primary teeth have shorter roots
  const rootTransform = isPrimaryTooth(toothNumber)
    ? `translate(0 ${CERVICAL_Y}) scale(1 0.72) translate(0 ${-CERVICAL_Y})`
    : undefined;

  const isMissing = state === 'missing';
  const isImplant = state === 'implant';
  const isProsthetic = state === 'crown' || state === 'bridge';

  let crownFill = 'url(#dm-enamel)';
  let crownStroke = OUTLINE;
  let crownStrokeWidth = 0.8;
  if (isProsthetic) {
    crownFill = prostheticFill(material);
    crownStroke = material === 'metal' ? '#8a6410' : '#0284c7';
    crownStrokeWidth = 1.3;
  } else if (isImplant) {
    crownFill = 'url(#dm-ceramic)';
    crownStroke = '#0284c7';
    crownStrokeWidth = 1.3;
  } else if (state === 'extraction_indicated') {
    crownStroke = STATE_COLORS.extraction_indicated;
    crownStrokeWidth = 1.2;
  }

  return (
    <g transform={flip}>
      {/* Gingiva band (continuous across adjacent teeth) */}
      <rect x={x0} y={36} width={shape.width} height={24} fill="url(#dm-gum)" />

      <g opacity={isMissing ? 0.2 : 1} strokeDasharray={isMissing ? '2 1.5' : undefined}>
        <g transform={rootTransform}>
          {isImplant ? (
            <ImplantScrew />
          ) : (
            <path
              d={shape.root}
              fill="url(#dm-root)"
              stroke={OUTLINE}
              strokeWidth={0.8}
              strokeLinejoin="round"
            />
          )}
          {state === 'root_canal' &&
            shape.canals.map((d) => (
              <path
                key={d}
                d={d}
                fill="none"
                stroke={STATE_COLORS.root_canal}
                strokeWidth={2.2}
                strokeLinecap="round"
              />
            ))}
        </g>

        <path
          d={shape.crown}
          fill={crownFill}
          stroke={crownStroke}
          strokeWidth={crownStrokeWidth}
          strokeLinejoin="round"
        />

        {/* Enamel highlight for a glossy, 3D look */}
        {!isMissing && (
          <ellipse
            cx={TOOTH_CENTER_X - shape.width * 0.17}
            cy={73}
            rx={1.6}
            ry={7}
            fill="#ffffff"
            opacity={0.55}
          />
        )}
      </g>

      {state === 'bridge' && (
        <rect
          x={x0}
          y={64}
          width={shape.width}
          height={5}
          rx={1}
          fill="url(#dm-gold)"
          stroke="#a16207"
          strokeWidth={0.6}
        />
      )}

      {(state === 'caries' || state === 'filling') &&
        surfaces.map((surface) => (
          <SurfaceMarker
            key={surface}
            toothNumber={toothNumber}
            shape={shape}
            surface={surface}
            state={state}
            material={material}
          />
        ))}

      {isMissing && (
        <g stroke={STATE_COLORS.missing} strokeWidth={2.2} strokeLinecap="round">
          <line x1={x0 + 4} y1={12} x2={x0 + shape.width - 4} y2={84} />
          <line x1={x0 + shape.width - 4} y1={12} x2={x0 + 4} y2={84} />
        </g>
      )}

      {state === 'extraction_indicated' && (
        <g stroke={STATE_COLORS.extraction_indicated} strokeWidth={2.4} strokeLinecap="round">
          <line x1={x0 + 3} y1={32} x2={x0 + shape.width - 6} y2={8} />
          <line x1={x0 + 6} y1={37} x2={x0 + shape.width - 3} y2={13} />
        </g>
      )}
    </g>
  );
}

interface OcclusalViewProps extends ViewProps {
  clipId: string;
  surfaceLabel: (surface: ToothSurface) => string;
  onSurfaceClick?: (surface: ToothSurface) => void;
}

function OcclusalView({
  toothNumber,
  shape,
  state,
  surfaces,
  material,
  clipId,
  surfaceLabel,
  onSurfaceClick,
}: OcclusalViewProps) {
  const upper = isUpperTooth(toothNumber);
  // Flip around the centre so vestibular stays on the outside of each arch
  const flip = upper ? undefined : `translate(0 ${OCCLUSAL_CENTER_Y * 2}) scale(1 -1)`;
  const { outline, fissures } = shape.occlusal;
  const cx = TOOTH_CENTER_X;
  const cy = OCCLUSAL_CENTER_Y;

  if (state === 'missing') {
    return (
      <g transform={flip}>
        <path d={outline} fill="none" stroke="#94a3b8" strokeWidth={0.9} strokeDasharray="2 1.5" />
      </g>
    );
  }

  const regions = getOcclusalRegions(shape);
  const showFissures = fissures && state !== 'crown' && state !== 'bridge' && state !== 'implant';

  const handleRegionClick = (surface: ToothSurface) => (event: MouseEvent<SVGPolygonElement>) => {
    event.stopPropagation();
    onSurfaceClick?.(surface);
  };

  return (
    <g transform={flip}>
      <defs>
        <clipPath id={clipId}>
          <path d={outline} />
        </clipPath>
      </defs>

      <g clipPath={`url(#${clipId})`}>
        {OCCLUSAL_REGIONS.map((region) => {
          const surface = regionToSurface(toothNumber, region);
          return (
            <polygon
              key={region}
              points={regions[region]}
              fill={getSurfaceFill(state, surfaces, surface, material)}
              stroke="#b5a98f"
              strokeWidth={0.5}
              data-surface={surface}
              className={onSurfaceClick ? 'cursor-pointer transition-opacity hover:opacity-70' : undefined}
              onClick={onSurfaceClick ? handleRegionClick(surface) : undefined}
            >
              <title>{surfaceLabel(surface)}</title>
            </polygon>
          );
        })}
        {showFissures && (
          <path
            d={fissures}
            fill="none"
            stroke="#a89a7c"
            strokeWidth={0.7}
            strokeLinecap="round"
            pointerEvents="none"
          />
        )}
      </g>

      <path d={outline} fill="none" stroke={OUTLINE} strokeWidth={0.9} pointerEvents="none" />

      {state === 'implant' && (
        <g pointerEvents="none">
          <circle cx={cx} cy={cy} r={5} fill="url(#dm-titanium)" stroke="#334155" strokeWidth={0.6} />
          <polygon
            points={`${cx - 2},${cy - 3.4} ${cx + 2},${cy - 3.4} ${cx + 4},${cy} ${cx + 2},${cy + 3.4} ${cx - 2},${cy + 3.4} ${cx - 4},${cy}`}
            fill="#475569"
          />
        </g>
      )}
      {state === 'root_canal' && (
        <circle cx={cx} cy={cy} r={2.4} fill={STATE_COLORS.root_canal} pointerEvents="none" />
      )}
      {state === 'extraction_indicated' && (
        <g stroke={STATE_COLORS.extraction_indicated} strokeWidth={2} strokeLinecap="round" pointerEvents="none">
          <line x1={cx - 8} y1={cy - 8} x2={cx + 8} y2={cy + 8} />
          <line x1={cx + 8} y1={cy - 8} x2={cx - 8} y2={cy + 8} />
        </g>
      )}
    </g>
  );
}

export interface ToothSvgProps {
  toothNumber: number;
  condition?: Pick<ToothCondition, 'state' | 'surfaces' | 'material'>;
  /** Pixel size multiplier (1 unit = 1px) */
  scale?: number;
  selected?: boolean;
  showNumber?: boolean;
  ariaLabel?: string;
  surfaceLabel?: (surface: ToothSurface) => string;
  onSelect?: (toothNumber: number) => void;
  onSurfaceClick?: (surface: ToothSurface) => void;
}

const defaultSurfaceLabel = (surface: ToothSurface): string => surface;

export function ToothSvg({
  toothNumber,
  condition,
  scale = 1,
  selected = false,
  showNumber = true,
  ariaLabel,
  surfaceLabel = defaultSurfaceLabel,
  onSelect,
  onSurfaceClick,
}: ToothSvgProps) {
  const clipId = `occ-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const shape = getToothShape(toothNumber);
  const upper = isUpperTooth(toothNumber);
  const state: ToothState = condition?.state ?? 'healthy';
  const surfaces = getEffectiveSurfaces(condition);
  const material = condition?.material;
  const x0 = TOOTH_CENTER_X - shape.width / 2;
  const pixelWidth = shape.width * scale;

  const viewProps: ViewProps = { toothNumber, shape, state, surfaces, material };

  const vestibular = (
    <svg
      width={pixelWidth}
      height={VESTIBULAR_HEIGHT * scale}
      viewBox={`${x0} 0 ${shape.width} ${VESTIBULAR_HEIGHT}`}
      className="block overflow-visible"
      aria-hidden="true"
    >
      <VestibularView {...viewProps} />
    </svg>
  );

  const occlusal = (
    <svg
      width={pixelWidth}
      height={OCCLUSAL_HEIGHT * scale}
      viewBox={`${x0} ${OCCLUSAL_TOP} ${shape.width} ${OCCLUSAL_HEIGHT}`}
      className="block"
    >
      <OcclusalView
        {...viewProps}
        clipId={clipId}
        surfaceLabel={surfaceLabel}
        onSurfaceClick={onSurfaceClick}
      />
    </svg>
  );

  const number = showNumber ? (
    <span
      className={cn(
        'text-[11px] font-bold leading-5 tabular-nums',
        selected ? 'text-teal-700' : 'text-slate-500'
      )}
    >
      {toothNumber}
    </span>
  ) : null;

  const interactive = Boolean(onSelect);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect?.(toothNumber);
    }
  };

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel ?? `Dent ${toothNumber}`}
      aria-pressed={interactive ? selected : undefined}
      onClick={interactive ? () => onSelect?.(toothNumber) : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      className={cn(
        'flex flex-col items-center rounded-lg transition-colors select-none outline-none',
        interactive && 'cursor-pointer hover:bg-slate-100/80 focus-visible:ring-2 focus-visible:ring-teal-500',
        selected && 'bg-teal-50 ring-2 ring-inset ring-teal-500 hover:bg-teal-50'
      )}
    >
      {upper ? (
        <>
          {number}
          {vestibular}
          <div className="mt-1">{occlusal}</div>
        </>
      ) : (
        <>
          <div className="mb-1">{occlusal}</div>
          {vestibular}
          {number}
        </>
      )}
    </div>
  );
}
