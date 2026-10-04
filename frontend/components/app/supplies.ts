import {
  putManyInStore,
  deleteFromStore,
  subscribeToDatabase,
  DB_STORES,
  type DbSupplyItem,
} from "@/lib/db";
import type { MedicalProfile } from "@/components/app/medical";

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
  memberId?: string | null;
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
  return (
    typeof item.id === "string" &&
    typeof item.name === "string" &&
    isSupplyCategory(item.category) &&
    Number.isFinite(item.onHand) &&
    Number.isFinite(item.target) &&
    item.onHand >= 0 &&
    item.target >= 0 &&
    isSupplyUnit(item.unit) &&
    isDate(item.expiresOn) &&
    (item.memberId === undefined || item.memberId === null || typeof item.memberId === "string") &&
    typeof item.createdAt === "string" &&
    typeof item.updatedAt === "string"
  );
}

function starterItems(): SupplyItem[] {
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

export function isSupplyReady(item: SupplyItem, now?: Date) {
  return supplyIssues(item, now).length === 0;
}

/* Storage & Synchronization like Medical & Contacts */

let cachedSupplies: SupplyItem[] | null = null;
let cachedSnapshot: SupplyLoadResult | null = null;
let lastLoadIssue: SupplyLoadResult["issue"] = undefined;

const SERVER_STARTERS = starterItems();
const SERVER_SNAPSHOT: SupplyLoadResult = { items: SERVER_STARTERS };

export function resetSuppliesCache(): void {
  cachedSupplies = null;
  cachedSnapshot = null;
  lastLoadIssue = undefined;
}

function getStoredSupplies(): SupplyItem[] {
  if (typeof window === "undefined") {
    return starterItems();
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const defaults = starterItems();
      putManyInStore(DB_STORES.SUPPLIES, defaults as DbSupplyItem[]).catch(() => {});
      return defaults;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || !parsed.every(isSupplyItem)) {
      lastLoadIssue = "stored-data-invalid";
      return starterItems();
    }
    return parsed;
  } catch {
    lastLoadIssue = "storage-unavailable";
    return starterItems();
  }
}

if (typeof window !== "undefined") {
  const reset = () => {
    cachedSupplies = null;
    cachedSnapshot = null;
  };
  window.addEventListener("storage", reset);
  window.addEventListener("plan-0-db-change", reset);
  window.addEventListener(CHANGE_EVENT, reset);
}

export function getSupplyItemsSnapshot(): SupplyItem[] {
  if (!cachedSupplies) {
    cachedSupplies = getStoredSupplies();
  }
  return cachedSupplies;
}

export function getSupplyItemsServerSnapshot(): SupplyItem[] {
  return SERVER_STARTERS;
}

export function getSuppliesSnapshot(): SupplyLoadResult {
  if (!cachedSnapshot) {
    const items = getSupplyItemsSnapshot();
    cachedSnapshot = { items, issue: lastLoadIssue };
  }
  return cachedSnapshot;
}

export function getSuppliesServerSnapshot(): SupplyLoadResult {
  return SERVER_SNAPSHOT;
}

export function subscribeToSupplies(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedSupplies = getStoredSupplies();
    cachedSnapshot = { items: cachedSupplies, issue: lastLoadIssue };
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(CHANGE_EVENT, handleUpdate);
  const unsubscribeDb = subscribeToDatabase(handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(CHANGE_EVENT, handleUpdate);
    unsubscribeDb();
  };
}

export function saveAllSupplies(items: SupplyItem[]): "saved" | "storage-unavailable" {
  cachedSupplies = items;
  cachedSnapshot = { items, issue: lastLoadIssue };
  let status: "saved" | "storage-unavailable" = "saved";
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    status = "storage-unavailable";
    lastLoadIssue = "storage-unavailable";
    cachedSnapshot = { items, issue: "storage-unavailable" };
  }
  putManyInStore(DB_STORES.SUPPLIES, items as DbSupplyItem[]).catch(() => {});
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
  return status;
}

export function saveSupplyItem(updated: SupplyItem): void {
  const current = getSupplyItemsSnapshot();
  const existingIndex = current.findIndex((item) => item.id === updated.id);
  let next: SupplyItem[];
  if (existingIndex >= 0) {
    next = [...current];
    next[existingIndex] = { ...updated, updatedAt: new Date().toISOString() };
  } else {
    next = [...current, { ...updated, updatedAt: new Date().toISOString() }];
  }
  saveAllSupplies(next);
}

export function deleteSupplyItem(itemId: string): void {
  const current = getSupplyItemsSnapshot();
  const next = current.filter((item) => item.id !== itemId);
  cachedSupplies = next;
  cachedSnapshot = { items: next, issue: lastLoadIssue };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Graceful fallback
  }
  deleteFromStore(DB_STORES.SUPPLIES, itemId).catch(() => {});
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }
}

export const localSuppliesRepository: SuppliesRepository = {
  load() {
    return getSuppliesSnapshot();
  },
  save(items) {
    return saveAllSupplies(items);
  },
};

/* Household / Family Integration Logic */

export interface RecommendedHouseholdTargets {
  memberCount: number;
  waterTargetLitres: number; // 3L per person * 3 days = 9L per person
  foodTargetDays: number; // 3 days
  hygieneTargetDays: number; // 3 days
  flashlightTargetItems: number; // 1 per adult/person (min 1, max 4)
  powerTargetSets: number; // 1 set per 2 people (min 1)
  firstAidTargetSets: number; // 1 kit per 4 people (min 1)
}

export type SupplyRecommendation = {
  itemId: string;
  recommendedTarget: number;
  unit: SupplyUnit;
};

export function calculateRecommendedTargets(members: MedicalProfile[]): RecommendedHouseholdTargets {
  const memberCount = Math.max(1, members.length);
  return {
    memberCount,
    waterTargetLitres: memberCount * 9,
    foodTargetDays: 3,
    hygieneTargetDays: 3,
    flashlightTargetItems: Math.max(1, Math.min(memberCount, 4)),
    powerTargetSets: Math.max(1, Math.ceil(memberCount / 2)),
    firstAidTargetSets: Math.max(1, Math.ceil(memberCount / 4)),
  };
}

/**
 * Recommendations are deliberately limited to quantities that can be derived
 * from the household members the person has recorded. It does not infer any
 * additional health, dietary, or access needs.
 */
export function householdSupplyRecommendations(members: MedicalProfile[]): SupplyRecommendation[] {
  if (members.length === 0) return [];
  const targets = calculateRecommendedTargets(members);
  return [
    { itemId: "starter-water", recommendedTarget: targets.waterTargetLitres, unit: "litres" },
    { itemId: "starter-food", recommendedTarget: targets.foodTargetDays, unit: "days" },
    { itemId: "starter-hygiene", recommendedTarget: targets.hygieneTargetDays, unit: "days" },
    { itemId: "starter-first-aid", recommendedTarget: targets.firstAidTargetSets, unit: "sets" },
    { itemId: "starter-flashlight", recommendedTarget: targets.flashlightTargetItems, unit: "items" },
    { itemId: "starter-power", recommendedTarget: targets.powerTargetSets, unit: "sets" },
  ];
}

export interface FamilyMedicalNeed {
  memberId: string;
  fullName: string;
  relationship?: string;
  medications: string;
  allergies?: string;
  chronicDiseases?: string;
  hasAssignedSupply: boolean;
}

export function getFamilyMedicalRequirements(
  members: MedicalProfile[],
  supplies: SupplyItem[],
): FamilyMedicalNeed[] {
  const isNone = (val?: string) =>
    !val ||
    val.trim().toLowerCase() === "brak" ||
    val.trim().toLowerCase() === "none" ||
    val.trim() === "—" ||
    val.trim() === "-";

  return members
    .filter((member) => !isNone(member.medications) || !isNone(member.chronicDiseases))
    .map((member) => {
      const hasAssigned = supplies.some(
        (item) =>
          item.memberId === member.id ||
          item.name.toLowerCase().includes(member.fullName.toLowerCase()),
      );
      return {
        memberId: member.id,
        fullName: member.fullName,
        relationship: member.relationship,
        medications: isNone(member.medications) ? (member.chronicDiseases || "") : member.medications,
        allergies: member.allergies,
        chronicDiseases: member.chronicDiseases,
        hasAssignedSupply: hasAssigned,
      };
    });
}

/**
 * Adjusts supplies to match the current household members:
 * - Updates starter water, food, first aid, power, hygiene, and flashlight targets.
 * - Leaves onHand quantities intact.
 */
export function autoAdjustSuppliesForFamily(
  currentSupplies: SupplyItem[],
  members: MedicalProfile[],
): SupplyItem[] {
  const targets = calculateRecommendedTargets(members);
  const now = new Date().toISOString();

  return currentSupplies.map((item) => {
    switch (item.id) {
      case "starter-water":
        return { ...item, target: targets.waterTargetLitres, updatedAt: now };
      case "starter-food":
        return { ...item, target: targets.foodTargetDays, updatedAt: now };
      case "starter-hygiene":
        return { ...item, target: targets.hygieneTargetDays, updatedAt: now };
      case "starter-first-aid":
        return { ...item, target: targets.firstAidTargetSets, updatedAt: now };
      case "starter-flashlight":
        return { ...item, target: targets.flashlightTargetItems, updatedAt: now };
      case "starter-power":
        return { ...item, target: targets.powerTargetSets, updatedAt: now };
      default:
        return item;
    }
  });
}
