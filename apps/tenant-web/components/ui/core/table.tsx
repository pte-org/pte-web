/**
 * Backward-compatible tenant import path.
 * The shared table primitives live in @pte/ui so tenant and vendor screens
 * always use the same table surface and spacing.
 */
export {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRoot,
  TableRow,
} from "@pte/ui";
export type { TableRootProps } from "@pte/ui";
