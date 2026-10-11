import type { ReactElement } from "react";
import type { StaffSessionResponse } from "@pte/api-client";
import { Board, BoardColumn, EmptyState } from "@pte/ui";
import { getStaffProctorBoardColumn, STAFF_PROCTOR_BOARD_COLUMNS } from "../constants";
import type { StaffDetailText } from "../hooks/useStaffDetailText";
import { ProctorSessionCard } from "./ProctorSessionCard";

interface ProctorSessionListProps {
  rows: StaffSessionResponse[];
  text: StaffDetailText;
}

export const ProctorSessionList = ({ rows, text }: ProctorSessionListProps): ReactElement => (
  <Board label={text.schedule} columns={4}>
    {STAFF_PROCTOR_BOARD_COLUMNS.map(({ key }) => {
      const columnRows = rows.filter(
        (row) => getStaffProctorBoardColumn(row.sessionStatus) === key,
      );
      return (
        <BoardColumn
          key={key}
          title={text[key]}
          summary={String(columnRows.length)}
          collapsible={false}
        >
          {columnRows.length > 0 ? (
            <div className="flex min-w-0 flex-col gap-3">
              {columnRows.map((row) => (
                <ProctorSessionCard key={row.sessionPublicId} row={row} text={text} />
              ))}
            </div>
          ) : (
            <EmptyState
              title={text.emptySchedule}
              className="border-dashed px-3 py-8 shadow-none"
            />
          )}
        </BoardColumn>
      );
    })}
  </Board>
);
