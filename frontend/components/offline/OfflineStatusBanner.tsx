"use client";

import { Alert } from "@/components/ui/Alert";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { useOfflineResilience } from "@/components/offline/OfflineResilienceProvider";

export function OfflineStatusBanner() {
  const { connectionStatus } = useOfflineResilience();
  const { messages } = useLocalization();

  if (connectionStatus !== "offline") return null;

  const copy = messages.offlineStatus;
  return (
    <Alert
      className="app-shell__offline-status"
      description={copy.description}
      title={copy.title}
      variant="warning"
    />
  );
}
