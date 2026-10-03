"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import type { EmergencyContact } from "@/components/app/contacts";

export type EmergencyContactSheetProps = {
  contactToEdit?: EmergencyContact | null;
  onOpenChange: (open: boolean) => void;
  onSave: (contact: EmergencyContact) => void;
  open: boolean;
};

type FamilyCopy = ReturnType<typeof useLocalization>["messages"]["family"];

type EmergencyContactFormProps = {
  contactToEdit?: EmergencyContact | null;
  copy: FamilyCopy;
  onCancel: () => void;
  onSave: (contact: EmergencyContact) => void;
};

function EmergencyContactForm({
  contactToEdit,
  copy,
  onCancel,
  onSave,
}: EmergencyContactFormProps) {
  const presets = copy.contactRelationshipPresets;

  const relationshipOptions = useMemo(
    () => [
      { value: presets.closeRelative, label: presets.closeRelative },
      { value: presets.neighbor, label: presets.neighbor },
      { value: presets.outOfTown, label: presets.outOfTown },
      { value: presets.physician, label: presets.physician },
      { value: presets.other, label: presets.other },
    ],
    [presets],
  );

  const initialRelationship = contactToEdit?.relationship ?? presets.closeRelative;
  const isKnownPreset = relationshipOptions.some((opt) => opt.value === initialRelationship);

  const [name, setName] = useState(contactToEdit?.name ?? "");
  const [selectedPreset, setSelectedPreset] = useState(
    isKnownPreset ? initialRelationship : presets.other,
  );
  const [customRelationship, setCustomRelationship] = useState(
    isKnownPreset ? "" : (contactToEdit?.relationship ?? ""),
  );
  const [phone, setPhone] = useState(contactToEdit?.phone ?? "");
  const [altPhone, setAltPhone] = useState(contactToEdit?.altPhone ?? "");
  const [location, setLocation] = useState(contactToEdit?.location ?? "");
  const [isPrimary, setIsPrimary] = useState(contactToEdit?.isPrimary ?? false);

  const [errorName, setErrorName] = useState<string | undefined>();
  const [errorPhone, setErrorPhone] = useState<string | undefined>();

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();

    let hasError = false;
    if (!trimmedName) {
      setErrorName(copy.contactNameLabel);
      hasError = true;
    }
    if (!trimmedPhone) {
      setErrorPhone(copy.contactPhoneLabel);
      hasError = true;
    }

    if (hasError) return;

    const finalRelationship =
      selectedPreset === presets.other && customRelationship.trim()
        ? customRelationship.trim()
        : selectedPreset;

    const contactData: EmergencyContact = {
      id: contactToEdit ? contactToEdit.id : `contact-${Date.now()}`,
      name: trimmedName,
      relationship: finalRelationship,
      phone: trimmedPhone,
      altPhone: altPhone.trim() || undefined,
      location: location.trim() || undefined,
      isPrimary,
      createdAt: contactToEdit?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(contactData);
  }

  return (
    <form className="family-sheet-form" onSubmit={handleSubmit}>
      <TextField
        autoFocus
        error={errorName}
        label={copy.contactNameLabel}
        onChange={(e) => {
          setName(e.target.value);
          if (errorName) setErrorName(undefined);
        }}
        placeholder={copy.contactNamePlaceholder}
        required
        value={name}
      />

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <SelectField
          label={copy.contactRelationshipLabel}
          onChange={(e) => setSelectedPreset(e.target.value)}
          options={relationshipOptions}
          value={selectedPreset}
        />
        {selectedPreset === presets.other ? (
          <TextField
            label={copy.contactRelationshipLabel}
            onChange={(e) => setCustomRelationship(e.target.value)}
            placeholder={copy.contactRelationshipPlaceholder}
            value={customRelationship}
          />
        ) : (
          <TextField
            label={copy.contactLocationLabel}
            onChange={(e) => setLocation(e.target.value)}
            optional
            placeholder={copy.contactLocationPlaceholder}
            value={location}
          />
        )}
      </div>

      <div className="family-sheet-form__row family-sheet-form__row--two-col">
        <TextField
          error={errorPhone}
          label={copy.contactPhoneLabel}
          onChange={(e) => {
            setPhone(e.target.value);
            if (errorPhone) setErrorPhone(undefined);
          }}
          placeholder={copy.contactPhonePlaceholder}
          required
          type="tel"
          value={phone}
        />
        <TextField
          label={copy.contactAltPhoneLabel}
          onChange={(e) => setAltPhone(e.target.value)}
          optional
          placeholder={copy.contactAltPhonePlaceholder}
          type="tel"
          value={altPhone}
        />
      </div>

      {selectedPreset === presets.other && (
        <TextField
          label={copy.contactLocationLabel}
          onChange={(e) => setLocation(e.target.value)}
          optional
          placeholder={copy.contactLocationPlaceholder}
          value={location}
        />
      )}

      <div className="rounded-lg border border-[var(--border-subtle)] overflow-hidden">
        <label className="choice-option">
          <input
            checked={isPrimary}
            name="isPrimary"
            onChange={(e) => setIsPrimary(e.target.checked)}
            type="checkbox"
          />
          <div>
            <strong>{copy.contactPrimaryLabel}</strong>
            <small>{copy.contactPrimaryDescription}</small>
          </div>
        </label>
      </div>

      <div className="dialog__actions">
        <Button onClick={onCancel} type="button" variant="secondary">
          {copy.cancel}
        </Button>
        <Button type="submit">
          {contactToEdit ? copy.saveContact : copy.addContactSubmit}
        </Button>
      </div>
    </form>
  );
}

export function EmergencyContactSheet({
  contactToEdit,
  onOpenChange,
  onSave,
  open,
}: EmergencyContactSheetProps) {
  const { messages } = useLocalization();
  const copy = messages.family;

  return (
    <Dialog
      closeLabel={copy.cancel}
      description={contactToEdit ? undefined : copy.createContactDescription}
      onOpenChange={onOpenChange}
      open={open}
      title={contactToEdit ? copy.editContactTitle : copy.createContactTitle}
    >
      {open && (
        <EmergencyContactForm
          contactToEdit={contactToEdit}
          copy={copy}
          key={contactToEdit ? contactToEdit.id : "new-contact"}
          onCancel={() => onOpenChange(false)}
          onSave={(contact) => {
            onSave(contact);
            onOpenChange(false);
          }}
        />
      )}
    </Dialog>
  );
}
