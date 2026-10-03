"use client";

import Link from "next/link";
import { FirstAidKit, Phone, Plus } from "@phosphor-icons/react/ssr";
import { Button } from "@/components/ui/Button";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export default function FamilyPage() {
  const { messages } = useLocalization();
  const copy = messages.family;
  return (
    <main className="family-page">
      <PageNavigationBar title={copy.title} />
      <div className="family-page__content">
        <h1 className="sr-only">{copy.title}</h1>

        <section aria-labelledby="family-members-heading" className="family-page__section">
          <h2 className="type-h2" id="family-members-heading">{copy.members}</h2>
          <ul aria-label={copy.members} className="family-member-strip">
            <li className="family-member-strip__item">
              <button className="family-member-add" disabled type="button">
                <span aria-hidden="true" className="family-member-add__avatar"><Plus size={28} weight="bold" /></span>
                <span>{copy.addPerson}</span>
              </button>
            </li>
          </ul>
        </section>

        <section aria-labelledby="emergency-contacts-heading" className="family-page__section">
          <h2 className="type-h2" id="emergency-contacts-heading">{copy.emergencyContacts}</h2>
          <div className="family-empty-state">
            <Phone aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
            <div className="family-empty-state__content">
              <h3 className="type-h3">{copy.noEmergencyContacts}</h3>
              <p className="type-body">{copy.emergencyContactsDescription}</p>
              <Button disabled leadingIcon={Plus} variant="secondary">{copy.addContact}</Button>
            </div>
          </div>
        </section>

        <section aria-labelledby="medical-information-heading" className="family-page__section">
          <h2 className="type-h2" id="medical-information-heading">{copy.medicalInformation}</h2>
          <div className="family-empty-state">
            <FirstAidKit aria-hidden="true" className="family-empty-state__icon" size={28} weight="bold" />
            <div className="family-empty-state__content">
              <h3 className="type-h3">{copy.noMedicalInformation}</h3>
              <p className="type-body">{copy.medicalInformationDescription}</p>
              <div className="family-empty-state__actions">
                <Link className="button button--secondary" href="/family/medical">
                  <Plus aria-hidden="true" className="button__icon" size={20} weight="bold" />
                  <span>{copy.addMedicalInformation}</span>
                </Link>
                <Link className="button button--secondary" href="/family/medical?addNote=true">
                  <Plus aria-hidden="true" className="button__icon" size={20} weight="bold" />
                  <span>{copy.addNotes}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
