"use client";

import { useAdminCopy } from "./adminCopy";

const ADMIN_SEARCH_COPY = {
  licenses: {
    placeholder: "Search by tenant, plan, or status",
    ariaLabel: "Search licenses by tenant, plan, or status",
  },
  plans: {
    placeholder: "Search by plan name, description, type, or status",
    ariaLabel: "Search plans by name, description, type, or status",
  },
  licenseCodes: {
    placeholder: "Search by tenant or license identifier",
    ariaLabel: "Search license codes by tenant or identifier",
  },
  applications: {
    placeholder: "Search by organization, code, email, phone, or tax code",
    ariaLabel: "Search applications by organization, code, email, phone, or tax code",
  },
  announcements: {
    placeholder: "Search by announcement title or body",
    ariaLabel: "Search announcements by title or body",
  },
  supportTickets: {
    placeholder: "Search by ticket ID, description, category, or status",
    ariaLabel: "Search support tickets by ticket ID, description, category, or status",
  },
  organizations: {
    placeholder: "Search by organization name or address",
    ariaLabel: "Search organizations by name or address",
  },
  tenants: {
    placeholder: "Search by tenant name, code, or tax code",
    ariaLabel: "Search tenants by name, code, or tax code",
  },
  recentTenants: {
    placeholder: "Search by tenant name",
    ariaLabel: "Search recent tenants by name",
  },
  scoreTemplates: {
    placeholder: "Search by template name, code, or version",
    ariaLabel: "Search score templates by name, code, or version",
  },
  questionContent: {
    placeholder: "Search by question content",
    ariaLabel: "Search questions by content",
  },
} as const;

export type AdminSearchSurface = keyof typeof ADMIN_SEARCH_COPY;

export const useAdminSearchText = (surface: AdminSearchSurface): (typeof ADMIN_SEARCH_COPY)[AdminSearchSurface] =>
  useAdminCopy(ADMIN_SEARCH_COPY[surface]);
