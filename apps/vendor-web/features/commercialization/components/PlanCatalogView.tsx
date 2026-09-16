"use client";

import { useState, type FormEvent, type ReactElement } from "react";
import { Alert, Badge, Button, DataTable, Input, PageHeader, Select, StatCard } from "@pte/ui";
import { DEMO_PLANS } from "../data";
import type { CommercialPlan, PlanFamily } from "../types";
import { CommercialPanel } from "./CommercialPanel";
import { CommercialStatusBadge } from "./CommercialStatusBadge";

export const PlanCatalogView = (): ReactElement => {
  const [plans, setPlans] = useState(DEMO_PLANS);
  const [family, setFamily] = useState<PlanFamily>("EXAM_PACKAGE");
  const [createOpen, setCreateOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");

  const visiblePlans = plans.filter((plan) => plan.family === family);

  const addPlan = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (!name.trim()) return;
    const plan: CommercialPlan = {
      id: `draft-${Date.now()}`,
      name: name.trim(),
      family,
      status: "DRAFT",
      price: "$0",
      duration: family === "EXAM_PACKAGE" ? "30 days" : "Permanent add-on",
      capacity: family === "EXAM_PACKAGE" ? "500 students / exam" : "+500 students",
      description: "New plan awaiting configuration.",
    };
    setPlans((current) => [...current, plan]);
    setName("");
    setCreateOpen(false);
    setSaved(true);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Plan catalog"
        subtitle="Configure the packages available to approved tenants."
        actions={
          <Button size="sm" onClick={() => setCreateOpen((open) => !open)}>
            {createOpen ? "Close form" : "New plan"}
          </Button>
        }
      />
      {saved && (
        <Alert tone="success">Plan draft created. Configure pricing before activation.</Alert>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active plans" value="3" accent="mint" />
        <StatCard label="Exam packages" value="2" accent="blue" />
        <StatCard label="Capacity add-ons" value="1" accent="sky" />
      </div>

      {createOpen && (
        <CommercialPanel
          title="Create plan"
          subtitle="Start with a draft. Only active plans are visible to tenants."
        >
          <form
            className="grid gap-4 sm:grid-cols-[1fr_220px_auto] sm:items-end"
            onSubmit={addPlan}
          >
            <Input
              id="plan-name"
              label="Plan name"
              placeholder="e.g. Exam Pro"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <Select
              id="plan-family"
              label="Plan family"
              options={[
                { label: "Exam package", value: "EXAM_PACKAGE" },
                { label: "Student capacity", value: "STUDENT_CAPACITY" },
              ]}
              value={family}
              onChange={(event) => setFamily(event.target.value as PlanFamily)}
            />
            <Button type="submit">Create draft</Button>
          </form>
        </CommercialPanel>
      )}

      <CommercialPanel
        title="Published catalog"
        subtitle="Separate exam access from permanent student capacity."
        actions={
          <div className="flex rounded-md bg-slate-100 p-1">
            {(["EXAM_PACKAGE", "STUDENT_CAPACITY"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setFamily(option)}
                className={`rounded px-3 py-1.5 text-xs font-semibold ${family === option ? "bg-white text-action shadow-sm" : "text-slate-500"}`}
              >
                {option === "EXAM_PACKAGE" ? "Exam packages" : "Capacity add-ons"}
              </button>
            ))}
          </div>
        }
      >
        <DataTable
          columns={[
            {
              key: "name",
              header: "Plan",
              cell: (row: CommercialPlan) => (
                <div>
                  <p className="font-medium text-slate-900">{row.name}</p>
                  <p className="mt-1 text-xs text-slate-500">{row.description}</p>
                </div>
              ),
            },
            {
              key: "price",
              header: "Price",
              cell: (row: CommercialPlan) => <span className="font-semibold">{row.price}</span>,
            },
            { key: "duration", header: "Duration", cell: (row: CommercialPlan) => row.duration },
            { key: "capacity", header: "Capacity", cell: (row: CommercialPlan) => row.capacity },
            {
              key: "status",
              header: "Status",
              cell: (row: CommercialPlan) => <CommercialStatusBadge status={row.status} />,
            },
          ]}
          rows={visiblePlans}
          getRowKey={(row) => row.id}
          rowActions={() => (
            <button type="button" className="text-sm font-semibold text-action hover:underline">
              Edit
            </button>
          )}
          rowActionsHeader=""
        />
      </CommercialPanel>
      <Badge variant="info">Tenants only see ACTIVE plans</Badge>
    </div>
  );
};
