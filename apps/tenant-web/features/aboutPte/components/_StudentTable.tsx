import type { ReactElement } from "react";
import { Button, DataTable, type DataTableColumn } from "@pte/ui";
import type { AboutPteCopy } from "../constants/aboutPteCopy.en";
import { SKILLS } from "../constants/scoringWeights";
import type { ScoredStudent } from "../hooks/useScoringSimulation";

interface StudentTableProps {
  students: ScoredStudent[];
  stage: number;
  selectedId: number | null;
  onSelect: (id: number) => void;
  copy: AboutPteCopy;
}

const PAGE_SIZE = 10;
const PENDING = "—";

const answeredCount = (student: ScoredStudent): number =>
  Object.values(student.scores).reduce((sum, items) => sum + items.length, 0);

export const StudentTable = ({ students, stage, selectedId, onSelect, copy }: StudentTableProps): ReactElement => {
  const labels = copy.simulation.table;
  const columns: DataTableColumn<ScoredStudent>[] = [
    {
      key: "student",
      header: labels.student,
      sortAccessor: (row) => row.id,
      filterable: false,
      cell: (row) => (
        <Button variant={row.id === selectedId ? "primary" : "ghost"} size="sm" onClick={() => onSelect(row.id)}>
          {row.code}
        </Button>
      ),
    },
    { key: "ability", header: labels.ability, sortAccessor: (row) => row.ability, filterable: false, cell: (row) => row.ability },
    { key: "items", header: labels.items, sortable: false, filterable: false, cell: answeredCount },
    ...SKILLS.map<DataTableColumn<ScoredStudent>>((skill) => ({
      key: skill,
      header: copy.skills[skill],
      filterable: false,
      sortAccessor: (row) => row.result.skills[skill],
      cell: (row) => (stage >= 2 ? row.result.skills[skill] : PENDING),
    })),
    {
      key: "overall",
      header: labels.overall,
      filterable: false,
      sortAccessor: (row) => row.result.overall,
      cell: (row) => (stage >= 3 ? <strong>{row.result.overall}</strong> : PENDING),
    },
  ];
  return (
    <DataTable
      columns={columns}
      rows={students}
      getRowKey={(row) => row.id}
      showSearch={false}
      clientSideFiltering={false}
      initialPageSize={PAGE_SIZE}
      density="compact"
    />
  );
};
