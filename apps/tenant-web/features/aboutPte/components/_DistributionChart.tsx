import type { ReactElement } from "react";
import { histogram } from "../utils/scoringEngine";

interface DistributionChartProps {
  values: readonly number[];
  title: string;
  hint: string;
}

const WIDTH = 480;
const HEIGHT = 220;
const AXIS = 24;
const GAP = 6;

export const DistributionChart = ({ values, title, hint }: DistributionChartProps): ReactElement => {
  const buckets = histogram(values);
  const peak = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const barWidth = (WIDTH - GAP * (buckets.length + 1)) / buckets.length;
  const plotHeight = HEIGHT - AXIS * 2;
  return (
    <figure>
      <figcaption className="text-sm font-semibold text-slate-900">{title}</figcaption>
      <p className="text-xs text-slate-500">{hint}</p>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={title} className="mt-3 w-full">
        {buckets.map((bucket, index) => {
          const barHeight = (bucket.count / peak) * plotHeight;
          const x = GAP + index * (barWidth + GAP);
          const y = AXIS + plotHeight - barHeight;
          return (
            <g key={bucket.from}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx={4} className="fill-action transition-all duration-500" />
              {bucket.count > 0 && (
                <text x={x + barWidth / 2} y={y - 4} textAnchor="middle" className="fill-slate-700 text-xs font-semibold">
                  {bucket.count}
                </text>
              )}
              <text x={x + barWidth / 2} y={HEIGHT - 6} textAnchor="middle" className="fill-slate-500 text-xs">
                {`${bucket.from}–${bucket.from + 9}`}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
};
