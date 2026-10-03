export const SUPPLY_CATEGORIES = [
  "water-food",
  "health",
  "hygiene",
  "power-light",
  "communication",
  "documents-money",
  "other",
] as const;

export const SUPPLY_UNITS = ["litres", "days", "items", "sets"] as const;

export type SupplyCategory = (typeof SUPPLY_CATEGORIES)[number];
export type SupplyUnit = (typeof SUPPLY_UNITS)[number];

export type SupplyItem = {
  category: SupplyCategory;
  createdAt: string;
  expiresOn: string | null;
  id: string;
  name: string;
  onHand: number;
  target: number;
  unit: SupplyUnit;
  updatedAt: string;
};

export type SupplyItemInput = Omit<SupplyItem, "createdAt" | "id" | "updatedAt">;

export type InventoryIssue = "expired" | "expires-soon" | "restock";

export type SupplyLoadResult = {
  issue?: "storage-unavailable" | "stored-data-invalid";
  items: SupplyItem[];
};

export interface SuppliesRepository {
  load(): SupplyLoadResult;
  save(items: SupplyItem[]): "saved" | "storage-unavailable";
}

const STORAGE_KEY = "plan-0-supplies-v1";
const CHANGE_EVENT = "plan-0-supplies-change";

let clientSnapshot: SupplyLoadResult | null = null;

export const STARTER_ITEM_NAMES = {
  "starter-water": "Water",
  "starter-food": "Shelf-stable food",
  "starter-medication": "Personal medication",
  "starter-first-aid": "First-aid kit",
  "starter-hygiene": "Hygiene supplies",
  "starter-flashlight": "Flashlight",
  "starter-power": "Batteries or power bank",
  "starter-radio": "Battery or crank radio",
  "starter-documents": "Document and cash set",
} as const;

const STARTER_ITEMS: readonly SupplyItem[] = [
  { id: "starter-water", name: "Water", category: "water-food", onHand: 0, target: 9, unit: "litres", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-food", name: "Shelf-stable food", category: "water-food", onHand: 0, target: 3, unit: "days", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-medication", name: "Personal medication", category: "health", onHand: 0, target: 3, unit: "days", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-first-aid", name: "First-aid kit", category: "health", onHand: 0, target: 1, unit: "sets", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-hygiene", name: "Hygiene supplies", category: "hygiene", onHand: 0, target: 3, unit: "days", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-flashlight", name: "Flashlight", category: "power-light", onHand: 0, target: 1, unit: "items", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-power", name: "Batteries or power bank", category: "power-light", onHand: 0, target: 1, unit: "sets", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-radio", name: "Battery or crank radio", category: "communication", onHand: 0, target: 1, unit: "items", expiresOn: null, createdAt: "", updatedAt: "" },
  { id: "starter-documents", name: "Document and cash set", category: "documents-money", onHand: 0, target: 1, unit: "sets", expiresOn: null, createdAt: "", updatedAt: "" },
];

function isSupplyCategory(value: unknown): value is SupplyCategory {
  return typeof value === "string" && SUPPLY_CATEGORIES.includes(value as SupplyCategory);
}

function isSupplyUnit(value: unknown): value is SupplyUnit {
  return typeof value === "string" && SUPPLY_UNITS.includes(value as SupplyUnit);
}

function isDate(value: unknown) {
  return value === null || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

function isSupplyItem(value: unknown): value is SupplyItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SupplyItem>;
  return typeof item.id === "string"
    && typeof item.name === "string"
    && isSupplyCategory(item.category)
    && Number.isFinite(item.onHand)
    && Number.isFinite(item.target)
    && item.onHand >= 0
    && item.target >= 0
    && isSupplyUnit(item.unit)
    && isDate(item.expiresOn)
    && typeof item.createdAt === "string"
    && typeof item.updatedAt === "string";
}

function starterItems() {
  const timestamp = new Date().toISOString();
  return STARTER_ITEMS.map((item) => ({ ...item, createdAt: timestamp, updatedAt: timestamp }));
}

export function createSupplyItem(input: SupplyItemInput, id = crypto.randomUUID()): SupplyItem {
  const timestamp = new Date().toISOString();
  return { ...input, id, createdAt: timestamp, updatedAt: timestamp };
}

export function updateSupplyItem(item: SupplyItem, input: SupplyItemInput): SupplyItem {
  return { ...item, ...input, updatedAt: new Date().toISOString() };
}

function startOfToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function supplyIssues(item: SupplyItem, now = startOfToday()): InventoryIssue[] {
  const issues: InventoryIssue[] = [];
  if (item.onHand < item.target) issues.push("restock");
  if (!item.expiresOn) return issues;

  const expiry = new Date(`${item.expiresOn}T00:00:00`);
  const daysUntilExpiry = Math.round((expiry.getTime() - now.getTime()) / 86_400_000);
  if (daysUntilExpiry < 0) issues.push("expired");
  else if (daysUntilExpiry <= 30) issues.push("expires-soon");
  return issues;
}

import {
  putManyInStore,
  subscribeToDatabase,
  DB_STORES,
  type DbSupplyItem,
} from "@/lib/db";

export function isSupplyReady(item: SupplyItem, now?: Date) {
  return supplyIssues(item, now).length === 0;
}

export const localSuppliesRepository: SuppliesRepository = {
  load() {
    if (clientSnapshot) return clientSnapshot;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        clientSnapshot = { items: starterItems() };
        // Asynchronously backfill into IndexedDB
        putManyInStore(DB_STORES.SUPPLIES, clientSnapshot.items as DbSupplyItem[]).catch(() => {});
        return clientSnapshot;
      }
      const parsed: unknown = JSON.parse(stored);
      if (!Array.isArray(parsed) || !parsed.every(isSupplyItem)) {
        clientSnapshot = { items: starterItems(), issue: "stored-data-invalid" };
        return clientSnapshot;
      }
      clientSnapshot = { items: parsed };
      return clientSnapshot;
    } catch {
      clientSnapshot = { items: starterItems(), issue: "storage-unavailable" };
      return clientSnapshot;
    }
  },
  save(items) {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      clientSnapshot = { items };
    } catch {
      clientSnapshot = { items, issue: "storage-unavailable" };
    }
    // Also persist in IndexedDB
    putManyInStore(DB_STORES.SUPPLIES, items as DbSupplyItem[]).catch(() => {});
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return clientSnapshot.issue === "storage-unavailable" ? "storage-unavailable" : "saved";
  },
};

export function subscribeToSupplies(onStoreChange: () => void) {
  const synchronize = () => {
    clientSnapshot = null;
    onStoreChange();
  };
  window.addEventListener("storage", synchronize);
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  const unsubscribeDb = subscribeToDatabase(synchronize);
  return () => {
    window.removeEventListener("storage", synchronize);
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    unsubscribeDb();
  };
}

export function getSuppliesSnapshot() {
  return localSuppliesRepository.load();
}

export function getSuppliesServerSnapshot() {
  return null;
}

