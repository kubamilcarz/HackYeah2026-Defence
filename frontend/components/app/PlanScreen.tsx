"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import type { Icon } from "@phosphor-icons/react/lib";
import {
  ArrowRight,
  Backpack,
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
import {
  calculateBackpackProgress,
  deriveFamilyComposition,
  getBackpackServerSnapshot,
  getBackpackSnapshot,
  getCompiledFamilyItems,
  subscribeToBackpack,
} from "@/components/app/backpack";
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
import { generatePersonalizedPlan, type PlanActionTarget } from "@/lib/api";
import { getPersonalizedPlanServerSnapshot, getSavedPersonalizedPlan, householdFingerprint, savePersonalizedPlan, subscribeToPersonalizedPlan } from "@/components/app/personalized-plan";
import { Alert } from "@/components/ui/Alert";
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

const TARGET_HREFS: Record<PlanActionTarget, string> = {
  contacts: "/family", meetingPlace: "/plan/details", supportInformation: "/family/medical",
  waterAndFood: "/supplies", kitAndPower: "/supplies", rolesAndDocuments: "/plan/details",
  supplies: "/supplies", backpack: "/plan/backpack",
};

export function PlanScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.plan;
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportSections, setExportSections] = useState<PlanExportSection[]>(DEFAULT_PLAN_EXPORT_SECTIONS);
  const [exportStatus, setExportStatus] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState("");
  const contacts = useSyncExternalStore(subscribeToEmergencyContacts, getEmergencyContactsSnapshot, getEmergencyContactsServerSnapshot);
  const members = useSyncExternalStore(subscribeToMedicalProfiles, getMedicalProfilesSnapshot, getMedicalProfilesServerSnapshot);
  const medicalNotes = useSyncExternalStore(subscribeToMedicalNotes, getMedicalNotesSnapshot, getMedicalNotesServerSnapshot);
  const supplies = useSyncExternalStore(subscribeToSupplies, getSupplyItemsSnapshot, getSupplyItemsServerSnapshot);
  const emergencyPlan = useSyncExternalStore(subscribeToEmergencyPlan, getEmergencyPlanSnapshot, getEmergencyPlanServerSnapshot);
  const backpackState = useSyncExternalStore(subscribeToBackpack, getBackpackSnapshot, getBackpackServerSnapshot);
  const savedPersonalizedPlan = useSyncExternalStore(subscribeToPersonalizedPlan, getSavedPersonalizedPlan, getPersonalizedPlanServerSnapshot);
  const personalizedPlan = savedPersonalizedPlan?.plan ?? null;
  const planFingerprint = savedPersonalizedPlan?.fingerprint ?? "";
  const familyComposition = deriveFamilyComposition(members, backpackState.compositionOverride);
  const compiledBackpackItems = getCompiledFamilyItems(familyComposition, backpackState.packedItemIds, backpackState.customItems);
  const backpackProgress = calculateBackpackProgress(compiledBackpackItems);
  const totalPeople = familyComposition.adults + familyComposition.children + familyComposition.seniors;
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

  const householdSnapshot = (() => {
    const supportCounts = { allergies: 0, chronic_conditions: 0, medications: 0 };
    members.forEach((member) => {
      if (hasHealthDetails(member)) {
        if (!["", "-", "—", "none", "brak"].includes(member.allergies.trim().toLowerCase())) supportCounts.allergies += 1;
        if (!["", "-", "—", "none", "brak"].includes(member.chronicDiseases.trim().toLowerCase())) supportCounts.chronic_conditions += 1;
        if (!["", "-", "—", "none", "brak"].includes(member.medications.trim().toLowerCase())) supportCounts.medications += 1;
      }
    });
    const gaps = [...new Set(supplies.filter((item) => !isSupplyReady(item)).map((item) => item.category))];
    return {
      adults: familyComposition.adults, children: familyComposition.children, seniors: familyComposition.seniors,
      contacts_count: contacts.length, has_primary_contact: contacts.some((contact) => contact.isPrimary),
      has_primary_meeting_place: Boolean(emergencyPlan.primaryMeetingPlace.trim()),
      has_backup_meeting_place: Boolean(emergencyPlan.backupMeetingPlace.trim()),
      has_communication_plan: hasCommunicationPlan(emergencyPlan), has_roles_and_documents: hasRolesAndDocuments(emergencyPlan),
      health_support_counts: supportCounts,
      readiness: { completed: completedCount, total, missing: planTasks.filter((task) => !isComplete(task)).map((task) => task.id) },
      supply_gaps: gaps,
      backpack: { packed: backpackProgress.packed, total: backpackProgress.total },
    };
  })();
  const currentFingerprint = householdFingerprint(householdSnapshot);
  const isPlanOutdated = Boolean(personalizedPlan && planFingerprint !== currentFingerprint);

  async function createPersonalizedPlan() {
    setIsGeneratingPlan(true);
    setPlanError("");
    try {
      const result = await generatePersonalizedPlan({ locale, consent: true, household: householdSnapshot });
      savePersonalizedPlan({ plan: result, fingerprint: currentFingerprint });
    } catch {
      setPlanError(copy.personalized.unavailable);
    } finally {
      setIsGeneratingPlan(false);
    }
  }

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

        <section aria-labelledby="personalized-plan-heading" className="plan-screen__checklist-section">
          <div className="plan-screen__section-heading">
            <h2 className="type-h2" id="personalized-plan-heading">{copy.personalized.heading}</h2>
            <p className="type-caption">{copy.personalized.description}</p>
          </div>
          <Alert description={copy.personalized.official} title={copy.personalized.heading} variant="info" />
          {!personalizedPlan ? (
<<<<<<< HEAD
            <div className="personalized-plan__empty">
              <div>
                <p className="type-h3">{copy.personalized.heading}</p>
                <p className="type-body">{copy.personalized.consent}</p>
              </div>
              <Button disabled={isGeneratingPlan} onClick={createPersonalizedPlan}>{isGeneratingPlan ? copy.personalized.generating : copy.personalized.generate}</Button>
            </div>
          ) : (
            <div className="personalized-plan">
              <header className="personalized-plan__hero">
                <div className="personalized-plan__meta">
                  <span className="badge badge--info">{copy.personalized.generated}</span>
                  <p className="type-caption">{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(personalizedPlan.generated_at))}</p>
                </div>
                <h3 className="type-h2">{personalizedPlan.title}</h3>
                <p className="type-body">{personalizedPlan.summary}</p>
              </header>
              {isPlanOutdated && <Alert description={copy.personalized.outdated} title={copy.personalized.heading} variant="warning" />}
              {planError && <Alert description={planError} title={copy.personalized.heading} variant="warning" />}

              <section aria-labelledby="personalized-priorities-heading" className="personalized-plan__block">
                <h3 className="type-h3" id="personalized-priorities-heading">{copy.personalized.priorities}</h3>
                <ol className="personalized-plan__priorities">
                  {personalizedPlan.priorities.map((action, index) => (
                    <li key={action.id}>
                      <Link className="personalized-plan__action" href={TARGET_HREFS[action.target]}>
                        <span aria-hidden="true" className="personalized-plan__number">{index + 1}</span>
                        <span className="personalized-plan__action-copy"><span className="type-h3">{action.title}</span><span className="type-caption">{action.detail}</span></span>
                        <span className="personalized-plan__open">{copy.personalized.open} <ArrowRight aria-hidden="true" size={16} weight="bold" /></span>
                      </Link>
                    </li>
                  ))}
                </ol>
              </section>

              <div className="personalized-plan__sections">
                {personalizedPlan.sections.map((section) => (
                  <section className="personalized-plan__section" key={section.id}>
                    <h3 className="type-h3">{section.title}</h3>
                    <ul>
                      {section.actions.map((action) => <li key={action.id}><Link href={TARGET_HREFS[action.target]}><strong>{action.title}</strong><span>{action.detail}</span></Link></li>)}
                    </ul>
                  </section>
                ))}
              </div>

              <section aria-labelledby="personalized-questions-heading" className="personalized-plan__questions">
                <h3 className="type-h3" id="personalized-questions-heading">{copy.personalized.questions}</h3>
                <ul>{personalizedPlan.questions_to_resolve.map((question) => <li key={question} className="type-body">{question}</li>)}</ul>
              </section>
              <div className="personalized-plan__footer"><Button disabled={isGeneratingPlan} onClick={createPersonalizedPlan} variant="secondary">{isGeneratingPlan ? copy.personalized.generating : copy.personalized.refresh}</Button></div>
=======
            <div className="plan-next-step">
              <p className="type-body">{copy.personalized.consent}</p>
              <Button disabled={isGeneratingPlan} onClick={createPersonalizedPlan}>{isGeneratingPlan ? copy.personalized.generating : copy.personalized.generate}</Button>
            </div>
          ) : (
            <div className="plan-next-step">
              <div className="plan-screen__section-heading">
                <p className="type-caption">{copy.personalized.generated}: {new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(personalizedPlan.generated_at))}</p>
                {isPlanOutdated && <Alert description={copy.personalized.outdated} title={copy.personalized.heading} variant="warning" />}
                {planError && <Alert description={planError} title={copy.personalized.heading} variant="warning" />}
              </div>
              <h3 className="type-h3">{personalizedPlan.title}</h3>
              <p className="type-body">{personalizedPlan.summary}</p>
              <h3 className="type-h3">{copy.personalized.priorities}</h3>
              <ol className="plan-checklist">
                {personalizedPlan.priorities.map((action) => <li key={action.id}><article className="plan-checklist__item"><span className="plan-checklist__copy"><span className="plan-checklist__title">{action.title}</span><span className="type-caption plan-checklist__description">{action.detail}</span><Link className="plan-checklist__source" href={TARGET_HREFS[action.target]}>{copy.personalized.open}</Link></span></article></li>)}
              </ol>
              {personalizedPlan.sections.map((section) => <section key={section.id}><h3 className="type-h3">{section.title}</h3><ul className="plan-checklist">{section.actions.map((action) => <li key={action.id}><Link className="plan-checklist__source" href={TARGET_HREFS[action.target]}>{action.title}: {action.detail}</Link></li>)}</ul></section>)}
              <h3 className="type-h3">{copy.personalized.questions}</h3>
              <ul>{personalizedPlan.questions_to_resolve.map((question) => <li key={question} className="type-body">{question}</li>)}</ul>
              <Button disabled={isGeneratingPlan} onClick={createPersonalizedPlan} variant="secondary">{isGeneratingPlan ? copy.personalized.generating : copy.personalized.refresh}</Button>
>>>>>>> origin/main
            </div>
          )}
          {!personalizedPlan && planError && <Alert description={planError} title={copy.personalized.heading} variant="warning" />}
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

        <section aria-labelledby="plan-backpack-heading" className="plan-screen__backpack-section">
          <div className="plan-screen__section-heading">
            <h2 className="type-h2" id="plan-backpack-heading">{copy.backpackBanner.heading}</h2>
            <p className="type-caption">{copy.backpackBanner.description}</p>
          </div>
          <Link className="home-quick-link" href="/plan/backpack">
            <Backpack aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
            <span className="home-quick-link__content">
              <span className="flex items-center gap-2">
                <span className="type-h3">{copy.backpackBanner.actionTitle}</span>
                <span className="badge badge--success">
                  {copy.backpackBanner.packedBadge
                    .replace("{packed}", String(backpackProgress.packed))
                    .replace("{total}", String(backpackProgress.total))}
                </span>
              </span>
              <span className="type-caption">
                {copy.backpackBanner.actionDescription.replace("{peopleCount}", String(totalPeople))}
              </span>
            </span>
            <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
          </Link>
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
