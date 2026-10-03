import type { ReactNode } from "react";
import { AppShellNavigation } from "@/components/app/AppShellNavigation";
import { EmergencyTopBar } from "@/components/emergency/EmergencyTopBar";
import { InstallReminder } from "@/components/app/InstallReminder";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <EmergencyTopBar />
      <InstallReminder />
      <div className="app-shell__body">
        <AppShellNavigation />
        <div className="app-shell__content">{children}</div>
      </div>
    </div>
  );
}
