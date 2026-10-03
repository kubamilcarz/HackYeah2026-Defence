"use client";

import Link from "next/link";
import { useState } from "react";
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

type PlanTaskId = "contacts" | "meetingPlace" | "supportInformation" | "waterAndFood" | "kitAndPower" | "rolesAndDocuments";

const planTasks: { icon: Icon; id: PlanTaskId; initiallyComplete: boolean }[] = [
  { id: "contacts", icon: Phone, initiallyComplete: true },
  { id: "meetingPlace", icon: MapPin, initiallyComplete: true },
  { id: "supportInformation", icon: FirstAidKit, initiallyComplete: false },
  { id: "waterAndFood", icon: Drop, initiallyComplete: false },
  { id: "kitAndPower", icon: Flashlight, initiallyComplete: false },
  { id: "rolesAndDocuments", icon: FileText, initiallyComplete: false },
];

function replaceValues(message: string, values: Record<string, number>) {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replace(`{${key}}`, String(value)),
    message,
  );
}

export function PlanScreen() {
  const { messages } = useLocalization();
  const copy = messages.plan;
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<PlanTaskId>>(
    () => new Set(planTasks.filter(({ initiallyComplete }) => initiallyComplete).map(({ id }) => id)),
  );
  const completedCount = completedTaskIds.size;
  const total = planTasks.length;
  const percentage = Math.round((completedCount / total) * 100);

  const progressMessage = completedCount === 0
    ? copy.progress.notStarted
    : completedCount === total
      ? copy.progress.complete
      : replaceValues(copy.progress.inProgress, { completed: completedCount, total });

  function toggleTask(taskId: PlanTaskId, checked: boolean) {
    setCompletedTaskIds((current) => {
      const next = new Set(current);
      if (checked) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }

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

        <section aria-labelledby="plan-checklist-heading" className="plan-screen__checklist-section">
          <div className="plan-screen__section-heading">
            <h2 className="type-h2" id="plan-checklist-heading">{copy.checklist}</h2>
            <p className="type-caption">{copy.checklistDescription}</p>
          </div>
          <ul className="plan-checklist">
            {planTasks.map(({ icon: Icon, id }) => {
              const task = copy.tasks[id];
              const isComplete = completedTaskIds.has(id);

              return (
                <li key={id}>
                  <label className={`plan-checklist__item${isComplete ? " plan-checklist__item--completed" : ""}`}>
                    <input
                      checked={isComplete}
                      className="plan-checklist__checkbox"
                      onChange={(event) => toggleTask(id, event.target.checked)}
                      type="checkbox"
                    />
                    <span aria-hidden="true" className="plan-checklist__status">
                      {isComplete && <Check size={16} weight="bold" />}
                    </span>
                    <Icon aria-hidden="true" className="plan-checklist__icon" size={24} weight="regular" />
                    <span className="plan-checklist__copy">
                      <span className="plan-checklist__title">{task.title}</span>
                      <span className="type-caption plan-checklist__description">{task.description}</span>
                    </span>
                  </label>
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
