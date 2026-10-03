export type MedicalProfile = {
  id: string;
  fullName: string;
  birthDate: string; // e.g. "14.05.2012"
  age: number; // e.g. 12
  bloodType: string; // e.g. "0 Rh-"
  allergies: string; // e.g. "Orzechy, penicylina"
  chronicDiseases: string; // e.g. "Brak"
  medications: string; // e.g. "Brak"
  additionalInfo: string; // e.g. "Nosi okulary.\nKontakt do szkoły w ważnych sytuacjach."
  updatedAt: string;
};

const STORAGE_KEY = "plan-0-medical-profiles-v1";
const CHANGE_EVENT = "plan-0-medical-profiles-change";

export const DEFAULT_MEDICAL_PROFILE: MedicalProfile = {
  id: "lenka-kowalska",
  fullName: "Lenka Kowalska",
  birthDate: "14.05.2012",
  age: 12,
  bloodType: "0 Rh-",
  allergies: "Orzechy, penicylina",
  chronicDiseases: "Brak",
  medications: "Brak",
  additionalInfo: "Nosi okulary.\nKontakt do szkoły w ważnych sytuacjach.",
  updatedAt: new Date().toISOString(),
};

function getStoredProfiles(): MedicalProfile[] {
  if (typeof window === "undefined") {
    return [DEFAULT_MEDICAL_PROFILE];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [DEFAULT_MEDICAL_PROFILE];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [DEFAULT_MEDICAL_PROFILE];
  } catch {
    return [DEFAULT_MEDICAL_PROFILE];
  }
}

let cachedProfiles: MedicalProfile[] | null = null;

export function getMedicalProfilesSnapshot(): MedicalProfile[] {
  if (!cachedProfiles) {
    cachedProfiles = getStoredProfiles();
  }
  return cachedProfiles;
}

export function getMedicalProfilesServerSnapshot(): MedicalProfile[] {
  return [DEFAULT_MEDICAL_PROFILE];
}

export function subscribeToMedicalProfiles(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedProfiles = getStoredProfiles();
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(CHANGE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(CHANGE_EVENT, handleUpdate);
  };
}

export function saveMedicalProfile(updated: MedicalProfile): void {
  const current = getStoredProfiles();
  const existingIdx = current.findIndex((p) => p.id === updated.id);
  let next: MedicalProfile[];
  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    next = [...current, { ...updated, updatedAt: new Date().toISOString() }];
  }

  cachedProfiles = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
