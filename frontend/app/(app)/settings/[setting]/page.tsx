import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageNavigationBar } from "@/components/ui/PageNavigationBar";

const placeholderPages = {
  about: {
    description: "Application version and project information will appear here.",
    title: "About PLAN:0",
  },
  "announcements-alerts": {
    description: "Announcements from official and trusted sources will appear here when they are available. Follow official local instructions during an emergency.",
    title: "Announcements & alerts",
  },
  guides: {
    description: "Preparedness guides tailored to your household will appear here.",
    title: "Guides",
  },
  "important-numbers": {
    description: "Important emergency and support numbers will appear here.",
    title: "Important numbers",
  },
  notifications: {
    description: "Notification delivery preferences will be available here.",
    title: "Notifications",
  },
  preferences: {
    description: "Application preferences will be available here.",
    title: "Preferences",
  },
  profile: {
    description: "Your account and household profile details will appear here.",
    title: "My profile",
  },
} as const;

type SettingsPlaceholderPageProps = {
  params: Promise<{ setting: string }>;
};

async function getPlaceholderPage(params: SettingsPlaceholderPageProps["params"]) {
  const { setting } = await params;
  return placeholderPages[setting as keyof typeof placeholderPages];
}

export async function generateMetadata({ params }: SettingsPlaceholderPageProps): Promise<Metadata> {
  const page = await getPlaceholderPage(params);
  return page ? { title: page.title } : {};
}

export default async function SettingsPlaceholderPage({ params }: SettingsPlaceholderPageProps) {
  const page = await getPlaceholderPage(params);

  if (!page) {
    notFound();
  }

  return (
    <main className="settings-page">
      <PageNavigationBar backHref="/settings" backLabel="Back to Settings" title={page.title} />
      <div className="settings-page__content settings-page__content--detail settings-page__placeholder">
        <h1 className="type-h1">{page.title}</h1>
        <p className="type-body settings-page__placeholder-description">{page.description}</p>
        <p className="type-caption settings-page__placeholder-status" role="status">Coming soon</p>
      </div>
    </main>
  );
}
