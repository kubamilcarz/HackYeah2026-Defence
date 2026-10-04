"use client";

import { useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { TextField } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import {
  EMPTY_EMERGENCY_PLAN,
  getEmergencyPlanServerSnapshot,
  getEmergencyPlanSnapshot,
  saveEmergencyPlan,
  subscribeToEmergencyPlan,
  type EmergencyPlan,
} from "@/components/app/emergency-plan";
import { useLocalization } from "@/components/localization/LocalizationProvider";

function planDraft(plan: EmergencyPlan) {
  const { updatedAt: _updatedAt, ...draft } = plan;
  return draft;
}

export function EmergencyPlanDetailsScreen() {
  const savedPlan = useSyncExternalStore(subscribeToEmergencyPlan, getEmergencyPlanSnapshot, getEmergencyPlanServerSnapshot);
  const [showSaveFeedback, setShowSaveFeedback] = useState(false);

  return (
    <EmergencyPlanDetailsForm
      key={savedPlan.updatedAt ?? "empty"}
      onChange={() => setShowSaveFeedback(false)}
      onSaved={() => setShowSaveFeedback(true)}
      savedPlan={savedPlan}
      showSaveFeedback={showSaveFeedback}
    />
  );
}

function EmergencyPlanDetailsForm({
  onChange,
  onSaved,
  savedPlan,
  showSaveFeedback,
}: {
  onChange: () => void;
  onSaved: () => void;
  savedPlan: EmergencyPlan;
  showSaveFeedback: boolean;
}) {
  const { messages } = useLocalization();
  const copy = messages.plan.details;
  const [draft, setDraft] = useState(() => planDraft(savedPlan));

  function update(field: keyof typeof draft, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
    onChange();
  }

  function save() {
    saveEmergencyPlan(draft);
    onSaved();
  }

  return (
    <main className="emergency-plan-details">
      <PageNavigationBar backHref="/plan" backLabel={copy.backLabel} title={copy.title} />
      <div className="emergency-plan-details__content">
        <header className="emergency-plan-details__intro">
          <h1 className="type-h1">{copy.heading}</h1>
          <p className="type-body">{copy.description}</p>
        </header>

        <form className="emergency-plan-details__form" onSubmit={(event) => { event.preventDefault(); save(); }}>
          <section aria-labelledby="meeting-places-heading" className="emergency-plan-details__section">
            <h2 className="type-h2" id="meeting-places-heading">{copy.meetingPlaces.heading}</h2>
            <p className="type-caption">{copy.meetingPlaces.description}</p>
            <TextField label={copy.meetingPlaces.primaryLabel} onChange={(event) => update("primaryMeetingPlace", event.target.value)} placeholder={copy.meetingPlaces.primaryPlaceholder} value={draft.primaryMeetingPlace} />
            <TextField label={copy.meetingPlaces.backupLabel} onChange={(event) => update("backupMeetingPlace", event.target.value)} placeholder={copy.meetingPlaces.backupPlaceholder} value={draft.backupMeetingPlace} />
            {showSaveFeedback && draft.primaryMeetingPlace && draft.backupMeetingPlace && (
              <Alert description={copy.meetingPlaces.savedDescription} title={copy.meetingPlaces.savedTitle} variant="success" />
            )}
          </section>

          <section aria-labelledby="roles-heading" className="emergency-plan-details__section">
            <h2 className="type-h2" id="roles-heading">{copy.roles.heading}</h2>
            <p className="type-caption">{copy.roles.description}</p>
            <label className="field" htmlFor="family-roles">
              <span className="field__label">{copy.roles.label}</span>
              <textarea className="control-input emergency-plan-details__textarea" id="family-roles" onChange={(event) => update("familyRoles", event.target.value)} placeholder={copy.roles.placeholder} rows={4} value={draft.familyRoles} />
            </label>
          </section>

          <section aria-labelledby="documents-heading" className="emergency-plan-details__section">
            <h2 className="type-h2" id="documents-heading">{copy.documents.heading}</h2>
            <p className="type-caption">{copy.documents.description}</p>
            <TextField label={copy.documents.label} onChange={(event) => update("documentsLocation", event.target.value)} placeholder={copy.documents.placeholder} value={draft.documentsLocation} />
          </section>

          <section aria-labelledby="communication-heading" className="emergency-plan-details__section">
            <h2 className="type-h2" id="communication-heading">{copy.communication.heading}</h2>
            <p className="type-caption">{copy.communication.description}</p>
            <label className="field" htmlFor="communication-plan">
              <span className="field__label">{copy.communication.label}</span>
              <textarea className="control-input emergency-plan-details__textarea" id="communication-plan" onChange={(event) => update("communicationPlan", event.target.value)} placeholder={copy.communication.placeholder} rows={5} value={draft.communicationPlan} />
            </label>
          </section>

          <div className="emergency-plan-details__actions">
            <Button type="submit">{copy.save}</Button>
            {showSaveFeedback && <p aria-live="polite" className="type-caption" role="status">{copy.saved}</p>}
          </div>
        </form>
      </div>
    </main>
  );
}
