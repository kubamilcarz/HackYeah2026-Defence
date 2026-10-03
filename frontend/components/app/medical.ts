export type MedicalNote = {
  id: string;
  memberId: string;
  title: string;
  content: string;
  category: "general" | "physician" | "emergency" | "diet";
  createdAt: string;
  updatedAt: string;
};

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

const PROFILES_STORAGE_KEY = "plan-0-medical-profiles-v1";
const PROFILES_CHANGE_EVENT = "plan-0-medical-profiles-change";

const NOTES_STORAGE_KEY = "plan-0-medical-notes-v1";
const NOTES_CHANGE_EVENT = "plan-0-medical-notes-change";

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

export const DEFAULT_MEDICAL_NOTES: MedicalNote[] = [
  {
    id: "note-1",
    memberId: "lenka-kowalska",
    title: "Okulary zapasowe",
    content: "W plecaku ewakuacyjnym znajduje się zapasowa para okularów (-1.5D) oraz ściereczka z mikrofibry.",
    category: "general",
    createdAt: "2026-10-01T10:00:00Z",
    updatedAt: "2026-10-01T10:00:00Z",
  },
  {
    id: "note-2",
    memberId: "lenka-kowalska",
    title: "Reakcja na orzechy",
    content: "W przypadku zjedzenia orzechów natychmiast podać lek przeciwhistaminowy z apteczki i zadzwonić pod 112.",
    category: "emergency",
    createdAt: "2026-10-02T14:30:00Z",
    updatedAt: "2026-10-02T14:30:00Z",
  },
];

/* Medical Profiles Storage */
function getStoredProfiles(): MedicalProfile[] {
  if (typeof window === "undefined") {
    return [DEFAULT_MEDICAL_PROFILE];
  }
  try {
    const raw = window.localStorage.getItem(PROFILES_STORAGE_KEY);
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
  window.addEventListener(PROFILES_CHANGE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(PROFILES_CHANGE_EVENT, handleUpdate);
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
    window.localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  window.dispatchEvent(new Event(PROFILES_CHANGE_EVENT));
}

/* Medical Notes Storage */
function getStoredNotes(): MedicalNote[] {
  if (typeof window === "undefined") {
    return DEFAULT_MEDICAL_NOTES;
  }
  try {
    const raw = window.localStorage.getItem(NOTES_STORAGE_KEY);
    if (!raw) return DEFAULT_MEDICAL_NOTES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return DEFAULT_MEDICAL_NOTES;
  } catch {
    return DEFAULT_MEDICAL_NOTES;
  }
}

let cachedNotes: MedicalNote[] | null = null;

export function getMedicalNotesSnapshot(): MedicalNote[] {
  if (!cachedNotes) {
    cachedNotes = getStoredNotes();
  }
  return cachedNotes;
}

export function getMedicalNotesServerSnapshot(): MedicalNote[] {
  return DEFAULT_MEDICAL_NOTES;
}

export function subscribeToMedicalNotes(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedNotes = getStoredNotes();
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(NOTES_CHANGE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(NOTES_CHANGE_EVENT, handleUpdate);
  };
}

export function saveMedicalNote(noteInput: Omit<MedicalNote, "id" | "createdAt" | "updatedAt"> & { id?: string }): void {
  const current = getStoredNotes();
  const now = new Date().toISOString();
  let next: MedicalNote[];

  if (noteInput.id) {
    next = current.map((item) =>
      item.id === noteInput.id
        ? { ...item, ...noteInput, id: noteInput.id, updatedAt: now }
        : item
    );
  } else {
    const newNote: MedicalNote = {
      ...noteInput,
      id: `note-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    next = [newNote, ...current];
  }

  cachedNotes = next;
  try {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  window.dispatchEvent(new Event(NOTES_CHANGE_EVENT));
}

export function deleteMedicalNote(noteId: string): void {
  const current = getStoredNotes();
  const next = current.filter((note) => note.id !== noteId);
  cachedNotes = next;
  try {
    window.localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  window.dispatchEvent(new Event(NOTES_CHANGE_EVENT));
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
