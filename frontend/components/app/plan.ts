import {
  putInStore,
  subscribeToDatabase,
  DB_STORES,
  type DbPlanTask,
} from "@/lib/db";

export const PLAN_TASK_IDS = [
  "contacts",
  "meetingPlace",
  "supportInformation",
  "waterAndFood",
  "kitAndPower",
  "rolesAndDocuments",
] as const;

export type PlanTaskId = (typeof PLAN_TASK_IDS)[number];

export type StoredPlanTask = {
  id: PlanTaskId;
  completed: boolean;
  updatedAt: string;
};

const STORAGE_KEY = "plan-0-plan-tasks-v1";
const CHANGE_EVENT = "plan-0-plan-tasks-change";
const EMPTY_TASKS: StoredPlanTask[] = [];

let cachedTasks: StoredPlanTask[] | null = null;

function isPlanTaskId(value: unknown): value is PlanTaskId {
  return typeof value === "string" && PLAN_TASK_IDS.includes(value as PlanTaskId);
}

function isStoredPlanTask(value: unknown): value is StoredPlanTask {
  if (!value || typeof value !== "object") return false;
  const task = value as Partial<StoredPlanTask>;
  return isPlanTaskId(task.id) && typeof task.completed === "boolean" && typeof task.updatedAt === "string";
}

function getStoredPlanTasks(): StoredPlanTask[] {
  if (typeof window === "undefined") return EMPTY_TASKS;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_TASKS;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(isStoredPlanTask) ? parsed : EMPTY_TASKS;
  } catch {
    return EMPTY_TASKS;
  }
}

function resetCache() {
  cachedTasks = null;
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", resetCache);
  window.addEventListener("plan-0-db-change", resetCache);
  window.addEventListener(CHANGE_EVENT, resetCache);
}

export function getPlanTasksSnapshot(): StoredPlanTask[] {
  if (!cachedTasks) cachedTasks = getStoredPlanTasks();
  return cachedTasks;
}

export function getPlanTasksServerSnapshot(): StoredPlanTask[] {
  return EMPTY_TASKS;
}

export function subscribeToPlanTasks(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const handleUpdate = () => {
    cachedTasks = getStoredPlanTasks();
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

export function savePlanTask(taskId: PlanTaskId, completed: boolean): void {
  const updatedTask: StoredPlanTask = { id: taskId, completed, updatedAt: new Date().toISOString() };
  const next = [
    ...getPlanTasksSnapshot().filter((task) => task.id !== taskId),
    updatedTask,
  ];

  cachedTasks = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // The in-memory state remains usable for this session when storage is unavailable.
  }

  const dbTask: DbPlanTask = {
    ...updatedTask,
    title: taskId,
    description: "Manual plan confirmation",
    category: "manual",
  };
  putInStore(DB_STORES.PLAN_TASKS, dbTask).catch(() => {});
  window.dispatchEvent(new Event(CHANGE_EVENT));
}
