import type { PersonalizedPlan } from "@/lib/api";

const STORAGE_KEY = "plan-0-personalized-plan-v1";
const CHANGE_EVENT = "plan-0-personalized-plan-change";

export type SavedPersonalizedPlan = { plan: PersonalizedPlan; fingerprint: string };

let cachedPlan: SavedPersonalizedPlan | null | undefined;

export function getSavedPersonalizedPlan(): SavedPersonalizedPlan | null {
  if (typeof window === "undefined") return null;
  if (cachedPlan !== undefined) return cachedPlan;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    cachedPlan = parsed?.plan && typeof parsed.fingerprint === "string" ? parsed : null;
    return cachedPlan;
  } catch {
    cachedPlan = null;
    return cachedPlan;
  }
}

export function getPersonalizedPlanServerSnapshot(): SavedPersonalizedPlan | null {
  return null;
}

export function subscribeToPersonalizedPlan(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const update = () => {
    cachedPlan = undefined;
    onStoreChange();
  };
  window.addEventListener("storage", update);
  window.addEventListener(CHANGE_EVENT, update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(CHANGE_EVENT, update);
  };
}

export function savePersonalizedPlan(value: SavedPersonalizedPlan) {
  cachedPlan = value;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function clearPersonalizedPlan() {
  cachedPlan = null;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function householdFingerprint(snapshot: Record<string, unknown>) {
  return JSON.stringify(snapshot);
}
