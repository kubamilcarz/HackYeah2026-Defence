import type { PersonalizedPlan } from "@/lib/api";

const STORAGE_KEY = "plan-0-personalized-plan-v1";

export type SavedPersonalizedPlan = { plan: PersonalizedPlan; fingerprint: string };

export function getSavedPersonalizedPlan(): SavedPersonalizedPlan | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "null");
    return parsed?.plan && typeof parsed.fingerprint === "string" ? parsed : null;
  } catch { return null; }
}

export function savePersonalizedPlan(value: SavedPersonalizedPlan) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function clearPersonalizedPlan() {
  window.localStorage.removeItem(STORAGE_KEY);
}

export function householdFingerprint(snapshot: Record<string, unknown>) {
  return JSON.stringify(snapshot);
}
