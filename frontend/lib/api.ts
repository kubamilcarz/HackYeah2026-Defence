export type PlanActionTarget = "contacts" | "meetingPlace" | "supportInformation" | "waterAndFood" | "kitAndPower" | "rolesAndDocuments" | "supplies" | "backpack";

export type PersonalizedPlan = {
  version: string;
  generated_at: string;
  title: string;
  summary: string;
  priorities: { id: string; title: string; detail: string; target: PlanActionTarget }[];
  sections: { id: string; title: string; actions: { id: string; title: string; detail: string; target: PlanActionTarget }[] }[];
  questions_to_resolve: string[];
};

export type NearbyPlace = {
  id: string;
  type: "shelter" | "hospital" | "pharmacy";
  title: string;
  address: string;
  latitude: number;
  longitude: number;
  distance_km: number;
  accessibility: string | null;
  source: string;
  retrieved_at: string;
  temporary: boolean;
};

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000/api").replace(/\/$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { "Content-Type": "application/json", ...init?.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "The service is unavailable.");
  return body as T;
}

export function generatePersonalizedPlan(payload: { locale: "en" | "pl"; consent: true; household: Record<string, unknown> }) {
  return request<PersonalizedPlan>("/personalized-plan/", { body: JSON.stringify(payload), method: "POST" });
}

export function getNearbyPlaces(params: { lat: number; lon: number; types: string; query?: string; locale: "en" | "pl" }) {
  const search = new URLSearchParams({ lat: String(params.lat), lon: String(params.lon), radius_km: "5", types: params.types, locale: params.locale });
  if (params.query) search.set("query", params.query);
  return request<{ results: NearbyPlace[]; unavailable_types: string[]; retrieved_at: string }>(`/places/?${search}`);
}
