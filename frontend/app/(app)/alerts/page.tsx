import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Alerts" };

export default function AlertsPage() {
  return (
    <PlaceholderScreen
      description="Alerts from connected, trusted sources will appear here when they are available. Follow official local instructions during an emergency."
      title="Alerts"
    />
  );
}
