import type { MedicalProfile } from "@/components/app/medical";

export type BackpackCategory =
  | "documents"
  | "water-food"
  | "health"
  | "tools-comm"
  | "clothing"
  | "hygiene"
  | "family-specific";

export type PackingType =
  | "per_person"
  | "per_person_scaled"
  | "shared"
  | "child_only"
  | "senior_only"
  | "pet_only"
  | "custom";

export type BackpackPriority = "essential" | "recommended";

export type BackpackItemDefinition = {
  id: string;
  category: BackpackCategory;
  packingType: PackingType;
  baseQuantity: number;
  unit: string;
  priority: BackpackPriority;
  forMemberTypes: ("adult" | "child" | "senior" | "pet")[];
};

export type CustomBackpackItem = {
  id: string;
  name: string;
  category: BackpackCategory;
  quantity: number;
  unit: string;
  note: string;
  packed: boolean;
};

export type FamilyComposition = {
  adults: number;
  children: number;
  seniors: number;
  pets: number;
};

export type CompiledBackpackItem = {
  id: string;
  category: BackpackCategory;
  packingType: PackingType;
  calculatedQuantity: number;
  unit: string;
  priority: BackpackPriority;
  packed: boolean;
  isCustom?: boolean;
  customName?: string;
  customNote?: string;
};

export type StoredBackpackData = {
  packedItemIds: string[];
  memberPackedItems: Record<string, string[]>;
  compositionOverride: FamilyComposition | null;
  customItems: CustomBackpackItem[];
  updatedAt: string;
};

export const BACKPACK_STORAGE_KEY = "plan-0-backpack-v1";
export const BACKPACK_CHANGE_EVENT = "plan-0-backpack-change";

export const OFFICIAL_RCB_BACKPACK_ITEMS: BackpackItemDefinition[] = [
  // 1. DOKUMENTY I FINANSE
  {
    id: "doc-id",
    category: "documents",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "doc-flashdrive",
    category: "documents",
    packingType: "shared",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "doc-cash",
    category: "documents",
    packingType: "shared",
    baseQuantity: 1,
    unit: "zestaw",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "doc-contacts",
    category: "documents",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },

  // 2. WODA I ŻYWNOŚĆ
  {
    id: "food-water",
    category: "water-food",
    packingType: "per_person_scaled",
    baseQuantity: 3, // 3 litry na osobę (min. na 72h)
    unit: "L",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "food-purification",
    category: "water-food",
    packingType: "shared",
    baseQuantity: 1,
    unit: "opak.",
    priority: "recommended",
    forMemberTypes: ["adult"],
  },
  {
    id: "food-rations",
    category: "water-food",
    packingType: "per_person_scaled",
    baseQuantity: 3, // racje na 3 dni na osobę
    unit: "dni",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "food-messkit",
    category: "water-food",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "recommended",
    forMemberTypes: ["adult", "senior"],
  },

  // 3. APTECZKA I ŚRODKI MEDYCZNE
  {
    id: "med-firstaid",
    category: "health",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "essential",
    forMemberTypes: ["adult", "senior"],
  },
  {
    id: "med-chronic",
    category: "health",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "zestaw",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "med-otc",
    category: "health",
    packingType: "shared",
    baseQuantity: 1,
    unit: "zestaw",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "med-masks",
    category: "health",
    packingType: "per_person_scaled",
    baseQuantity: 2, // 2 maseczki filtrujące FFP2/FFP3 na osobę
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "med-foil",
    category: "health",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },

  // 4. ŁĄCZNOŚĆ, NARZĘDZIA I ENERGIA
  {
    id: "tool-radio",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "tool-flashlight",
    category: "tools-comm",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "tool-powerbank",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "tool-whistle",
    category: "tools-comm",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "tool-multitool",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "tool-tape-cord",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "recommended",
    forMemberTypes: ["adult"],
  },
  {
    id: "tool-fire",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "opak.",
    priority: "essential",
    forMemberTypes: ["adult"],
  },
  {
    id: "tool-notebook",
    category: "tools-comm",
    packingType: "shared",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "recommended",
    forMemberTypes: ["adult"],
  },

  // 5. ODZIEŻ I SCHRONIENIE
  {
    id: "cloth-change",
    category: "clothing",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "cloth-rain",
    category: "clothing",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "cloth-gloves",
    category: "clothing",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "pary",
    priority: "recommended",
    forMemberTypes: ["adult", "senior"],
  },
  {
    id: "cloth-sleeping",
    category: "clothing",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "recommended",
    forMemberTypes: ["adult", "child", "senior"],
  },

  // 6. HIGIENA I SANITARIATY
  {
    id: "hyg-wipes",
    category: "hygiene",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "opak.",
    priority: "essential",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "hyg-teeth",
    category: "hygiene",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "recommended",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "hyg-towel",
    category: "hygiene",
    packingType: "per_person",
    baseQuantity: 1,
    unit: "szt.",
    priority: "recommended",
    forMemberTypes: ["adult", "child", "senior"],
  },
  {
    id: "hyg-trashbags",
    category: "hygiene",
    packingType: "shared",
    baseQuantity: 1,
    unit: "rolka",
    priority: "essential",
    forMemberTypes: ["adult"],
  },

  // 7. SPECJALNE: DZIECI, SENIORZY, ZWIERZĘTA
  {
    id: "fam-child-id",
    category: "family-specific",
    packingType: "child_only",
    baseQuantity: 1,
    unit: "szt.",
    priority: "essential",
    forMemberTypes: ["child"],
  },
  {
    id: "fam-child-toy",
    category: "family-specific",
    packingType: "child_only",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "recommended",
    forMemberTypes: ["child"],
  },
  {
    id: "fam-senior-aids",
    category: "family-specific",
    packingType: "senior_only",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "essential",
    forMemberTypes: ["senior"],
  },
  {
    id: "fam-pet-supplies",
    category: "family-specific",
    packingType: "pet_only",
    baseQuantity: 1,
    unit: "kpl.",
    priority: "essential",
    forMemberTypes: ["pet"],
  },
];

export const EMPTY_BACKPACK_DATA: StoredBackpackData = {
  packedItemIds: [],
  memberPackedItems: {},
  compositionOverride: null,
  customItems: [],
  updatedAt: "",
};

let cachedBackpackData: StoredBackpackData | null = null;

function isStoredBackpackData(value: unknown): value is StoredBackpackData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<StoredBackpackData>;
  return Array.isArray(data.packedItemIds) && typeof data.memberPackedItems === "object";
}

export function getStoredBackpackData(): StoredBackpackData {
  if (typeof window === "undefined") return EMPTY_BACKPACK_DATA;
  try {
    const raw = window.localStorage.getItem(BACKPACK_STORAGE_KEY);
    if (!raw) return EMPTY_BACKPACK_DATA;
    const parsed: unknown = JSON.parse(raw);
    return isStoredBackpackData(parsed) ? parsed : EMPTY_BACKPACK_DATA;
  } catch {
    return EMPTY_BACKPACK_DATA;
  }
}

function resetCache() {
  cachedBackpackData = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", resetCache);
  window.addEventListener(BACKPACK_CHANGE_EVENT, resetCache);
}

export function getBackpackSnapshot(): StoredBackpackData {
  if (!cachedBackpackData) cachedBackpackData = getStoredBackpackData();
  return cachedBackpackData;
}

export function getBackpackServerSnapshot(): StoredBackpackData {
  return EMPTY_BACKPACK_DATA;
}

export function subscribeToBackpack(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedBackpackData = getStoredBackpackData();
    onStoreChange();
  };

  window.addEventListener("storage", handleUpdate);
  window.addEventListener(BACKPACK_CHANGE_EVENT, handleUpdate);

  return () => {
    window.removeEventListener("storage", handleUpdate);
    window.removeEventListener(BACKPACK_CHANGE_EVENT, handleUpdate);
  };
}

export function saveBackpackData(updater: (current: StoredBackpackData) => StoredBackpackData): void {
  const current = getBackpackSnapshot();
  const next = {
    ...updater(current),
    updatedAt: new Date().toISOString(),
  };

  cachedBackpackData = next;
  try {
    window.localStorage.setItem(BACKPACK_STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(BACKPACK_CHANGE_EVENT));
  } catch {
    // Gracefully persist in session memory if storage throws
  }
}

export function deriveFamilyComposition(
  members: MedicalProfile[],
  override: FamilyComposition | null,
): FamilyComposition {
  if (override) return override;

  if (members.length === 0) {
    return { adults: 1, children: 0, seniors: 0, pets: 0 };
  }

  let adults = 0;
  let children = 0;
  let seniors = 0;

  for (const member of members) {
    const rel = (member.relationship || "").toLowerCase();
    const age = member.age || 0;

    if (age > 0 && age < 18) {
      children += 1;
    } else if (rel.includes("dziecko") || rel.includes("child") || rel.includes("córka") || rel.includes("syn")) {
      children += 1;
    } else if (age >= 65 || rel.includes("senior") || rel.includes("babcia") || rel.includes("dziadek")) {
      seniors += 1;
    } else {
      adults += 1;
    }
  }

  // Ensure at least 1 adult is in the household
  if (adults === 0 && children > 0) {
    adults = 1;
  }

  return { adults, children, seniors, pets: 0 };
}

export function getCompiledFamilyItems(
  composition: FamilyComposition,
  packedIds: string[],
  customItems: CustomBackpackItem[] = [],
): CompiledBackpackItem[] {
  const totalPeople = Math.max(1, composition.adults + composition.children + composition.seniors);

  const compiled: CompiledBackpackItem[] = [];

  for (const def of OFFICIAL_RCB_BACKPACK_ITEMS) {
    let calculatedQuantity = def.baseQuantity;
    let include = true;

    switch (def.packingType) {
      case "per_person":
        calculatedQuantity = def.baseQuantity * totalPeople;
        break;
      case "per_person_scaled":
        calculatedQuantity = def.baseQuantity * totalPeople;
        break;
      case "shared":
        calculatedQuantity = def.baseQuantity;
        break;
      case "child_only":
        if (composition.children === 0) include = false;
        else calculatedQuantity = def.baseQuantity * composition.children;
        break;
      case "senior_only":
        if (composition.seniors === 0) include = false;
        else calculatedQuantity = def.baseQuantity * composition.seniors;
        break;
      case "pet_only":
        if (composition.pets === 0) include = false;
        else calculatedQuantity = def.baseQuantity * composition.pets;
        break;
    }

    if (include) {
      compiled.push({
        id: def.id,
        category: def.category,
        packingType: def.packingType,
        calculatedQuantity,
        unit: def.unit,
        priority: def.priority,
        packed: packedIds.includes(def.id),
      });
    }
  }

  // Include custom items
  for (const custom of customItems) {
    compiled.push({
      id: custom.id,
      category: custom.category,
      packingType: "custom",
      calculatedQuantity: custom.quantity,
      unit: custom.unit,
      priority: "recommended",
      packed: packedIds.includes(custom.id) || custom.packed,
      isCustom: true,
      customName: custom.name,
      customNote: custom.note,
    });
  }

  return compiled;
}

export function getMemberBackpackItems(
  member: MedicalProfile,
  memberRole: "adult" | "child" | "senior",
  memberPackedIds: string[],
): CompiledBackpackItem[] {
  const items: CompiledBackpackItem[] = [];

  for (const def of OFFICIAL_RCB_BACKPACK_ITEMS) {
    // Only include items relevant for this member type
    if (!def.forMemberTypes.includes(memberRole)) continue;

    items.push({
      id: def.id,
      category: def.category,
      packingType: def.packingType,
      calculatedQuantity: def.baseQuantity,
      unit: def.unit,
      priority: def.priority,
      packed: memberPackedIds.includes(def.id),
    });
  }

  return items;
}

export function toggleBackpackItemPacked(itemId: string, memberId?: string): void {
  saveBackpackData((current) => {
    if (memberId) {
      const currentMemberPacked = current.memberPackedItems[memberId] || [];
      const nextMemberPacked = currentMemberPacked.includes(itemId)
        ? currentMemberPacked.filter((id) => id !== itemId)
        : [...currentMemberPacked, itemId];

      return {
        ...current,
        memberPackedItems: {
          ...current.memberPackedItems,
          [memberId]: nextMemberPacked,
        },
      };
    }

    // Consolidated global pack toggle
    const isPacked = current.packedItemIds.includes(itemId);
    const nextPacked = isPacked
      ? current.packedItemIds.filter((id) => id !== itemId)
      : [...current.packedItemIds, itemId];

    return {
      ...current,
      packedItemIds: nextPacked,
    };
  });
}

export function setAllBackpackItemsPacked(itemIds: string[], packed: boolean, memberId?: string): void {
  saveBackpackData((current) => {
    if (memberId) {
      return {
        ...current,
        memberPackedItems: {
          ...current.memberPackedItems,
          [memberId]: packed ? Array.from(new Set([...(current.memberPackedItems[memberId] || []), ...itemIds])) : [],
        },
      };
    }

    return {
      ...current,
      packedItemIds: packed ? Array.from(new Set([...current.packedItemIds, ...itemIds])) : [],
    };
  });
}

export function setCompositionOverride(override: FamilyComposition | null): void {
  saveBackpackData((current) => ({
    ...current,
    compositionOverride: override,
  }));
}

export function addCustomBackpackItem(item: Omit<CustomBackpackItem, "id" | "packed">): void {
  saveBackpackData((current) => ({
    ...current,
    customItems: [
      ...current.customItems,
      {
        ...item,
        id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        packed: false,
      },
    ],
  }));
}

export function removeCustomBackpackItem(itemId: string): void {
  saveBackpackData((current) => ({
    ...current,
    customItems: current.customItems.filter((item) => item.id !== itemId),
    packedItemIds: current.packedItemIds.filter((id) => id !== itemId),
  }));
}

export function calculateBackpackProgress(
  items: CompiledBackpackItem[],
): { packed: number; total: number; percentage: number } {
  const total = items.length;
  if (total === 0) return { packed: 0, total: 0, percentage: 0 };
  const packed = items.filter((item) => item.packed).length;
  const percentage = Math.round((packed / total) * 100);
  return { packed, total, percentage };
}
