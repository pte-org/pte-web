import type { ReactElement } from "react";
import { AppErrorPage } from "@/lib/AppErrorPage";

/** Every unknown address and every notFound() of the app. */
export default function NotFound(): ReactElement {
  return <AppErrorPage kind="notFound" fullScreen />;
}
