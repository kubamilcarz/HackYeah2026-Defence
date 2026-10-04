import {
  hasCommunicationPlan,
  hasMeetingPlaces,
  hasRolesAndDocuments,
  type EmergencyPlan,
} from "@/components/app/emergency-plan";
import type { EmergencyContact } from "@/components/app/contacts";
import type { MedicalProfile } from "@/components/app/medical";
import { isSupplyReady, type SupplyItem } from "@/components/app/supplies";

export const PLAN_READINESS_STEP_IDS = [
  "contacts",
  "meetingPlace",
  "supportInformation",
  "waterAndFood",
  "kitAndPower",
  "rolesAndDocuments",
] as const;

export type PlanReadinessStepId = (typeof PLAN_READINESS_STEP_IDS)[number];

type PlanReadinessInput = {
  contacts: EmergencyContact[];
  emergencyPlan: EmergencyPlan;
  members: MedicalProfile[];
  supplies: SupplyItem[];
};

export function hasHealthDetails(profile: MedicalProfile) {
  const noValue = new Set(["", "-", "—", "none", "brak"]);
  return [profile.allergies, profile.chronicDiseases, profile.medications, profile.additionalInfo]
    .some((value) => !noValue.has(value.trim().toLowerCase()));
}

function categoryIsReady(items: SupplyItem[], categories: SupplyItem["category"][]) {
  const matching = items.filter((item) => categories.includes(item.category));
  return matching.length > 0 && matching.every((item) => isSupplyReady(item));
}

export function getPlanReadiness({ contacts, emergencyPlan, members, supplies }: PlanReadinessInput) {
  const completion: Record<PlanReadinessStepId, boolean> = {
    contacts: contacts.length > 0 && hasCommunicationPlan(emergencyPlan),
    meetingPlace: hasMeetingPlaces(emergencyPlan),
    supportInformation: members.some(hasHealthDetails),
    waterAndFood: categoryIsReady(supplies, ["water-food"]),
    kitAndPower: categoryIsReady(supplies, ["health", "power-light"]),
    rolesAndDocuments: hasRolesAndDocuments(emergencyPlan),
  };
  const completed = PLAN_READINESS_STEP_IDS.filter((id) => completion[id]).length;

  return {
    completed,
    completion,
    missing: PLAN_READINESS_STEP_IDS.filter((id) => !completion[id]),
    total: PLAN_READINESS_STEP_IDS.length,
  };
}
