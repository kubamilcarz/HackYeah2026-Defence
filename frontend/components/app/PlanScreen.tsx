"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import type { Icon } from "@phosphor-icons/react/lib";
import {
  ArrowRight,
  Check,
  Drop,
  FileText,
  FirstAidKit,
  MapPin,
  Package,
  Phone,
  Flashlight,
} from "@phosphor-icons/react/ssr";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { CircularProgress } from "@/components/ui/Progress";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Button } from "@/components/ui/Button";
import {
  getEmergencyContactsServerSnapshot,
  getEmergencyContactsSnapshot,
  subscribeToEmergencyContacts,
} from "@/components/app/contacts";
import {
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  subscribeToMedicalProfiles,
  type MedicalProfile,
} from "@/components/app/medical";
import {
  getSupplyItemsServerSnapshot,
  getSupplyItemsSnapshot,
  isSupplyReady,
  subscribeToSupplies,
  type SupplyItem,
} from "@/components/app/supplies";
import {
  getPlanTasksServerSnapshot,
  getPlanTasksSnapshot,
  savePlanTask,
  subscribeToPlanTasks,
  type PlanTaskId,
} from "@/components/app/plan";

type CompletionSource = "data" | "manual";

const planTasks: { icon: Icon; id: PlanTaskId; source: CompletionSource }[] = [
  { id: "contacts", icon: Phone, source: "data" },
  { id: "meetingPlace", icon: MapPin, source: "manual" },
  { id: "supportInformation", icon: FirstAidKit, source: "data" },
  { id: "waterAndFood", icon: Drop, source: "data" },
  { id: "kitAndPower", icon: Flashlight, source: "data" },
  { id: "rolesAndDocuments", icon: FileText, source: "manual" },
];

function replaceValues(message: string, values: Record<string, number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    message,
  );
}

function hasHealthDetails(profile: MedicalProfile) {
  const noValue = new Set(["", "-", "—", "none", "brak"]);
  return [profile.allergies, profile.chronicDiseases, profile.medications, profile.additionalInfo]
    .some((value) => !noValue.has(value.trim().toLowerCase()));
}

function categoryIsReady(items: SupplyItem[], categories: SupplyItem["category"][]) {
  const matching = items.filter((item) => categories.includes(item.category));
  return matching.length > 0 && matching.every((item) => isSupplyReady(item));
}

export function PlanScreen() {
  const { messages } = useLocalization();
  const copy = messages.plan;
  const planTaskState = useSyncExternalStore(subscribeToPlanTasks, getPlanTasksSnapshot, getPlanTasksServerSnapshot);
  const contacts = useSyncExternalStore(subscribeToEmergencyContacts, getEmergencyContactsSnapshot, getEmergencyContactsServerSnapshot);
  const members = useSyncExternalStore(subscribeToMedicalProfiles, getMedicalProfilesSnapshot, getMedicalProfilesServerSnapshot);
  const supplies = useSyncExternalStore(subscribeToSupplies, getSupplyItemsSnapshot, getSupplyItemsServerSnapshot);
  const manuallyCompleted = new Set(planTaskState.filter((task) => task.completed).map((task) => task.id));
  const dataCompletion: Record<Exclude<PlanTaskId, "meetingPlace" | "rolesAndDocuments">, boolean> = {
    contacts: contacts.length > 0,
    supportInformation: members.some(hasHealthDetails),
    waterAndFood: categoryIsReady(supplies, ["water-food"]),
    kitAndPower: categoryIsReady(supplies, ["health", "power-light"]),
  };
  const isComplete = (task: (typeof planTasks)[number]) => task.source === "data" ? dataCompletion[task.id as keyof typeof dataCompletion] : manuallyCompleted.has(task.id);
  const completedCount = planTasks.filter(isComplete).length;
  const total = planTasks.length;
  const percentage = Math.round((completedCount / total) * 100);
  const nextTask = planTasks.find((task) => !isComplete(task));

  const progressMessage = completedCount === 0
    ? copy.progress.notStarted
    : completedCount === total
      ? copy.progress.complete
      : replaceValues(copy.progress.inProgress, { completed: completedCount, total });

  return (
    <main className="plan-screen">
      <PageNavigationBar title={copy.title} />
      <div className="plan-screen__content">
        <h1 className="sr-only">{copy.title}</h1>

        <section aria-labelledby="plan-overview-heading" className="plan-screen__overview">
          <div className="plan-screen__progress-summary">
            <CircularProgress
              label={copy.progress.label}
              max={total}
              value={completedCount}
              valueLabel={`${completedCount}/${total}`}
              variant="success"
            />
            <div className="plan-screen__progress-copy">
              <h2 className="type-h2" id="plan-overview-heading">{copy.heading}</h2>
              <p className="type-h3 plan-screen__percentage">{replaceValues(copy.progress.percentage, { value: percentage })}</p>
              <p aria-live="polite" className="type-body plan-screen__progress-message">{progressMessage}</p>
            </div>
          </div>
          <p className="type-caption plan-screen__sample-note">{copy.sampleNote}</p>
        </section>

        {nextTask && (() => {
          const task = copy.tasks[nextTask.id];
          const source = nextTask.source === "data" ? copy.sources[nextTask.id as keyof typeof copy.sources] : undefined;
          return (
            <section aria-labelledby="plan-next-step-heading" className="plan-next-step">
              <p className="type-caption plan-next-step__eyebrow">{copy.nextStep.eyebrow}</p>
              <h2 className="type-h2" id="plan-next-step-heading">{task.title}</h2>
              <p className="type-body">{task.description}</p>
              {source ? (
                <Link className="button button--primary" href={source.href}>{source.label}</Link>
              ) : (
                <Button onClick={() => savePlanTask(nextTask.id, true)}>{copy.actions.markAgreed}</Button>
              )}
            </section>
          );
        })()}

        <section aria-labelledby="plan-checklist-heading" className="plan-screen__checklist-section">
          <div className="plan-screen__section-heading">
            <h2 className="type-h2" id="plan-checklist-heading">{copy.checklist}</h2>
            <p className="type-caption">{copy.checklistDescription}</p>
          </div>
          <ul className="plan-checklist">
            {planTasks.map((taskDefinition) => {
              const { icon: Icon, id } = taskDefinition;
              const task = copy.tasks[id];
              const completed = isComplete(taskDefinition);
              const source = taskDefinition.source === "data" ? copy.sources[id as keyof typeof copy.sources] : undefined;
              const status = completed
                ? taskDefinition.source === "data" ? copy.status.ready : copy.status.agreed
                : taskDefinition.source === "data" ? copy.status.needsInformation : copy.status.toAgree;

              return (
                <li key={id}>
                  <article className={`plan-checklist__item${completed ? " plan-checklist__item--completed" : ""}`}>
                    <span aria-hidden="true" className="plan-checklist__status">
                      {completed && <Check size={16} weight="bold" />}
                    </span>
                    <Icon aria-hidden="true" className="plan-checklist__icon" size={24} weight="regular" />
                    <span className="plan-checklist__copy">
                      <span className="plan-checklist__title">{task.title}</span>
                      <span className="type-caption plan-checklist__description">{task.description}</span>
                      <span className="plan-checklist__status-label">{status}</span>
                      {source ? (
                        <Link className="plan-checklist__source" href={source.href}>{source.label}</Link>
                      ) : (
                        <Button
                          className="plan-checklist__action"
                          onClick={() => savePlanTask(id, !completed)}
                          variant="secondary"
                        >
                          {completed ? copy.actions.markNotAgreed : copy.actions.markAgreed}
                        </Button>
                      )}
                    </span>
                  </article>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="plan-supplies-heading" className="plan-screen__supplies-section">
          <div className="plan-screen__section-heading">
            <h2 className="type-h2" id="plan-supplies-heading">{copy.suppliesBanner.heading}</h2>
            <p className="type-caption">{copy.suppliesBanner.description}</p>
          </div>
          <Link className="home-quick-link" href="/supplies">
            <Package aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
            <span className="home-quick-link__content">
              <span className="type-h3">{copy.suppliesBanner.actionTitle}</span>
              <span className="type-caption">{copy.suppliesBanner.actionDescription}</span>
            </span>
            <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
          </Link>
        </section>
      </div>
    </main>
  );
}
