"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
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
  FloppyDisk,
  Printer,
} from "@phosphor-icons/react/ssr";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { CheckboxGroup } from "@/components/ui/FormControls";
import { CircularProgress } from "@/components/ui/Progress";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import {
  getEmergencyContactsServerSnapshot,
  getEmergencyContactsSnapshot,
  subscribeToEmergencyContacts,
} from "@/components/app/contacts";
import {
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  getMedicalNotesServerSnapshot,
  getMedicalNotesSnapshot,
  subscribeToMedicalNotes,
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
import type { PlanTaskId } from "@/components/app/plan";
import {
  getEmergencyPlanServerSnapshot,
  getEmergencyPlanSnapshot,
  hasCommunicationPlan,
  hasMeetingPlaces,
  hasRolesAndDocuments,
  subscribeToEmergencyPlan,
} from "@/components/app/emergency-plan";
import {
  DEFAULT_PLAN_EXPORT_SECTIONS,
  exportPlanPdf,
  PLAN_EXPORT_SECTIONS,
  type PlanExportAction,
  type PlanExportSection,
} from "@/components/app/exportPlanPdf";

type CompletionSource = "data";

const planTasks: { icon: Icon; id: PlanTaskId; source: CompletionSource }[] = [
  { id: "contacts", icon: Phone, source: "data" },
  { id: "meetingPlace", icon: MapPin, source: "data" },
  { id: "supportInformation", icon: FirstAidKit, source: "data" },
  { id: "waterAndFood", icon: Drop, source: "data" },
  { id: "kitAndPower", icon: Flashlight, source: "data" },
  { id: "rolesAndDocuments", icon: FileText, source: "data" },
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
  const { locale, messages } = useLocalization();
  const copy = messages.plan;
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSections, setExportSections] = useState<PlanExportSection[]>(DEFAULT_PLAN_EXPORT_SECTIONS);
  const [exportStatus, setExportStatus] = useState("");
  const contacts = useSyncExternalStore(subscribeToEmergencyContacts, getEmergencyContactsSnapshot, getEmergencyContactsServerSnapshot);
  const members = useSyncExternalStore(subscribeToMedicalProfiles, getMedicalProfilesSnapshot, getMedicalProfilesServerSnapshot);
  const medicalNotes = useSyncExternalStore(subscribeToMedicalNotes, getMedicalNotesSnapshot, getMedicalNotesServerSnapshot);
  const supplies = useSyncExternalStore(subscribeToSupplies, getSupplyItemsSnapshot, getSupplyItemsServerSnapshot);
  const emergencyPlan = useSyncExternalStore(subscribeToEmergencyPlan, getEmergencyPlanSnapshot, getEmergencyPlanServerSnapshot);
  const dataCompletion: Record<PlanTaskId, boolean> = {
    contacts: contacts.length > 0 && hasCommunicationPlan(emergencyPlan),
    meetingPlace: hasMeetingPlaces(emergencyPlan),
    supportInformation: members.some(hasHealthDetails),
    waterAndFood: categoryIsReady(supplies, ["water-food"]),
    kitAndPower: categoryIsReady(supplies, ["health", "power-light"]),
    rolesAndDocuments: hasRolesAndDocuments(emergencyPlan),
  };
  const isComplete = (task: (typeof planTasks)[number]) => dataCompletion[task.id];
  const completedCount = planTasks.filter(isComplete).length;
  const total = planTasks.length;
  const percentage = Math.round((completedCount / total) * 100);
  const nextTask = planTasks.find((task) => !isComplete(task));
  const sourceForTask = (id: PlanTaskId) => id === "contacts" && contacts.length > 0
    ? copy.sources.communication
    : copy.sources[id];

  const progressMessage = completedCount === 0
    ? copy.progress.notStarted
    : completedCount === total
      ? copy.progress.complete
      : replaceValues(copy.progress.inProgress, { completed: completedCount, total });

  function exportPdf(action: PlanExportAction) {
    try {
      exportPlanPdf({
        action,
        contacts,
        copy: copy.export.pdf,
        emergencyPlan,
        locale,
        medicalNotes,
        medicalProfiles: members,
        readiness: { complete: completedCount, total },
        sections: exportSections,
        supplies,
      });
      setExportStatus(action === "print" ? copy.export.printStarted : copy.export.success);
      setExportDialogOpen(false);
    } catch {
      setExportStatus(copy.export.error);
    }
  }

  const exportOptions = PLAN_EXPORT_SECTIONS.map((section) => ({
    description: copy.export.options[section].description,
    label: copy.export.options[section].label,
    value: section,
  }));

  return (
    <main className="plan-screen">
      <PageNavigationBar action={{ icon: FloppyDisk, label: copy.export.action, onClick: () => setExportDialogOpen(true) }} title={copy.title} />
      <div className="plan-screen__content">
        <h1 className="sr-only">{copy.title}</h1>
        <p aria-live="polite" className="sr-only" role="status">{exportStatus}</p>

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
          const source = sourceForTask(nextTask.id);
          return (
            <section aria-labelledby="plan-next-step-heading" className="plan-next-step">
              <p className="type-caption plan-next-step__eyebrow">{copy.nextStep.eyebrow}</p>
              <h2 className="type-h2" id="plan-next-step-heading">{task.title}</h2>
              <p className="type-body">{task.description}</p>
              <Link className="button button--primary" href={source.href}>{source.label}</Link>
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
              const source = sourceForTask(id);
              const status = completed
                ? copy.status.ready
                : copy.status.needsInformation;

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
                      <Link className="plan-checklist__source" href={source.href}>{source.label}</Link>
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
      <Dialog
        closeLabel={copy.export.close}
        description={copy.export.description}
        onOpenChange={setExportDialogOpen}
        open={exportDialogOpen}
        title={copy.export.title}
      >
        <CheckboxGroup
          helperText={copy.export.helper}
          label={copy.export.chooseSections}
          name="plan-export-sections"
          onValueChange={(values) => setExportSections(values.filter((value): value is PlanExportSection => PLAN_EXPORT_SECTIONS.includes(value as PlanExportSection)))}
          options={exportOptions}
          value={exportSections}
        />
        <div className="dialog__actions">
          <Button disabled={exportSections.length === 0} leadingIcon={FloppyDisk} onClick={() => exportPdf("download")}>{copy.export.download}</Button>
          <Button disabled={exportSections.length === 0} leadingIcon={Printer} onClick={() => exportPdf("print")} variant="secondary">{copy.export.print}</Button>
        </div>
      </Dialog>
    </main>
  );
}
