"use client";

import { ArrowSquareOut, Fire, Lightning, Phone, ShieldWarning } from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/lib";
import { useState } from "react";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { SegmentedControl } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

const categories = ["all", "services", "family", "medical"] as const;

type NumberCategory = (typeof categories)[number];

type CallNumber = {
  categories: NumberCategory[];
  number: string;
  title: string;
};

type Resource = {
  categories: NumberCategory[];
  href: string;
  icon: Icon;
  number?: string;
  title: string;
};

function isNumberCategory(value: string): value is NumberCategory {
  return categories.includes(value as NumberCategory);
}

function matchesCategory(item: { categories: NumberCategory[] }, category: NumberCategory) {
  return category === "all" || item.categories.includes(category);
}

export function ImportantNumbersScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.importantNumbers;
  const [category, setCategory] = useState<NumberCategory>("all");

  const callNumbers: CallNumber[] = [
    { number: "112", title: copy.numbers.emergency, categories: ["services", "medical"] },
    { number: "998", title: copy.numbers.fire, categories: ["services"] },
    { number: "997", title: copy.numbers.police, categories: ["services"] },
    { number: "999", title: copy.numbers.ambulance, categories: ["services", "medical"] },
  ];
  const resources: Resource[] = [
    { title: copy.resources.rcb, href: "https://www.gov.pl/web/rcb/", icon: ShieldWarning, categories: ["services"] },
    { title: copy.resources.energy, href: "https://www.gov.pl/web/numer-alarmowy-112/inne-numery-alarmowe", icon: Lightning, number: "991", categories: ["services"] },
    { title: copy.resources.gas, href: "https://www.psgaz.pl/", icon: Fire, number: "992", categories: ["services"] },
  ];
  const filteredCalls = callNumbers.filter((item) => matchesCategory(item, category));
  const filteredResources = resources.filter((item) => matchesCategory(item, category));

  return (
    <main className="settings-page" lang={locale}>
      <PageNavigationBar backHref="/settings" backLabel={messages.common.backToSettings} title={copy.title} />
      <div className="settings-page__content settings-page__content--detail important-numbers-page">
        <h1 className="sr-only">{copy.title}</h1>
        <SegmentedControl
          className="important-numbers-page__filters"
          label={copy.filtersLabel}
          name="important-numbers-category"
          onValueChange={(value) => {
            if (isNumberCategory(value)) setCategory(value);
          }}
          options={categories.map((value) => ({ label: copy.filters[value], value }))}
          value={category}
        />

        {filteredCalls.length > 0 || filteredResources.length > 0 ? (
          <>
            {filteredCalls.length > 0 && (
              <section aria-labelledby="emergency-numbers-heading" className="important-numbers-page__section">
                <h2 className="type-h2" id="emergency-numbers-heading">{copy.emergencyHeading}</h2>
                <ul className="important-numbers-page__calls">
                  {filteredCalls.map(({ number, title }) => (
                    <li key={number}>
                      <a aria-label={`${copy.call} ${number}: ${title}`} className="important-numbers-page__call" href={`tel:${number}`}>
                        <span aria-hidden="true" className="important-numbers-page__number">{number}</span>
                        <span className="important-numbers-page__call-copy">
                          <strong className="type-h3">{title}</strong>
                        </span>
                        <Phone aria-hidden="true" className="important-numbers-page__call-icon" size={24} weight="bold" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {filteredResources.length > 0 && (
              <section aria-labelledby="other-numbers-heading" className="important-numbers-page__section">
                <h2 className="type-h3 important-numbers-page__other-heading" id="other-numbers-heading">{copy.otherHeading}</h2>
                <ul className="important-numbers-page__resources">
                  {filteredResources.map(({ href, icon: Icon, number, title }) => (
                    <li className="important-numbers-page__resource" key={title}>
                      <a aria-label={`${title}: ${copy.openOfficialSite}`} className="important-numbers-page__resource-link" href={href} rel="noopener noreferrer" target="_blank">
                        <Icon aria-hidden="true" className="important-numbers-page__resource-icon" size={24} weight="bold" />
                        <span className="important-numbers-page__resource-copy">
                          <strong className="type-h3">{title}</strong>
                          <span className="type-caption">{copy.officialSite}</span>
                        </span>
                        <ArrowSquareOut aria-hidden="true" className="important-numbers-page__external-icon" size={20} weight="bold" />
                      </a>
                      {number && <a aria-label={`${copy.call} ${number}: ${title}`} className="important-numbers-page__resource-call" href={`tel:${number}`}>{number}</a>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        ) : (
          <p className="important-numbers-page__empty" role="status">{copy.emptyState}</p>
        )}
      </div>
    </main>
  );
}
