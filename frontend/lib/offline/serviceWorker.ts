/** Removes the service-worker copy when a household explicitly clears offline data. */
export async function clearServiceWorkerHouseholdSnapshot(): Promise<void> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const registration = await navigator.serviceWorker.getRegistration().catch(() => undefined);
  const worker = navigator.serviceWorker.controller ?? registration?.active;
  if (!worker) return;

  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    const timeout = window.setTimeout(resolve, 1000);
    channel.port1.onmessage = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    worker.postMessage({ type: "DELETE_HOUSEHOLD_SNAPSHOT" }, [channel.port2]);
  });
}
