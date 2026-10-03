"use client";

import {
  ClipboardText,
  Info,
  Megaphone,
  Warning,
} from "@phosphor-icons/react";
import type { Icon } from "@phosphor-icons/react/lib";
import { useMemo, useState } from "react";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import { SegmentedControl } from "@/components/ui/FormControls";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";
import type { Messages } from "@/localization/messages";

const filters = ["all", "alerts", "system"] as const;

type NotificationFilter = (typeof filters)[number];
type NotificationCategory = Exclude<NotificationFilter, "all">;
type NotificationSeverity = "danger" | "info" | "warning";

export type NotificationItem = {
  category: NotificationCategory;
  id: string;
  isDemo: boolean;
  publishedAt: string;
  severity: NotificationSeverity;
  sourceName: string;
  summary: string;
  title: string;
};

type NotificationsScreenProps = {
  context: "alerts" | "settings";
  items?: NotificationItem[];
};

const notificationIcons: Record<NotificationSeverity | "system", Icon> = {
  danger: Warning,
  info: Info,
  system: ClipboardText,
  warning: Megaphone,
};

function formatTemplate(template: string, token: string, value: string) {
  return template.replace(`{${token}}`, value);
}

function isNotificationFilter(value: string): value is NotificationFilter {
  return filters.includes(value as NotificationFilter);
}

function createDemoItems(copy: Messages["notifications"]): NotificationItem[] {
  const sourceName = copy.demoSource;

  return [
    { id: "sample-weather", category: "alerts", severity: "danger", title: copy.items.severeWeather.title, summary: copy.items.severeWeather.summary, sourceName, publishedAt: "2026-10-03T10:34:00+02:00", isDemo: true },
    { id: "sample-public-safety", category: "alerts", severity: "warning", title: copy.items.publicSafety.title, summary: copy.items.publicSafety.summary, sourceName, publishedAt: "2026-10-03T09:12:00+02:00", isDemo: true },
    { id: "sample-school", category: "alerts", severity: "info", title: copy.items.schoolClosure.title, summary: copy.items.schoolClosure.summary, sourceName, publishedAt: "2026-10-02T18:50:00+02:00", isDemo: true },
    { id: "sample-plan", category: "system", severity: "info", title: copy.items.planCreated.title, summary: copy.items.planCreated.summary, sourceName, publishedAt: "2026-10-02T16:30:00+02:00", isDemo: true },
    { id: "sample-update", category: "system", severity: "info", title: copy.items.appUpdated.title, summary: copy.items.appUpdated.summary, sourceName, publishedAt: "2026-10-01T08:15:00+02:00", isDemo: true },
  ];
}

function formatPublishedAt(locale: string, publishedAt: string) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(publishedAt));
}

export function NotificationsScreen({ context, items }: NotificationsScreenProps) {
  const { locale, messages } = useLocalization();
  const copy = messages.notifications;
  const title = context === "settings" ? copy.title : messages.navigation.alerts;
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const notifications = useMemo(() => items ?? createDemoItems(copy), [copy, items]);
  const filteredNotifications = notifications.filter((item) => filter === "all" || item.category === filter);

  return (
    <main className="notifications-page" lang={locale}>
      <PageNavigationBar
        backHref={context === "settings" ? "/settings" : undefined}
        backLabel={messages.common.backToSettings}
        title={title}
      />
      <div className="notifications-page__content">
        <h1 className="sr-only">{title}</h1>
        <SegmentedControl
          className="notifications-page__filters"
          label={copy.filtersLabel}
          name={`notification-filter-${context}`}
          onValueChange={(value) => {
            if (isNotificationFilter(value)) setFilter(value);
          }}
          options={filters.map((value) => ({ label: copy.filters[value], value }))}
          value={filter}
        />

        {filteredNotifications.length > 0 ? (
          <ul aria-label={title} className="notifications-page__list">
            {filteredNotifications.map((item) => {
              const Icon = item.category === "system" ? notificationIcons.system : notificationIcons[item.severity];
              const category = copy.filters[item.category];
              const metadata = [
                formatTemplate(copy.sourceLabel, "source", item.sourceName),
                formatTemplate(copy.categoryLabel, "category", category),
                formatPublishedAt(locale, item.publishedAt),
              ];

              return (
                <li className={`notifications-page__item notifications-page__item--${item.severity}`} key={item.id}>
                  <Icon aria-hidden="true" className="notifications-page__icon" size={28} weight={item.category === "system" ? "regular" : "fill"} />
                  <div className="notifications-page__item-content">
                    <h2 className="type-h3 notifications-page__item-title">{item.title}</h2>
                    <p className="type-caption notifications-page__metadata">{metadata.join(" · ")}</p>
                    <p className="type-body notifications-page__summary">{item.summary}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="notifications-page__empty" role="status">{copy.emptyState}</p>
        )}
      </div>
    </main>
  );
}
