"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Drop,
  FlowerTulip,
  SuitcaseSimple,
  Pill,
  Warning,
} from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TextField } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  DEFAULT_MEDICAL_PROFILE,
  getInitials,
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  saveMedicalProfile,
  subscribeToMedicalProfiles,
  type MedicalProfile,
} from "@/components/app/medical";

export type MedicalInfoScreenProps = {
  memberId?: string;
};

export function MedicalInfoScreen({ memberId }: MedicalInfoScreenProps) {
  const { messages } = useLocalization();
  const copy = messages.medicalInfo;

  const profiles = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot
  );

  const profile = useMemo(() => {
    if (!memberId) return profiles[0] ?? DEFAULT_MEDICAL_PROFILE;
    return profiles.find((p) => p.id === memberId) ?? profiles[0] ?? DEFAULT_MEDICAL_PROFILE;
  }, [profiles, memberId]);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<MedicalProfile>(profile);

  const handleOpenEdit = () => {
    setFormData(profile);
    setIsEditing(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveMedicalProfile(formData);
    setIsEditing(false);
  };

  const initials = getInitials(profile.fullName);
  const ageLabel = copy.age.replace("{age}", String(profile.age));

  return (
    <main className="medical-page">
      <PageNavigationBar
        backHref="/family"
        backLabel={copy.backLabel}
        textAction={{
          label: copy.edit,
          onClick: handleOpenEdit,
        }}
        title={copy.title}
      />

      <div className="medical-page__content">
        <h1 className="sr-only">{copy.title} - {profile.fullName}</h1>

        <section aria-label={profile.fullName} className="medical-card">
          {/* Person Header */}
          <div className="medical-profile-header">
            <div aria-hidden="true" className="medical-avatar">
              <span className="medical-avatar__text">{initials}</span>
            </div>
            <div className="medical-profile-info">
              <h2 className="medical-profile-name">{profile.fullName}</h2>
              <p className="medical-profile-subtitle">
                {ageLabel} &middot; {profile.birthDate}
              </p>
            </div>
          </div>

          <div aria-hidden="true" className="medical-divider" />

          {/* Medical Info Rows */}
          <ul className="medical-info-list" role="list">
            {/* Grupa krwi / Blood type */}
            <li className="medical-info-row">
              <div aria-hidden="true" className="medical-info-row__icon-wrap">
                <Drop className="medical-info-row__icon" size={24} weight="bold" />
              </div>
              <div className="medical-info-row__content">
                <span className="medical-info-row__label">{copy.bloodType}</span>
                <span className="medical-info-row__value font-semibold">
                  {profile.bloodType || copy.none}
                </span>
              </div>
            </li>

            {/* Alergie / Allergies */}
            <li className="medical-info-row">
              <div aria-hidden="true" className="medical-info-row__icon-wrap">
                <FlowerTulip className="medical-info-row__icon" size={24} weight="bold" />
              </div>
              <div className="medical-info-row__content">
                <span className="medical-info-row__label">{copy.allergies}</span>
                <span className="medical-info-row__value font-semibold">
                  {profile.allergies || copy.none}
                </span>
              </div>
            </li>

            {/* Choroby przewlekłe / Chronic diseases */}
            <li className="medical-info-row">
              <div aria-hidden="true" className="medical-info-row__icon-wrap">
                <SuitcaseSimple className="medical-info-row__icon" size={24} weight="bold" />
              </div>
              <div className="medical-info-row__content">
                <span className="medical-info-row__label">{copy.chronicDiseases}</span>
                <span className="medical-info-row__value">
                  {profile.chronicDiseases || copy.none}
                </span>
              </div>
            </li>

            {/* Przyjmowane leki / Medications */}
            <li className="medical-info-row">
              <div aria-hidden="true" className="medical-info-row__icon-wrap">
                <Pill className="medical-info-row__icon" size={24} weight="bold" />
              </div>
              <div className="medical-info-row__content">
                <span className="medical-info-row__label">{copy.medications}</span>
                <span className="medical-info-row__value">
                  {profile.medications || copy.none}
                </span>
              </div>
            </li>

            {/* Dodatkowe informacje / Additional info */}
            <li className="medical-info-row">
              <div aria-hidden="true" className="medical-info-row__icon-wrap">
                <Warning className="medical-info-row__icon" size={24} weight="fill" />
              </div>
              <div className="medical-info-row__content">
                <span className="medical-info-row__label">{copy.additionalInfo}</span>
                <div className="medical-info-row__value whitespace-pre-line">
                  {profile.additionalInfo || copy.none}
                </div>
              </div>
            </li>
          </ul>
        </section>
      </div>

      {/* Edit Dialog */}
      <Dialog
        closeLabel={copy.cancel}
        description={copy.editTitle}
        onOpenChange={setIsEditing}
        open={isEditing}
        title={copy.editTitle}
      >
        <form className="medical-edit-form" onSubmit={handleSave}>
          <TextField
            label={copy.fullName}
            onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
            required
            value={formData.fullName}
          />
          <TextField
            label={copy.birthDate}
            onChange={(e) => setFormData((prev) => ({ ...prev, birthDate: e.target.value }))}
            value={formData.birthDate}
          />
          <TextField
            label={copy.bloodType}
            onChange={(e) => setFormData((prev) => ({ ...prev, bloodType: e.target.value }))}
            value={formData.bloodType}
          />
          <TextField
            label={copy.allergies}
            onChange={(e) => setFormData((prev) => ({ ...prev, allergies: e.target.value }))}
            value={formData.allergies}
          />
          <TextField
            label={copy.chronicDiseases}
            onChange={(e) => setFormData((prev) => ({ ...prev, chronicDiseases: e.target.value }))}
            value={formData.chronicDiseases}
          />
          <TextField
            label={copy.medications}
            onChange={(e) => setFormData((prev) => ({ ...prev, medications: e.target.value }))}
            value={formData.medications}
          />
          <div className="field">
            <label className="field__label" htmlFor="medical-additional-info">
              {copy.additionalInfo}
            </label>
            <textarea
              className="control-input min-h-[5rem] py-2"
              id="medical-additional-info"
              onChange={(e) => setFormData((prev) => ({ ...prev, additionalInfo: e.target.value }))}
              rows={3}
              value={formData.additionalInfo}
            />
          </div>

          <div className="medical-edit-form__actions">
            <Button
              onClick={() => setIsEditing(false)}
              type="button"
              variant="secondary"
            >
              {copy.cancel}
            </Button>
            <Button type="submit" variant="primary">
              {copy.save}
            </Button>
          </div>
        </form>
      </Dialog>
    </main>
  );
}
