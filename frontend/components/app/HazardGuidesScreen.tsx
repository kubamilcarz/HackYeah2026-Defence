"use client";

import { useMemo, useState } from "react";
import {
  ArrowSquareOut,
  Fire,
  Lightning,
  Phone,
  Signpost,
  Waves,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/lib";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import { Alert } from "@/components/ui/Alert";
import { Tag } from "@/components/ui/Tag";

export type HazardId = "flooding" | "blackout" | "fire" | "evacuation";
type HazardFilter = "all" | HazardId;

const hazardIcons: Record<HazardId, Icon> = {
  flooding: Waves,
  blackout: Lightning,
  fire: Fire,
  evacuation: Signpost,
};

const HAZARDS: readonly HazardId[] = ["flooding", "blackout", "fire", "evacuation"] as const;

export function HazardGuidesScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.hazardGuides;
  const [selectedHazard, setSelectedHazard] = useState<HazardFilter>("all");

  const displayedHazards = useMemo(() => {
    if (selectedHazard === "all") return HAZARDS;
    return HAZARDS.filter((id) => id === selectedHazard);
  }, [selectedHazard]);

  return (
    <main className="settings-page" lang={locale}>
      <PageNavigationBar
        backHref="/settings"
        backLabel={messages.common.backToSettings}
        title={copy.title}
      />
      <div className="settings-page__content settings-page__content--detail hazard-guides-screen">
        <h1 className="sr-only">{copy.title}</h1>

        {/* Priority deferral notice using shared design system Alert primitive */}
        <Alert
          description={copy.deferNotice}
          title={copy.title}
          variant="danger"
        />

        {/* Hazard filter chips - pill style consistent with map / supplies */}
        <nav aria-label={copy.title} className="hazard-filter-chips">
          <button
            aria-pressed={selectedHazard === "all"}
            className="hazard-filter-chip"
            onClick={() => setSelectedHazard("all")}
            type="button"
          >
            {copy.viewAll}
          </button>
          {HAZARDS.map((id) => {
            const isSelected = selectedHazard === id;
            return (
              <button
                aria-pressed={isSelected}
                className="hazard-filter-chip"
                key={id}
                onClick={() => setSelectedHazard(id)}
                type="button"
              >
                {copy.hazards[id].title}
              </button>
            );
          })}
        </nav>

        {/* Guides cards */}
        <div className="hazard-guides-grid">
          {displayedHazards.map((hazardId) => {
            const data = copy.hazards[hazardId];
            const Icon = hazardIcons[hazardId];

            return (
              <article
                aria-labelledby={`hazard-${hazardId}-title`}
                className="card hazard-card"
                key={hazardId}
              >
                {/* Header: Icon, Title, Category Tag, Direct Phone Target */}
                <div className="hazard-card__header">
                  <div className="hazard-card__identity">
                    <div aria-hidden="true" className="hazard-card__icon-box">
                      <Icon size={24} weight="bold" />
                    </div>
                    <div className="hazard-card__titles">
                      <div className="hazard-card__title-row">
                        <h2 className="type-h2" id={`hazard-${hazardId}-title`}>
                          {data.title}
                        </h2>
                        <Tag label={data.tag} variant="neutral" />
                      </div>
                    </div>
                  </div>

                  {data.emergencyContact && (
                    <a
                      aria-label={`${copy.callService.replace("{number}", data.emergencyContact)}`}
                      className="hazard-card__call-btn"
                      href={`tel:${data.emergencyContact}`}
                    >
                      <Phone aria-hidden="true" size={18} weight="bold" />
                      <span>{data.emergencyContact}</span>
                    </a>
                  )}
                </div>

                {/* Section 1: Active Emergency Steps */}
                <section aria-labelledby={`hazard-${hazardId}-active-heading`} className="hazard-card__section">
                  <h3
                    className="type-caption font-semibold hazard-card__section-label hazard-card__section-label--danger"
                    id={`hazard-${hazardId}-active-heading`}
                  >
                    {copy.sections.active}
                  </h3>
                  <ol className="hazard-card__step-list">
                    {data.activeSteps.map((step, idx) => (
                      <li className="hazard-card__step" key={idx}>
                        <span aria-hidden="true" className="hazard-card__step-number">
                          {idx + 1}
                        </span>
                        <span className="type-body hazard-card__step-text">{step}</span>
                      </li>
                    ))}
                  </ol>
                </section>

                {/* Section 2: Preparedness Steps */}
                <section aria-labelledby={`hazard-${hazardId}-prep-heading`} className="hazard-card__section">
                  <h3
                    className="type-caption font-semibold hazard-card__section-label hazard-card__section-label--muted"
                    id={`hazard-${hazardId}-prep-heading`}
                  >
                    {copy.sections.preparedness}
                  </h3>
                  <ul className="hazard-card__step-list">
                    {data.preparednessSteps.map((step, idx) => (
                      <li className="hazard-card__step" key={idx}>
                        <span aria-hidden="true" className="hazard-card__step-bullet" />
                        <span className="type-body hazard-card__step-text text-[var(--content-secondary)]">{step}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Footer: Official Source Link */}
                <footer className="hazard-card__footer">
                  <a
                    className="hazard-card__source-link"
                    href={data.sourceUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>{copy.officialSource.replace("{source}", data.sourceName)}</span>
                    <ArrowSquareOut aria-hidden="true" size={14} weight="bold" />
                  </a>
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
