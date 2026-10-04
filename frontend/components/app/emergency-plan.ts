export type EmergencyPlan = {
  primaryMeetingPlace: string;
  backupMeetingPlace: string;
  familyRoles: string;
  documentsLocation: string;
  communicationPlan: string;
  updatedAt: string | null;
};

const STORAGE_KEY = "plan-0-emergency-plan-v1";
export const EMERGENCY_PLAN_CHANGE_EVENT = "plan-0-emergency-plan-change";

export const EMPTY_EMERGENCY_PLAN: EmergencyPlan = {
  primaryMeetingPlace: "",
  backupMeetingPlace: "",
  familyRoles: "",
  documentsLocation: "",
  communicationPlan: "",
  updatedAt: null,
};

const planFields = [
  "primaryMeetingPlace",
  "backupMeetingPlace",
  "familyRoles",
  "documentsLocation",
  "communicationPlan",
] as const;

let cachedPlan: EmergencyPlan | null = null;

function isEmergencyPlan(value: unknown): value is EmergencyPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Record<string, unknown>;
  return planFields.every((field) => typeof plan[field] === "string")
    && (typeof plan.updatedAt === "string" || plan.updatedAt === null);
}

function getStoredPlan(): EmergencyPlan {
  if (typeof window === "undefined") return EMPTY_EMERGENCY_PLAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_EMERGENCY_PLAN;
    const parsed: unknown = JSON.parse(raw);
    return isEmergencyPlan(parsed) ? parsed : EMPTY_EMERGENCY_PLAN;
  } catch {
    return EMPTY_EMERGENCY_PLAN;
  }
}

export function getEmergencyPlanSnapshot(): EmergencyPlan {
  if (!cachedPlan) cachedPlan = getStoredPlan();
  return cachedPlan;
}

export function getEmergencyPlanServerSnapshot(): EmergencyPlan {
  return EMPTY_EMERGENCY_PLAN;
}

export function subscribeToEmergencyPlan(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const update = () => {
    cachedPlan = getStoredPlan();
    onStoreChange();
  };
  window.addEventListener("storage", update);
  window.addEventListener(EMERGENCY_PLAN_CHANGE_EVENT, update);
  return () => {
    window.removeEventListener("storage", update);
    window.removeEventListener(EMERGENCY_PLAN_CHANGE_EVENT, update);
  };
}

export function saveEmergencyPlan(plan: Omit<EmergencyPlan, "updatedAt">): void {
  const next: EmergencyPlan = { ...plan, updatedAt: new Date().toISOString() };
  cachedPlan = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Keep the plan available for this session if browser storage is unavailable.
  }
  window.dispatchEvent(new Event(EMERGENCY_PLAN_CHANGE_EVENT));
}

export function hasMeetingPlaces(plan: EmergencyPlan): boolean {
  return Boolean(plan.primaryMeetingPlace.trim() && plan.backupMeetingPlace.trim());
}

export function hasRolesAndDocuments(plan: EmergencyPlan): boolean {
  return Boolean(plan.familyRoles.trim() && plan.documentsLocation.trim());
}

export function hasCommunicationPlan(plan: EmergencyPlan): boolean {
  return Boolean(plan.communicationPlan.trim());
}
