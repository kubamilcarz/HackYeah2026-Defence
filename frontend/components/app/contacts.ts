import {
  putInStore,
  putManyInStore,
  deleteFromStore,
  subscribeToDatabase,
  DB_STORES,
  type DbEmergencyContact,
} from "@/lib/db";

export type EmergencyContact = DbEmergencyContact;

const CONTACTS_STORAGE_KEY = "plan-0-emergency-contacts-v1";
const CONTACTS_CHANGE_EVENT = "plan-0-emergency-contacts-change";

const EMPTY_CONTACTS: EmergencyContact[] = [];

function getStoredContacts(): EmergencyContact[] {
  if (typeof window === "undefined") {
    return EMPTY_CONTACTS;
  }
  try {
    const raw = window.localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) return EMPTY_CONTACTS;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return EMPTY_CONTACTS;
  } catch {
    return EMPTY_CONTACTS;
  }
}

let cachedContacts: EmergencyContact[] | null = null;

export function resetContactsCache(): void {
  cachedContacts = null;
}

if (typeof window !== "undefined") {
  const reset = () => {
    cachedContacts = null;
  };
  window.addEventListener("storage", reset);
  window.addEventListener("plan-0-db-change", reset);
  window.addEventListener(CONTACTS_CHANGE_EVENT, reset);
}

export function getEmergencyContactsSnapshot(): EmergencyContact[] {
  if (!cachedContacts) {
    cachedContacts = getStoredContacts();
  }
  return cachedContacts;
}

export function getEmergencyContactsServerSnapshot(): EmergencyContact[] {
  return EMPTY_CONTACTS;
}

export function subscribeToEmergencyContacts(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedContacts = getStoredContacts();
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(CONTACTS_CHANGE_EVENT, handleUpdate);
  const unsubscribeDb = subscribeToDatabase(handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(CONTACTS_CHANGE_EVENT, handleUpdate);
    unsubscribeDb();
  };
}

export function saveEmergencyContact(contact: EmergencyContact): void {
  const current = getStoredContacts();
  const existingIdx = current.findIndex((c) => c.id === contact.id);
  const isPrimary = Boolean(contact.isPrimary);

  let next: EmergencyContact[];
  const itemToSave: EmergencyContact = {
    ...contact,
    isPrimary,
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    next = [...current];
    next[existingIdx] = itemToSave;
  } else {
    // If it's the very first contact, make it primary automatically unless explicitly specified otherwise
    if (current.length === 0 && contact.isPrimary === undefined) {
      itemToSave.isPrimary = true;
    }
    next = [...current, itemToSave];
  }

  // If this contact is primary, unset isPrimary on all other contacts
  if (itemToSave.isPrimary) {
    next = next.map((c) =>
      c.id === itemToSave.id ? c : { ...c, isPrimary: false }
    );
  }

  cachedContacts = next;
  try {
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  putManyInStore(DB_STORES.CONTACTS, next as DbEmergencyContact[]).catch(() => {});
  window.dispatchEvent(new Event(CONTACTS_CHANGE_EVENT));
}

export function deleteEmergencyContact(contactId: string): void {
  const current = getStoredContacts();
  const next = current.filter((c) => c.id !== contactId);

  // If the deleted contact was primary and others exist, nominate the first remaining as primary
  const wasPrimary = current.find((c) => c.id === contactId)?.isPrimary;
  if (wasPrimary && next.length > 0) {
    next[0] = { ...next[0], isPrimary: true };
  }

  cachedContacts = next;
  try {
    window.localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  deleteFromStore(DB_STORES.CONTACTS, contactId).catch(() => {});
  if (wasPrimary && next.length > 0) {
    putInStore(DB_STORES.CONTACTS, next[0] as DbEmergencyContact).catch(() => {});
  }
  window.dispatchEvent(new Event(CONTACTS_CHANGE_EVENT));
}
