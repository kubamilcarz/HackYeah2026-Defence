import { notFound } from "next/navigation";
import { SettingsPlaceholderScreen } from "@/components/app/SettingsPlaceholderScreen";

const placeholderPages = {
  about: "about",
  "announcements-alerts": "announcementsAlerts",
  preferences: "preferences",
  profile: "profile",
} as const;

type SettingsPlaceholderPageProps = {
  params: Promise<{ setting: string }>;
};

async function getPlaceholderPage(params: SettingsPlaceholderPageProps["params"]) {
  const { setting } = await params;
  return placeholderPages[setting as keyof typeof placeholderPages];
}

export default async function SettingsPlaceholderPage({ params }: SettingsPlaceholderPageProps) {
  const page = await getPlaceholderPage(params);

  if (!page) {
    notFound();
  }

  return <SettingsPlaceholderScreen page={page} />;
}
