import type { Metadata } from "next";
import { LanguageSettingsScreen } from "./LanguageSettingsScreen";

export const metadata: Metadata = { title: "Language" };

export default function LanguageSettingsPage() {
  return <LanguageSettingsScreen />;
}
