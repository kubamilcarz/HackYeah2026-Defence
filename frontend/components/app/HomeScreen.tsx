"use client";

import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  FirstAidKit,
  MapTrifold,
  MapPin,
  Package,
  Phone,
  UsersThree,
} from "@phosphor-icons/react/ssr";
import { Alert } from "@/components/ui/Alert";
import { FamilyMembersCard, HouseholdResourcesCard, ReadinessCard } from "@/components/ui/Cards";
import { useLocalization } from "@/components/localization/LocalizationProvider";

export function HomeScreen() {
  const { messages } = useLocalization();
  const copy = messages.home;

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

        <Alert
          actionHref="/settings/important-numbers"
          actionLabel={copy.emergency.action}
          className="home-screen__emergency-note"
          description={copy.emergency.description}
          title={copy.emergency.title}
          variant="warning"
        />

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
              members={[]}
              membersLabel={copy.setup.family.membersLabel}
              summary={copy.setup.family.summary}
              title={copy.setup.family.title}
            />
            <HouseholdResourcesCard
              action={{ href: "/family", label: copy.setup.essentials.action }}
              resources={[
                { Icon: MapPin, id: "meeting-place", label: copy.setup.essentials.meetingPlace, value: copy.setup.essentials.notSet },
                { Icon: Phone, id: "contact-plan", label: copy.setup.essentials.contactPlan, value: copy.setup.essentials.notSet },
                { Icon: FirstAidKit, id: "health-information", label: copy.setup.essentials.healthInformation, value: copy.setup.essentials.notSet },
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
          </div>
        </section>
      </div>
    </main>
  );
}
