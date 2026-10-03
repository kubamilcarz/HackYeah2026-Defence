"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { DateField, SelectField, TextField } from "@/components/ui/FormControls";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  calculateAgeFromBirthDate,
  type MedicalProfile,
} from "@/components/app/medical";

export type FamilyMemberSheetProps = {
  defaultRelationship?: string;
  memberToEdit?: MedicalProfile | null;
  onOpenChange: (open: boolean) => void;
  onSave: (profile: MedicalProfile) => void;
  open: boolean;
};

const BLOOD_TYPE_OPTIONS = [
  { value: "", label: "—" },
  { value: "0 Rh+", label: "0 Rh+" },
  { value: "0 Rh-", label: "0 Rh-" },
  { value: "A Rh+", label: "A Rh+" },
  { value: "A Rh-", label: "A Rh-" },
  { value: "B Rh+", label: "B Rh+" },
  { value: "B Rh-", label: "B Rh-" },
  { value: "AB Rh+", label: "AB Rh+" },
  { value: "AB Rh-", label: "AB Rh-" },
  { value: "Nieznana", label: "Nieznana / Unknown" },
];

type FamilyCopy = ReturnType<typeof useLocalization>["messages"]["family"];

type FamilyMemberFormProps = {
  copy: FamilyCopy;
  defaultRelationship?: string;
  memberToEdit?: MedicalProfile | null;
  onCancel: () => void;
  onSave: (profile: MedicalProfile) => void;
};

function FamilyMemberForm({
  copy,
  defaultRelationship,
  memberToEdit,
  onCancel,
  onSave,
}: FamilyMemberFormProps) {
  const relationshipOptions = useMemo(
    () => [
      { value: copy.relationshipOptions.me, label: copy.relationshipOptions.me },
      { value: copy.relationshipOptions.partner, label: copy.relationshipOptions.partner },
      { value: copy.relationshipOptions.child, label: copy.relationshipOptions.child },
      { value: copy.relationshipOptions.parent, label: copy.relationshipOptions.parent },
      { value: copy.relationshipOptions.grandparent, label: copy.relationshipOptions.grandparent },
      { value: copy.relationshipOptions.other, label: copy.relationshipOptions.other },
    ],
    [copy.relationshipOptions],
  );

  const [fullName, setFullName] = useState(memberToEdit?.fullName ?? "");
  const [relationship, setRelationship] = useState(
    memberToEdit?.relationship ?? defaultRelationship ?? relationshipOptions[0].value,
  );
  const [birthDate, setBirthDate] = useState(memberToEdit?.birthDate ?? "");
  const [age, setAge] = useState(
    memberToEdit?.age !== undefined ? String(memberToEdit.age) : "",
  );
  const [bloodType, setBloodType] = useState(memberToEdit?.bloodType ?? "");
  const [phone, setPhone] = useState(memberToEdit?.phone ?? "");
  const [allergies, setAllergies] = useState(memberToEdit?.allergies ?? "");
  const [chronicDiseases, setChronicDiseases] = useState(
    memberToEdit?.chronicDiseases ?? "",
  );
  const [medications, setMedications] = useState(memberToEdit?.medications ?? "");
  const [additionalInfo, setAdditionalInfo] = useState(
    memberToEdit?.additionalInfo ?? "",
  );
  const [errorName, setErrorName] = useState<string | undefined>();

  function handleBirthDateChange(value: string) {
    setBirthDate(value);
    const calculated = calculateAgeFromBirthDate(value);
    if (calculated > 0) {
      setAge(String(calculated));
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = fullName.trim();
    if (!trimmedName) {
      setErrorName("To pole jest wymagane / Full name is required");
      return;
    }

    const calculatedAge = age ? parseInt(age, 10) : calculateAgeFromBirthDate(birthDate);

    const profileData: MedicalProfile = {
      id: memberToEdit ? memberToEdit.id : `member-${Date.now()}`,
      fullName: trimmedName,
      relationship: relationship.trim() || relationshipOptions[1].value,
      birthDate: birthDate.trim() || "",
      age: isNaN(calculatedAge) ? 0 : calculatedAge,
      bloodType: bloodType.trim() || copy.bloodTypeUnknown,
      allergies: allergies.trim() || copy.none || "Brak",
      chronicDiseases: chronicDiseases.trim() || copy.none || "Brak",
      medications: medications.trim() || copy.none || "Brak",
      additionalInfo: additionalInfo.trim() || "",
      phone: phone.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSave(profileData);
  }

  return (
    <form className="family-sheet-form" onSubmit={handleSubmit}>
      <TextField
        autoFocus
        error={errorName}
        label={copy.fullNameLabel}
        onChange={(e) => {
          setFullName(e.target.value);
          if (errorName) setErrorName(undefined);
        }}
        placeholder={copy.fullNamePlaceholder}
        required
        value={fullName}
      />

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <SelectField
          label={copy.relationshipLabel}
          onChange={(e) => setRelationship(e.target.value)}
          options={relationshipOptions}
          value={relationship}
        />
        <TextField
          label={copy.phoneLabel}
          onChange={(e) => setPhone(e.target.value)}
          optional
          placeholder={copy.phonePlaceholder}
          type="tel"
          value={phone}
        />
      </div>

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <DateField
          label={copy.birthDateLabel}
          onChange={(e) => handleBirthDateChange(e.target.value)}
          optional
          value={birthDate}
        />
        <TextField
          inputMode="numeric"
          label={copy.ageLabel}
          max="130"
          min="0"
          onChange={(e) => setAge(e.target.value)}
          optional
          type="number"
          value={age}
        />
      </div>

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <SelectField
          label={copy.bloodTypeLabel}
          onChange={(e) => setBloodType(e.target.value)}
          options={BLOOD_TYPE_OPTIONS}
          value={bloodType}
        />
        <TextField
          label={copy.allergiesLabel}
          onChange={(e) => setAllergies(e.target.value)}
          optional
          placeholder={copy.allergiesPlaceholder}
          value={allergies}
        />
      </div>

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <TextField
          label={copy.chronicDiseasesLabel}
          onChange={(e) => setChronicDiseases(e.target.value)}
          optional
          placeholder={copy.chronicDiseasesPlaceholder}
          value={chronicDiseases}
        />
        <TextField
          label={copy.medicationsLabel}
          onChange={(e) => setMedications(e.target.value)}
          optional
          placeholder={copy.medicationsPlaceholder}
          value={medications}
        />
      </div>

      <TextField
        label={copy.additionalInfoLabel}
        onChange={(e) => setAdditionalInfo(e.target.value)}
        optional
        placeholder={copy.additionalInfoPlaceholder}
        value={additionalInfo}
      />

      <div className="dialog__actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          {copy.cancel}
        </Button>
        <Button type="submit">
          {memberToEdit ? copy.savePerson : copy.addPersonSubmit}
        </Button>
      </div>
    </form>
  );
}

export function FamilyMemberSheet({
  defaultRelationship,
  memberToEdit,
  onOpenChange,
  onSave,
  open,
}: FamilyMemberSheetProps) {
  const { messages } = useLocalization();
  const copy = messages.family;

  return (
    <Dialog
      closeLabel={copy.cancel}
      description={memberToEdit ? undefined : copy.createPersonDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={memberToEdit ? copy.editPersonTitle : copy.createPersonTitle}
    >
      {open && (
        <FamilyMemberForm
          copy={copy}
          defaultRelationship={defaultRelationship}
          key={memberToEdit ? memberToEdit.id : (defaultRelationship ?? "new")}
          memberToEdit={memberToEdit}
          onCancel={() => onOpenChange(false)}
          onSave={(profile) => {
            onSave(profile);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}
