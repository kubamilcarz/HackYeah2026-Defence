import type { ReactNode } from "react";
import { AppShellNavigation } from "@/components/app/AppShellNavigation";
import { InstallReminder } from "@/components/app/InstallReminder";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <InstallReminder />
      <div className="app-shell__body">
        <AppShellNavigation />
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
