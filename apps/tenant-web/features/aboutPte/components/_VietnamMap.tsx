import type { ReactElement } from "react";
import {
  CITY_COORDS,
  HOANG_SA,
  MAINLAND,
  MAP_HEIGHT,
  MAP_WIDTH,
  PHU_QUOC,
  project,
  toPath,
  TRUONG_SA,
  type LonLat,
} from "../constants/vietnamMap";

interface VietnamMapProps {
  cities: readonly string[];
  active: number | null;
  labels: { title: string; sea: string; hoangSa: string; truongSa: string };
}

/** Label side per city so Ho Chi Minh City and Can Tho do not overlap. */
const LABEL_LEFT = new Set([3]);
const PIN_RADIUS = 7;
/** Keeps archipelago labels inside the map frame. */
const LABEL_MARGIN = 48;
const HALO = "fill-current [paint-order:stroke] stroke-white stroke-[3px]";

const centre = (points: readonly LonLat[]): [number, number] => {
  const projected = points.map(project);
  return [
    projected.reduce((sum, [x]) => sum + x, 0) / projected.length,
    projected.reduce((sum, [, y]) => sum + y, 0) / projected.length,
  ];
};

const Archipelago = ({ points, label }: { points: readonly LonLat[]; label: string }): ReactElement => {
  const [cx, cy] = centre(points);
  return (
    <g className="text-[var(--home-navy)]">
      {points.map((point) => {
        const [x, y] = project(point);
        return <circle key={`${x}-${y}`} cx={x} cy={y} r={2.5} className="fill-action" />;
      })}
      <text x={Math.min(cx, MAP_WIDTH - LABEL_MARGIN)} y={cy + 22} textAnchor="middle" className={`text-[11px] font-semibold ${HALO}`}>
        {label}
      </text>
    </g>
  );
};

/** Illustrative map of Vietnam with the PTE test-centre cities pinned. */
export const VietnamMap = ({ cities, active, labels }: VietnamMapProps): ReactElement => {
  const [phuQuocX, phuQuocY] = project(PHU_QUOC);
  return (
    <svg viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`} role="img" aria-label={labels.title} className="h-auto w-full">
      <rect width={MAP_WIDTH} height={MAP_HEIGHT} rx={24} className="fill-[var(--action-tint)]" />
      <text x={MAP_WIDTH * 0.78} y={MAP_HEIGHT * 0.6} textAnchor="middle" className="fill-action text-sm font-semibold italic opacity-60">
        {labels.sea}
      </text>
      <path d={toPath(MAINLAND)} className="fill-white stroke-action" strokeWidth={2} strokeLinejoin="round" />
      <circle cx={phuQuocX} cy={phuQuocY} r={4} className="fill-white stroke-action" strokeWidth={1.5} />
      <Archipelago points={HOANG_SA} label={labels.hoangSa} />
      <Archipelago points={TRUONG_SA} label={labels.truongSa} />
      {CITY_COORDS.map((coord, index) => {
        const [x, y] = project(coord);
        const isActive = active === index;
        const onLeft = LABEL_LEFT.has(index);
        return (
          <g key={cities[index]} className="text-[var(--home-navy)]">
            <circle cx={x} cy={y} r={isActive ? PIN_RADIUS * 2.4 : PIN_RADIUS * 1.8} className="fill-action opacity-20 transition-all duration-300" />
            <circle cx={x} cy={y} r={PIN_RADIUS} className={`stroke-white ${isActive ? "fill-[var(--home-navy)]" : "fill-action"}`} strokeWidth={2.5} />
            <text
              x={onLeft ? x - 14 : x + 14}
              y={y + 4}
              textAnchor={onLeft ? "end" : "start"}
              className={`text-xs font-bold ${HALO}`}
            >
              {cities[index]}
            </text>
          </g>
        );
      })}
    </svg>
  );
};
