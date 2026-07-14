import type { ReactElement } from "react";
import { TENANT_LOCATION_OPTIONS } from "../../tenancy/constants";
import type { Tenant } from "../../tenancy/types";
import { DASHBOARD_MAP_TEXT } from "../constants";

interface VietnamTenantMapProps {
  tenants: Tenant[];
}

const VIETNAM_PATH =
  "M108 24 C122 32 132 44 128 60 C124 74 138 82 134 96 C130 111 112 116 114 132 C116 146 132 151 129 167 C126 183 105 185 107 201 C109 219 132 222 136 240 C140 258 122 268 116 281 C110 294 119 310 108 326 C98 342 76 336 76 318 C76 299 92 291 91 275 C90 259 74 249 80 234 C85 221 101 219 99 203 C97 187 82 176 89 160 C95 146 106 141 101 126 C96 111 81 102 88 88 C96 73 113 72 107 58 C101 44 91 34 108 24 Z";

const locationLabelByValue = new Map(
  TENANT_LOCATION_OPTIONS.map((location) => [location.value, location.label]),
);

function getLocationCounts(tenants: Tenant[]): Map<string, number> {
  return tenants.reduce((counts, tenant) => {
    if (!tenant.location) return counts;
    if (!locationLabelByValue.has(tenant.location)) return counts;
    counts.set(tenant.location, (counts.get(tenant.location) ?? 0) + 1);
    return counts;
  }, new Map<string, number>());
}

export const VietnamTenantMap = ({
  tenants,
}: VietnamTenantMapProps): ReactElement => {
  const counts = getLocationCounts(tenants);
  const activeLocations = TENANT_LOCATION_OPTIONS.filter((location) =>
    counts.has(location.value),
  );
  const mappedTenantCount = activeLocations.reduce(
    (total, location) => total + (counts.get(location.value) ?? 0),
    0,
  );

  return (
    <section className="rounded-lg border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {DASHBOARD_MAP_TEXT.TITLE}
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            {DASHBOARD_MAP_TEXT.SUBTITLE}
          </p>
        </div>
        <div className="rounded-md bg-blue-50 px-3 py-2 text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-blue-600">
            {DASHBOARD_MAP_TEXT.MAPPED_LABEL}
          </p>
          <p className="text-xl font-semibold text-gray-900">
            {mappedTenantCount}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(220px,320px)_1fr]">
        <div className="flex justify-center rounded-lg bg-slate-50 p-4">
          <svg
            viewBox="0 0 220 360"
            role="img"
            aria-label={DASHBOARD_MAP_TEXT.ARIA_LABEL}
            className="h-[320px] w-full max-w-[220px]"
          >
            <path
              d={VIETNAM_PATH}
              fill="#dbeafe"
              stroke="#93c5fd"
              strokeWidth="2"
            />
            {activeLocations.map((location) => {
              const count = counts.get(location.value) ?? 0;

              return (
                <g key={location.value}>
                  <circle
                    cx={location.x}
                    cy={location.y}
                    r="9"
                    fill="#2563eb"
                    fillOpacity="0.16"
                  />
                  <circle
                    cx={location.x}
                    cy={location.y}
                    r="4.5"
                    fill="#2563eb"
                    stroke="#ffffff"
                    strokeWidth="2"
                  >
                    <title>
                      {location.label}: {count} {DASHBOARD_MAP_TEXT.TENANT_UNIT}
                    </title>
                  </circle>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="grid content-start gap-3 sm:grid-cols-2">
          {activeLocations.length > 0 ? (
            activeLocations.map((location) => (
              <div
                key={location.value}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                  {location.label}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {counts.get(location.value)}
                </span>
              </div>
            ))
          ) : (
            <div className="rounded-lg border border-dashed border-gray-200 p-4 text-sm text-gray-500">
              {DASHBOARD_MAP_TEXT.EMPTY}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
