"use client";

import {
  Bell,
  CaretLeft,
  CaretRight,
  ChatCircleText,
  FirstAidKit,
  House,
  MapPin,
  Phone,
  Warning,
} from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { useEmergencyMode } from "@/components/emergency/EmergencyModeProvider";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  getEmergencyPlanServerSnapshot,
  getEmergencyPlanSnapshot,
  subscribeToEmergencyPlan,
} from "@/components/app/emergency-plan";
import {
  getEmergencyContactsServerSnapshot,
  getEmergencyContactsSnapshot,
  subscribeToEmergencyContacts,
} from "@/components/app/contacts";
import {
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  subscribeToMedicalProfiles,
  type MedicalProfile,
} from "@/components/app/medical";

function hasMedicalValue(value: string | undefined) {
  return Boolean(value && !["-", "—", "none", "brak"].includes(value.trim().toLowerCase()));
}

function medicalSummary(profile: MedicalProfile) {
  return [profile.allergies, profile.chronicDiseases, profile.medications]
    .filter(hasMedicalValue)
    .join("; ");
}

export function CrisisScreen() {
  const router = useRouter();
  const { activateEmergency, deactivateEmergency } = useEmergencyMode();
  const { messages } = useLocalization();
  const copy = messages.crisisMode;
  const emergencyPlan = useSyncExternalStore(subscribeToEmergencyPlan, getEmergencyPlanSnapshot, getEmergencyPlanServerSnapshot);
  const contacts = useSyncExternalStore(subscribeToEmergencyContacts, getEmergencyContactsSnapshot, getEmergencyContactsServerSnapshot);
  const medicalProfiles = useSyncExternalStore(subscribeToMedicalProfiles, getMedicalProfilesSnapshot, getMedicalProfilesServerSnapshot);
  const primaryContact = contacts.find((contact) => contact.isPrimary);
  const hasEmergencyPlan = Boolean(
    emergencyPlan.primaryMeetingPlace || emergencyPlan.backupMeetingPlace || emergencyPlan.familyRoles
    || emergencyPlan.documentsLocation || emergencyPlan.communicationPlan,
  );

  useEffect(() => {
    activateEmergency();
  }, [activateEmergency]);

  function handleExit() {
    deactivateEmergency();
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  const menuItems = [
    {
      href: "/map",
      icon: House,
      id: "shelters",
      title: copy.links.shelters,
    },
    {
      href: "/settings/important-numbers",
      icon: Phone,
      id: "numbers",
      title: copy.links.numbers,
    },
    {
      href: "/family",
      icon: MapPin,
      id: "family-location",
      title: copy.links.familyLocation,
    },
    {
      href: "/alerts",
      icon: Bell,
      id: "alerts",
      title: copy.links.alerts,
    },
    {
      href: "/settings/guides",
      icon: FirstAidKit,
      id: "guides",
      title: copy.links.guides,
    },
  ];

  return (
    <main className="crisis-screen">
      <div className="crisis-screen__container">
        <header className="crisis-screen__header">
          <button
            aria-label={copy.backLabel}
            className="crisis-screen__back-button"
            onClick={handleExit}
            type="button"
          >
            <CaretLeft aria-hidden="true" size={24} weight="bold" />
          </button>
          <p className="crisis-screen__header-title">{copy.title}</p>
        </header>

        <section aria-labelledby="crisis-hero-title" className="crisis-screen__hero">
          <div aria-hidden="true" className="crisis-screen__badge-wrapper">
            <div className="crisis-screen__badge">
              <Warning size={48} weight="bold" />
            </div>
          </div>
          <h1 className="crisis-screen__title" id="crisis-hero-title">
            {copy.title}
          </h1>
          <p className="crisis-screen__description">{copy.description}</p>
        </section>

        <section aria-labelledby="crisis-actions-heading" className="crisis-screen__quick-actions">
          <h2 className="type-h3" id="crisis-actions-heading">{copy.quickActions.title}</h2>
          <div className="crisis-screen__quick-actions-grid">
            <a className="crisis-screen__quick-action crisis-screen__quick-action--emergency" href="tel:112">
              <Phone aria-hidden="true" size={24} weight="bold" />
              <span><strong>{copy.quickActions.callEmergency}</strong><small>{copy.quickActions.emergencyDescription}</small></span>
            </a>
            {primaryContact ? (
              <>
                <a className="crisis-screen__quick-action" href={`tel:${primaryContact.phone}`}>
                  <Phone aria-hidden="true" size={24} weight="bold" />
                  <span><strong>{copy.quickActions.callPrimary.replace("{name}", primaryContact.name)}</strong><small>{primaryContact.phone}</small></span>
                </a>
                <a className="crisis-screen__quick-action" href={`sms:${primaryContact.phone}`}>
                  <ChatCircleText aria-hidden="true" size={24} weight="bold" />
                  <span><strong>{copy.quickActions.textPrimary.replace("{name}", primaryContact.name)}</strong><small>{primaryContact.phone}</small></span>
                </a>
              </>
            ) : (
              <Link className="crisis-screen__quick-action" href="/family">
                <Phone aria-hidden="true" size={24} weight="bold" />
                <span><strong>{copy.quickActions.addPrimary}</strong><small>{copy.quickActions.addPrimaryDescription}</small></span>
              </Link>
            )}
          </div>
        </section>

        <section aria-labelledby="crisis-plan-heading" className="crisis-screen__plan-card">
          <div className="crisis-screen__plan-heading">
            <div><h2 className="type-h3" id="crisis-plan-heading">{copy.card.title}</h2><p className="type-caption">{copy.card.offline}</p></div>
            <Link href="/plan/details">{copy.plan.manage}</Link>
          </div>
          {hasEmergencyPlan || contacts.length > 0 || medicalProfiles.length > 0 ? (
            <dl className="crisis-screen__plan-list">
              {contacts.length > 0 && <div><dt>{copy.card.contacts}</dt><dd>{contacts.map((contact) => `${contact.name}: ${contact.phone}`).join(" · ")}</dd></div>}
              {medicalProfiles.length > 0 && <div><dt>{copy.card.medical}</dt><dd>{medicalProfiles.map((profile) => `${profile.fullName}${medicalSummary(profile) ? `: ${medicalSummary(profile)}` : ""}`).join(" · ")}</dd></div>}
              {emergencyPlan.primaryMeetingPlace && <div><dt>{copy.plan.primaryMeetingPlace}</dt><dd>{emergencyPlan.primaryMeetingPlace}</dd></div>}
              {emergencyPlan.backupMeetingPlace && <div><dt>{copy.plan.backupMeetingPlace}</dt><dd>{emergencyPlan.backupMeetingPlace}</dd></div>}
              {emergencyPlan.communicationPlan && <div><dt>{copy.plan.communication}</dt><dd>{emergencyPlan.communicationPlan}</dd></div>}
              {emergencyPlan.familyRoles && <div><dt>{copy.plan.roles}</dt><dd>{emergencyPlan.familyRoles}</dd></div>}
              {emergencyPlan.documentsLocation && <div><dt>{copy.plan.documents}</dt><dd>{emergencyPlan.documentsLocation}</dd></div>}
            </dl>
          ) : <p className="type-caption">{copy.plan.empty}</p>}
        </section>

        <aside className="crisis-screen__official-guidance">
          <p>{copy.officialGuidance.description}</p>
          <a href="https://www.gov.pl/web/rcb/" rel="noopener noreferrer" target="_blank">{copy.officialGuidance.action}</a>
        </aside>

        <nav aria-label={copy.title} className="crisis-screen__menu-card">
          <ul className="crisis-screen__list">
            {menuItems.map(({ href, icon: Icon, id, title }) => (
              <li key={id}>
                <Link className="crisis-screen__link" href={href}>
                  <span className="crisis-screen__link-main">
                    <Icon aria-hidden="true" className="crisis-screen__link-icon" size={26} weight="bold" />
                    <span className="crisis-screen__link-label">{title}</span>
                  </span>
                  <CaretRight aria-hidden="true" className="crisis-screen__link-arrow" size={20} weight="bold" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="crisis-screen__footer">
          <button
            className="crisis-screen__exit-button"
            onClick={handleExit}
            type="button"
          >
            {copy.exitAction}
          </button>
        </footer>
      </div>
    </main>
  );
}
