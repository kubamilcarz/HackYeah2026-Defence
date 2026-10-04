"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Backpack,
  FirstAidKit,
  MapTrifold,
  MapPin,
  Package,
  Phone,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { EmergencyModeCard, FamilyMembersCard, HouseholdResourcesCard, ReadinessCard } from "@/components/ui/Cards";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  getInitials,
  getMedicalProfilesServerSnapshot,
  getMedicalProfilesSnapshot,
  subscribeToMedicalProfiles,
} from "@/components/app/medical";
import {
  getEmergencyContactsServerSnapshot,
  getEmergencyContactsSnapshot,
  subscribeToEmergencyContacts,
} from "@/components/app/contacts";

export function HomeScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.home;

  const profiles = useSyncExternalStore(
    subscribeToMedicalProfiles,
    getMedicalProfilesSnapshot,
    getMedicalProfilesServerSnapshot,
  );

  const emergencyContacts = useSyncExternalStore(
    subscribeToEmergencyContacts,
    getEmergencyContactsSnapshot,
    getEmergencyContactsServerSnapshot,
  );

  const meMember = useMemo(() => {
    return profiles.find(
      (m) =>
        m.relationship?.toLowerCase() === "me" ||
        m.relationship?.toLowerCase() === "ja" ||
        m.relationship === messages.family.relationshipOptions.me,
    );
  }, [profiles, messages.family.relationshipOptions.me]);

  const eligibleEmergencyContacts = useMemo(() => {
    return emergencyContacts.filter((c) => {
      const rel = c.relationship?.trim().toLowerCase();
      if (
        rel === "me" ||
        rel === "ja" ||
        rel === messages.family.relationshipOptions.me.toLowerCase()
      ) {
        return false;
      }
      if (
        meMember &&
        c.name.trim().toLowerCase() === meMember.fullName.trim().toLowerCase()
      ) {
        return false;
      }
      return true;
    });
  }, [emergencyContacts, meMember, messages.family.relationshipOptions.me]);

  const primaryContact = useMemo(() => {
    return (
      eligibleEmergencyContacts.find((c) => c.isPrimary) ??
      eligibleEmergencyContacts[0]
    );
  }, [eligibleEmergencyContacts]);

  const contactMembers = useMemo(() => {
    const list: { id: string; name: string; initials: string }[] = [];
    const seenNames = new Set<string>();

    for (const p of profiles) {
      const rel = p.relationship?.trim().toLowerCase();
      if (
        rel === "me" ||
        rel === "ja" ||
        rel === messages.family.relationshipOptions.me.toLowerCase()
      ) {
        continue;
      }
      seenNames.add(p.fullName.trim().toLowerCase());
      list.push({
        id: p.id,
        name: p.fullName,
        initials: getInitials(p.fullName),
      });
    }

    for (const c of emergencyContacts) {
      const rel = c.relationship?.trim().toLowerCase();
      if (
        rel === "me" ||
        rel === "ja" ||
        rel === messages.family.relationshipOptions.me.toLowerCase()
      ) {
        continue;
      }
      if (
        meMember &&
        c.name.trim().toLowerCase() === meMember.fullName.trim().toLowerCase()
      ) {
        continue;
      }
      if (!seenNames.has(c.name.trim().toLowerCase())) {
        seenNames.add(c.name.trim().toLowerCase());
        list.push({
          id: c.id,
          name: c.name,
          initials: getInitials(c.name),
        });
      }
    }

    return list;
  }, [profiles, emergencyContacts, meMember, messages.family.relationshipOptions.me]);

  function formatContactsSummary(count: number): string {
    if (count === 0) return copy.setup.family.summary;
    if (locale === "pl") {
      if (count === 1) return "1 zapisana osoba";
      if (count >= 2 && count <= 4) return `${count} zapisane osoby`;
      return `${count} zapisanych osób`;
    }
    return count === 1 ? "1 saved person" : `${count} saved people`;
  }

  return (
    <main className="home-screen">
      <div className="home-screen__content">
        <header className="home-screen__header">
          <div aria-hidden="true" className="home-screen__brand">
            <Image alt="" className="brand-logo__asset brand-logo__asset--color" height={80} src="/brand/logo-color.svg" width={80} />
            <Image alt="" className="brand-logo__asset brand-logo__asset--white" height={80} src="/brand/logo-white.svg" width={80} />
          </div>
          <h1 className="type-h1">{copy.title}</h1>
          <p className="type-body home-screen__intro">{copy.intro}</p>
        </header>

        <EmergencyModeCard />

        <section aria-labelledby="setup-heading" className="home-screen__section">
          <div className="home-screen__section-heading">
            <h2 className="type-h2" id="setup-heading">{copy.setup.heading}</h2>
            <p className="type-caption">{copy.setup.description}</p>
          </div>
          <div className="home-screen__dashboard-grid">
            <ReadinessCard
              action={{ href: "/plan", label: copy.setup.readiness.action }}
              completed={0}
              description={copy.setup.readiness.description}
              label={copy.setup.readiness.label}
              primaryAction
              progressSummary={copy.setup.readiness.progressSummary}
              total={4}
            />
            <FamilyMembersCard
              addMemberAction={{ href: "/family", label: copy.setup.family.addAction }}
              manageAction={{ href: "/family", label: copy.setup.family.manageAction }}
              members={contactMembers}
              membersLabel={copy.setup.family.membersLabel}
              summary={formatContactsSummary(contactMembers.length)}
              title={copy.setup.family.title}
            />
            <HouseholdResourcesCard
              action={{ href: "/family", label: copy.setup.essentials.action }}
              resources={[
                { Icon: MapPin, id: "meeting-place", label: copy.setup.essentials.meetingPlace, value: copy.setup.essentials.notSet },
                { Icon: Phone, id: "contact-plan", label: copy.setup.essentials.contactPlan, value: primaryContact ? `${primaryContact.name} (${primaryContact.relationship})` : copy.setup.essentials.notSet },
                { Icon: FirstAidKit, id: "health-information", label: copy.setup.essentials.healthInformation, value: profiles.length > 0 ? `${profiles.length}` : copy.setup.essentials.notSet },
              ]}
              title={copy.setup.essentials.title}
            />
          </div>
        </section>

        <section aria-labelledby="quick-access-heading" className="home-screen__section">
          <div className="home-screen__section-heading">
            <h2 className="type-h2" id="quick-access-heading">{copy.quickAccess.heading}</h2>
            <p className="type-caption">{copy.quickAccess.description}</p>
          </div>
          <div className="home-screen__quick-grid">
            <Link className="home-quick-link" href="/settings/important-numbers">
              <Phone aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
              <span className="home-quick-link__content">
                <span className="type-h3">{copy.quickAccess.numbers.title}</span>
                <span className="type-caption">{copy.quickAccess.numbers.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
            </Link>
            <Link className="home-quick-link" href="/map">
              <MapTrifold aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
              <span className="home-quick-link__content">
                <span className="type-h3">{copy.quickAccess.map.title}</span>
                <span className="type-caption">{copy.quickAccess.map.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
            </Link>
            <Link className="home-quick-link" href="/supplies">
              <Package aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
              <span className="home-quick-link__content">
                <span className="type-h3">{copy.quickAccess.supplies.title}</span>
                <span className="type-caption">{copy.quickAccess.supplies.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
            </Link>
            <Link className="home-quick-link" href="/plan/backpack">
              <Backpack aria-hidden="true" className="home-quick-link__icon" size={28} weight="bold" />
              <span className="home-quick-link__content">
                <span className="type-h3">{copy.quickAccess.backpack.title}</span>
                <span className="type-caption">{copy.quickAccess.backpack.description}</span>
              </span>
              <ArrowRight aria-hidden="true" className="home-quick-link__arrow" size={20} weight="bold" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
