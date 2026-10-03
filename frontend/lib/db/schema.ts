export interface BaseEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export type DbSupplyCategory =
  | "water-food"
  | "health"
  | "hygiene"
  | "power-light"
  | "communication"
  | "documents-money"
  | "other";

export type DbSupplyUnit = "litres" | "days" | "items" | "sets";

export interface DbSupplyItem extends BaseEntity {
  name: string;
  category: DbSupplyCategory;
  onHand: number;
  target: number;
  unit: DbSupplyUnit;
  expiresOn: string | null;
}

export interface DbMedicalProfile extends BaseEntity {
  fullName: string;
  birthDate: string;
  age: number;
  bloodType: string;
  allergies: string;
  chronicDiseases: string;
  medications: string;
  additionalInfo: string;
}

export interface DbMedicalNote extends BaseEntity {
  memberId: string;
  title: string;
  content: string;
  category: "general" | "physician" | "emergency" | "diet";
}

export interface DbEmergencyContact extends BaseEntity {
  name: string;
  relationship: string;
  phone: string;
  altPhone?: string;
  location?: string;
  isPrimary?: boolean;
}

export interface DbPlanTask extends BaseEntity {
  title: string;
  description: string;
  completed: boolean;
  category?: string;
}

export const DB_NAME = "plan0_offline_db";
export const DB_VERSION = 1;

export const DB_STORES = {
  SUPPLIES: "supplies",
  MEDICAL_PROFILES: "medical_profiles",
  MEDICAL_NOTES: "medical_notes",
  CONTACTS: "contacts",
  PLAN_TASKS: "plan_tasks",
} as const;

export type DbStoreName = (typeof DB_STORES)[keyof typeof DB_STORES];

export interface StoreEntityMap {
  [DB_STORES.SUPPLIES]: DbSupplyItem;
  [DB_STORES.MEDICAL_PROFILES]: DbMedicalProfile;
  [DB_STORES.MEDICAL_NOTES]: DbMedicalNote;
  [DB_STORES.CONTACTS]: DbEmergencyContact;
  [DB_STORES.PLAN_TASKS]: DbPlanTask;
}
