"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import {
  Drop,
  FirstAidKit,
  FlowerTulip,
  MapPin,
  PencilSimple,
  Phone,
  Plus,
  Trash,
} from "@phosphor-icons/react/ssr";
import { Button, IconButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Tag } from "@/components/ui/Tag";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { FamilyMemberSheet } from "@/components/app/FamilyMemberSheet";
import { EmergencyContactSheet } from "@/components/app/EmergencyContactSheet";
import {
  deleteEmergencyContact,
  getEmergencyContactsServerSnapshot,
  getEmergencyContactsSnapshot,
  saveEmergencyContact,
  subscribeToEmergencyContacts,
  type EmergencyContact,
} from "@/components/app/contacts";
import {
  getInitials,
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  saveMedicalProfile,
  subscribeToMedicalProfiles,
  type MedicalProfile,
} from "@/components/app/medical";

export default function FamilyPage() {
  const { locale, messages } = useLocalization();
  const copy = messages.family;

  const members = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot,
  );

  const emergencyContacts = useSyncExternalStore(
    subscribeToEmergencyContacts,
    getEmergencyContactsSnapshot,
    getEmergencyContactsServerSnapshot,
  );

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [defaultRelationship, setDefaultRelationship] = useState<string | undefined>();

  const [isContactSheetOpen, setIsContactSheetOpen] = useState(false);
  const [contactToEdit, setContactToEdit] = useState<EmergencyContact | null>(null);
  const [contactToDelete, setContactToDelete] = useState<EmergencyContact | null>(null);

  const meMember = useMemo(() => {
    return members.find(
      (m) =>
        m.relationship?.toLowerCase() === "me" ||
        m.relationship?.toLowerCase() === "ja" ||
        m.relationship === copy.relationshipOptions.me,
    );
  }, [members, copy.relationshipOptions.me]);

  function formatMembersCount(count: number): string {
    const pr = new Intl.PluralRules(locale);
    const rule = pr.select(count);
    const countMap = copy.membersCount as Record<string, string>;
    const template = countMap[rule] || countMap.other || countMap.many;
    return template.replace("{count}", String(count));
  }

  function formatContactsCount(count: number): string {
    const pr = new Intl.PluralRules(locale);
    const rule = pr.select(count);
    const countMap = copy.contactsCount as Record<string, string>;
    const template = countMap[rule] || countMap.other || countMap.many;
    return template.replace("{count}", String(count));
  }

  function handleOpenAddSheet() {
    setDefaultRelationship(undefined);
    setIsSheetOpen(true);
  }

  function handleOpenAddMe() {
    setDefaultRelationship(copy.relationshipOptions.me);
    setIsSheetOpen(true);
  }

  function handleSaveMember(profile: MedicalProfile) {
    saveMedicalProfile(profile);
  }

  function handleOpenAddContact() {
    setContactToEdit(null);
    setIsContactSheetOpen(true);
  }

  function handleEditContact(contact: EmergencyContact) {
    setContactToEdit(contact);
    setIsContactSheetOpen(true);
  }

  function handleSaveContact(contact: EmergencyContact) {
    saveEmergencyContact(contact);
  }

  function handleDeleteContactClick(contact: EmergencyContact) {
    setContactToDelete(contact);
  }

  function handleConfirmDeleteContact() {
    if (contactToDelete) {
      deleteEmergencyContact(contactToDelete.id);
      setContactToDelete(null);
    }
  }

  return (
    <main className="family-page">
      <PageNavigationBar title={copy.title} />
      <div className="family-page__content">
        <h1 className="sr-only">{copy.title}</h1>

        <section aria-labelledby="family-members-heading" className="family-page__section">
          <div className="flex items-center justify-between">
            <h2 className="type-h2" id="family-members-heading">{copy.members}</h2>
            {members.length > 0 && (
              <span className="type-caption text-[var(--content-muted)]">
                {formatMembersCount(members.length)}
              </span>
            )}
          </div>

          <ul aria-label={copy.members} className="family-member-strip">
            {members.map((member) => (
              <li className="family-member-strip__item" key={member.id}>
                <Link
                  aria-label={`${member.fullName}, ${member.relationship || ""}`}
                  className="family-member-item"
                  href={`/family/medical?memberId=${member.id}`}
                >
                  <span aria-hidden="true" className="family-member-item__avatar">
                    {getInitials(member.fullName)}
                  </span>
                  <span className="family-member-item__name">{member.fullName}</span>
                  {member.relationship && (
                    <span className="family-member-item__role">{member.relationship}</span>
                  )}
                </Link>
              </li>
            ))}
            <li className="family-member-strip__item">
              <button
                className="family-member-add"
                onClick={handleOpenAddSheet}
                type="button"
              >
                <span aria-hidden="true" className="family-member-add__avatar">
                  <Plus size={28} weight="bold" />
                </span>
                <span>{copy.addPerson}</span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="emergency-contacts-heading" className="family-page__section">
          <div className="flex items-center justify-between">
            <h2 className="type-h2" id="emergency-contacts-heading">{copy.emergencyContacts}</h2>
            {emergencyContacts.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="type-caption text-[var(--content-muted)]">
                  {formatContactsCount(emergencyContacts.length)}
                </span>
                <Button leadingIcon={Plus} onClick={handleOpenAddContact} variant="secondary">
                  {copy.addContact}
                </Button>
              </div>
            )}
          </div>

          {emergencyContacts.length === 0 ? (
            <div className="family-empty-state">
              <Phone aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
              <div className="family-empty-state__content">
                <h3 className="type-h3">{copy.noEmergencyContacts}</h3>
                <p className="type-body">{copy.emergencyContactsDescription}</p>
                <Button leadingIcon={Plus} onClick={handleOpenAddContact} variant="secondary">
                  {copy.addContact}
                </Button>
              </div>
            </div>
          ) : (
            <ul aria-label={copy.emergencyContacts} className="emergency-contacts-list" role="list">
              {emergencyContacts.map((contact) => (
                <li key={contact.id}>
                  <article
                    className={`emergency-contact-card${contact.isPrimary ? " emergency-contact-card--primary" : ""}`}
                  >
                    <div className="emergency-contact-card__main">
                      <span aria-hidden="true" className="emergency-contact-card__avatar">
                        {getInitials(contact.name)}
                      </span>
                      <div className="emergency-contact-card__info">
                        <div className="flex items-center gap-2">
                          <h3 className="emergency-contact-card__name">{contact.name}</h3>
                          {contact.isPrimary && (
                            <Tag label={copy.primaryContactBadge} variant="info" />
                          )}
                        </div>
                        <div className="emergency-contact-card__meta">
                          <span className="emergency-contact-card__meta-phone">{contact.phone}</span>
                          {contact.relationship && <span>· {contact.relationship}</span>}
                          {contact.location && <span>· {contact.location}</span>}
                          {contact.altPhone && <span>· {contact.altPhone}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="emergency-contact-card__actions">
                      <a
                        aria-label={`${copy.callContact} ${contact.name}: ${contact.phone}`}
                        className="button button--secondary"
                        href={`tel:${contact.phone}`}
                      >
                        <Phone aria-hidden="true" className="button__icon" size={18} weight="bold" />
                        <span>{copy.callContact}</span>
                      </a>
                      <IconButton
                        icon={PencilSimple}
                        label={`${copy.edit}: ${contact.name}`}
                        onClick={() => handleEditContact(contact)}
                        variant="tertiary"
                      />
                      <IconButton
                        icon={Trash}
                        label={`${copy.deleteContact}: ${contact.name}`}
                        onClick={() => handleDeleteContactClick(contact)}
                        variant="tertiary"
                      />
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="medical-information-heading" className="family-page__section">
          <h2 className="type-h2" id="medical-information-heading">{copy.medicalInformation}</h2>

          {meMember ? (
            <div className="medical-card">
              <div className="medical-profile-header">
                <div aria-hidden="true" className="medical-avatar">
                  <span className="medical-avatar__text">{getInitials(meMember.fullName)}</span>
                </div>
                <div className="medical-profile-info">
                  <div className="flex items-center gap-2">
                    <h3 className="medical-profile-name">{meMember.fullName}</h3>
                    <Tag label={copy.relationshipOptions.me} variant="info" />
                  </div>
                  <p className="medical-profile-subtitle">
                    {meMember.age > 0
                      ? messages.medicalInfo.age.replace("{age}", String(meMember.age))
                      : ""}
                    {meMember.birthDate ? ` · ${meMember.birthDate}` : ""}
                  </p>
                </div>
              </div>

              <div aria-hidden="true" className="medical-divider" />

              <ul className="medical-info-list" role="list">
                <li className="medical-info-row">
                  <div aria-hidden="true" className="medical-info-row__icon-wrap">
                    <Drop className="medical-info-row__icon" size={24} weight="bold" />
                  </div>
                  <div className="medical-info-row__content">
                    <span className="medical-info-row__label">{messages.medicalInfo.bloodType}</span>
                    <span className="medical-info-row__value font-semibold">
                      {meMember.bloodType || messages.medicalInfo.none}
                    </span>
                  </div>
                </li>
                <li className="medical-info-row">
                  <div aria-hidden="true" className="medical-info-row__icon-wrap">
                    <FlowerTulip className="medical-info-row__icon" size={24} weight="bold" />
                  </div>
                  <div className="medical-info-row__content">
                    <span className="medical-info-row__label">{messages.medicalInfo.allergies}</span>
                    <span className="medical-info-row__value font-semibold">
                      {meMember.allergies || messages.medicalInfo.none}
                    </span>
                  </div>
                </li>
              </ul>

              <div className="family-empty-state__actions mt-6">
                <Link
                  className="button button--secondary"
                  href={`/family/medical?memberId=${meMember.id}`}
                >
                  <FirstAidKit aria-hidden="true" className="button__icon" size={20} weight="bold" />
                  <span>{copy.viewMedicalCard}</span>
                </Link>
                <Link
                  className="button button--secondary"
                  href={`/family/medical?memberId=${meMember.id}&addNote=true`}
                >
                  <Plus aria-hidden="true" className="button__icon" size={20} weight="bold" />
                  <span>{copy.addNotes}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="family-empty-state">
              <FirstAidKit aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
              <div className="family-empty-state__content">
                <h3 className="type-h3">{copy.noMedicalInformation}</h3>
                <p className="type-body">{copy.medicalInformationDescription}</p>
                <div className="family-empty-state__actions">
                  <Button onClick={handleOpenAddMe} leadingIcon={Plus} variant="secondary">
                    {copy.addMedicalInformation}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      <FamilyMemberSheet
        defaultRelationship={defaultRelationship}
        onOpenChange={setIsSheetOpen}
        onSave={handleSaveMember}
        open={isSheetOpen}
      />

      <EmergencyContactSheet
        contactToEdit={contactToEdit}
        onOpenChange={setIsContactSheetOpen}
        onSave={handleSaveContact}
        open={isContactSheetOpen}
      />

      <Dialog
        closeLabel={copy.cancel}
        description={copy.deleteContactConfirm}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        open={Boolean(contactToDelete)}
        title={copy.deleteContactConfirmTitle}
      >
        <div className="dialog__actions">
          <Button onClick={() => setContactToDelete(null)} type="button" variant="secondary">
            {copy.cancel}
          </Button>
          <Button onClick={handleConfirmDeleteContact} type="button" variant="destructive">
            {copy.deleteConfirmAction}
          </Button>
        </div>
      </Dialog>
    </main>
  );
}
