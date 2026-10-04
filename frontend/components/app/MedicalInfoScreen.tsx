"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Drop,
  FlowerTulip,
  SuitcaseSimple,
  Pill,
  Warning,
  Plus,
  NotePencil,
  Trash,
  Notebook,
  Package,
} from "@phosphor-icons/react/ssr";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { SelectField, TextField } from "@/components/ui/FormControls";
import { Tag } from "@/components/ui/Tag";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  deleteMedicalNote,
  getInitials,
  getMedicalNotesServerSnapshot,
  getMedicalNotesSnapshot,
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  saveMedicalNote,
  saveMedicalProfile,
  subscribeToMedicalNotes,
  subscribeToMedicalProfiles,
  type MedicalNote,
  type MedicalProfile,
} from "@/components/app/medical";
import {
  getSuppliesServerSnapshot,
  getSuppliesSnapshot,
  subscribeToSupplies,
  supplyIssues,
} from "@/components/app/supplies";

export type MedicalInfoScreenProps = {
  memberId?: string;
  initialAddNoteOpen?: boolean;
};

export function MedicalInfoScreen({
  memberId,
  initialAddNoteOpen = false,
}: MedicalInfoScreenProps) {
  const { messages } = useLocalization();
  const copy = messages.medicalInfo;

  const profiles = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot
  );

  const allNotes = useSyncExternalStore(
    subscribeToMedicalNotes,
    getMedicalNotesSnapshot,
    getMedicalNotesServerSnapshot
  );

  const profile = useMemo(() => {
    if (!memberId) return profiles[0];
    return profiles.find((p) => p.id === memberId) ?? profiles[0];
  }, [profiles, memberId]);

  const emptyProfile: MedicalProfile = {
    id: "",
    fullName: "",
    birthDate: "",
    age: 0,
    bloodType: "",
    allergies: "",
    chronicDiseases: "",
    medications: "",
    additionalInfo: "",
    updatedAt: "",
  };
  const selectedProfile = profile ?? emptyProfile;

  const memberNotes = useMemo(() => {
    return allNotes.filter((note) => note.memberId === selectedProfile.id);
  }, [allNotes, selectedProfile.id]);

  const suppliesData = useSyncExternalStore(
    subscribeToSupplies,
    getSuppliesSnapshot,
    getSuppliesServerSnapshot,
  );

  const memberSupplies = useMemo(() => {
    if (!suppliesData?.items) return [];
    return suppliesData.items.filter(
      (item) =>
        item.memberId === selectedProfile.id ||
        (item.memberId === undefined &&
          selectedProfile.fullName && item.name.toLowerCase().includes(selectedProfile.fullName.toLowerCase())),
    );
  }, [suppliesData, selectedProfile.id, selectedProfile.fullName]);

  // Profile Edit Modal
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<MedicalProfile>(selectedProfile);

  // Note Modal
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(initialAddNoteOpen);
  const [editingNote, setEditingNote] = useState<MedicalNote | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState<MedicalNote["category"]>("general");

  const handleOpenEditProfile = () => {
    setProfileForm(selectedProfile);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    saveMedicalProfile(profileForm);
    setIsEditingProfile(false);
  };

  const handleOpenAddNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteCategory("general");
    setIsNoteDialogOpen(true);
  };

  const handleOpenEditNote = (note: MedicalNote) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setIsNoteDialogOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() || !noteContent.trim()) return;

    saveMedicalNote({
      id: editingNote?.id,
      memberId: selectedProfile.id,
      title: noteTitle.trim(),
      content: noteContent.trim(),
      category: noteCategory,
    });

    setIsNoteDialogOpen(false);
  };

  const handleDeleteNote = (id: string) => {
    deleteMedicalNote(id);
  };

  const initials = getInitials(selectedProfile.fullName);
  const ageLabel = copy.age.replace("{age}", String(selectedProfile.age));

  if (!profile) {
    return (
      <main className="medical-page">
        <PageNavigationBar backHref="/family" backLabel={copy.backLabel} title={copy.title} />
        <div className="medical-page__content">
          <section aria-labelledby="medical-empty-profile-heading" className="medical-empty-notes">
            <Notebook aria-hidden="true" size={32} weight="duotone" />
            <div className="medical-empty-notes__content">
              <h1 className="type-h2" id="medical-empty-profile-heading">{copy.noProfile}</h1>
              <p className="type-body text-secondary">{copy.noProfileDescription}</p>
              <Link className="button button--secondary" href="/family">
                <span>{copy.addProfile}</span>
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="medical-page">
      <PageNavigationBar
        backHref="/family"
        backLabel={copy.backLabel}
        textAction={{
          label: copy.edit,
          onClick: handleOpenEditProfile,
        }}
        title={copy.title}
      />

      <div className="medical-page__content">
        <h1 className="sr-only">
          {copy.title} - {selectedProfile.fullName}
        </h1>

        {/* Main Medical Card */}
        <section aria-label={selectedProfile.fullName} className="medical-card">
          {/* Person Header */}
          <div className="medical-profile-header">
            <div aria-hidden="true" className="medical-avatar">
              <span className="medical-avatar__text">{initials}</span>
            </div>
            <div className="medical-profile-info">
              <h2 className="medical-profile-name">{selectedProfile.fullName}</h2>
              <p className="medical-profile-subtitle">
                {ageLabel} &middot; {selectedProfile.birthDate}
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
                  {selectedProfile.bloodType || copy.none}
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
                  {selectedProfile.allergies || copy.none}
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
                  {selectedProfile.chronicDiseases || copy.none}
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
                  {selectedProfile.medications || copy.none}
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
                  {selectedProfile.additionalInfo || copy.none}
                </div>
              </div>
            </li>
          </ul>
        </section>

        {/* Medical & Care Notes Section */}
        <section aria-labelledby="medical-notes-heading" className="medical-notes-section">
          <div className="medical-notes-header">
            <div>
              <h2 className="type-h2" id="medical-notes-heading">
                {copy.notesHeading}
              </h2>
              <p className="type-caption text-secondary mt-1">
                {copy.notesDescription}
              </p>
            </div>
            <Button
              leadingIcon={Plus}
              onClick={handleOpenAddNote}
              variant="secondary"
            >
              {copy.addNote}
            </Button>
          </div>

          {memberNotes.length === 0 ? (
            <div className="medical-empty-notes">
              <Notebook aria-hidden="true" size={32} weight="duotone" />
              <div className="medical-empty-notes__content">
                <h3 className="type-h3">{copy.noNotes}</h3>
                <p className="type-body text-secondary">{copy.noNotesDescription}</p>
                <Button
                  leadingIcon={Plus}
                  onClick={handleOpenAddNote}
                  variant="secondary"
                >
                  {copy.addNote}
                </Button>
              </div>
            </div>
          ) : (
            <ul className="medical-notes-list" role="list">
              {memberNotes.map((note) => {
                const tagVariant =
                  note.category === "emergency"
                    ? "danger"
                    : note.category === "physician"
                    ? "info"
                    : note.category === "diet"
                    ? "warning"
                    : "neutral";

                const categoryLabel =
                  copy.categories[note.category] ?? note.category;

                return (
                  <li className="medical-note-card" key={note.id}>
                    <div className="medical-note-card__header">
                      <div className="flex items-center gap-2">
                        <Tag label={categoryLabel} variant={tagVariant} />
                        <h3 className="medical-note-card__title">{note.title}</h3>
                      </div>
                      <div className="medical-note-card__actions">
                        <IconButton
                          icon={NotePencil}
                          label={copy.editNote}
                          onClick={() => handleOpenEditNote(note)}
                          variant="tertiary"
                        />
                        <IconButton
                          icon={Trash}
                          label={copy.deleteNote}
                          onClick={() => handleDeleteNote(note.id)}
                          variant="destructive"
                        />
                      </div>
                    </div>
                    <p className="medical-note-card__content">{note.content}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        {/* Assigned Supplies and Medications */}
        <section aria-labelledby="member-supplies-heading" className="family-page__section mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="type-h2" id="member-supplies-heading">
                {copy.assignedSuppliesHeading}
              </h2>
              <p className="type-caption text-[var(--content-muted)]">
                {copy.assignedSuppliesDescription}
              </p>
            </div>
            <Link href="/supplies" className="button button--secondary">
              <Package aria-hidden="true" className="button__icon" size={18} weight="bold" />
              <span>{copy.addSupplyForMember}</span>
            </Link>
          </div>

          {memberSupplies.length === 0 ? (
            <div className="medical-empty-notes">
              <Package aria-hidden="true" size={32} weight="duotone" />
              <div className="medical-empty-notes__content">
                <h3 className="type-h3">{copy.noAssignedSupplies}</h3>
                <p className="type-caption text-secondary">{copy.assignedSuppliesDescription}</p>
              </div>
              <Link href="/supplies" className="button button--secondary">
                <span>{copy.addSupplyForMember}</span>
              </Link>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-3 mt-4" role="list">
              {memberSupplies.map((item) => {
                const issues = supplyIssues(item);
                const isReady = issues.length === 0;
                const tagLabel = isReady
                  ? messages.supplies.status.ready
                  : messages.supplies.status[issues[0]];
                const tagVariant = isReady
                  ? "success"
                  : issues[0] === "expired"
                  ? "danger"
                  : "warning";

                return (
                  <li
                    key={item.id}
                    className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-default)] shadow-xs flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="type-h3 font-semibold">{item.name}</h3>
                        <Tag label={tagLabel} variant={tagVariant} />
                      </div>
                      <p className="type-caption text-[var(--content-muted)] mt-0.5">
                        {item.onHand} / {item.target}{" "}
                        {messages.supplies.units[item.unit]}
                        {item.expiresOn
                          ? ` · ${messages.supplies.expiresOn.replace("{date}", item.expiresOn)}`
                          : ""}
                      </p>
                    </div>
                    <Link href="/supplies" className="button button--secondary text-sm shrink-0">
                      <span>{messages.supplies.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Edit Profile Dialog */}
      <Dialog
        closeLabel={copy.cancel}
        description={copy.editTitle}
        onOpenChange={setIsEditingProfile}
        open={isEditingProfile}
        title={copy.editTitle}
      >
        <form className="medical-edit-form" onSubmit={handleSaveProfile}>
          <TextField
            label={copy.fullName}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
            required
            value={profileForm.fullName}
          />
          <TextField
            label={copy.birthDate}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, birthDate: e.target.value }))
            }
            value={profileForm.birthDate}
          />
          <TextField
            label={copy.bloodType}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, bloodType: e.target.value }))
            }
            value={profileForm.bloodType}
          />
          <TextField
            label={copy.allergies}
            onChange={(e) =>
              setProfileForm((prev) => ({ ...prev, allergies: e.target.value }))
            }
            value={profileForm.allergies}
          />
          <TextField
            label={copy.chronicDiseases}
            onChange={(e) =>
              setProfileForm((prev) => ({
                ...prev,
                chronicDiseases: e.target.value,
              }))
            }
            value={profileForm.chronicDiseases}
          />
          <TextField
            label={copy.medications}
            onChange={(e) =>
              setProfileForm((prev) => ({
                ...prev,
                medications: e.target.value,
              }))
            }
            value={profileForm.medications}
          />
          <div className="field">
            <label className="field__label" htmlFor="medical-additional-info">
              {copy.additionalInfo}
            </label>
            <textarea
              className="control-input min-h-[5rem] py-2"
              id="medical-additional-info"
              onChange={(e) =>
                setProfileForm((prev) => ({
                  ...prev,
                  additionalInfo: e.target.value,
                }))
              }
              rows={3}
              value={profileForm.additionalInfo}
            />
          </div>

          <div className="medical-edit-form__actions">
            <Button
              onClick={() => setIsEditingProfile(false)}
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

      {/* Note Add/Edit Dialog */}
      <Dialog
        closeLabel={copy.cancel}
        description={editingNote ? copy.editNote : copy.addNote}
        onOpenChange={setIsNoteDialogOpen}
        open={isNoteDialogOpen}
        title={editingNote ? copy.editNote : copy.addNote}
      >
        <form className="medical-edit-form" onSubmit={handleSaveNote}>
          <TextField
            label={copy.noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            required
            value={noteTitle}
          />
          <SelectField
            label={copy.noteCategory}
            onChange={(e) =>
              setNoteCategory(e.target.value as MedicalNote["category"])
            }
            options={[
              { label: copy.categories.general, value: "general" },
              { label: copy.categories.physician, value: "physician" },
              { label: copy.categories.emergency, value: "emergency" },
              { label: copy.categories.diet, value: "diet" },
            ]}
            value={noteCategory}
          />
          <div className="field">
            <label className="field__label" htmlFor="note-content">
              {copy.noteContent}
            </label>
            <textarea
              className="control-input min-h-[6rem] py-2"
              id="note-content"
              onChange={(e) => setNoteContent(e.target.value)}
              required
              rows={4}
              value={noteContent}
            />
          </div>

          <div className="medical-edit-form__actions">
            <Button
              onClick={() => setIsNoteDialogOpen(false)}
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
