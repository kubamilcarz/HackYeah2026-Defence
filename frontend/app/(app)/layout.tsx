import type { ReactNode } from "react";
import { AppShellNavigation } from "@/components/app/AppShellNavigation";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <AppShellNavigation />
      <div className="app-shell__content">{children}</div>
    </div>
  );
}
