import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Family" };

export default function FamilyPage() {
  return (
    <PlaceholderScreen
      description="Your household members, contacts, roles, and meeting plans will appear here."
      title="Family"
    />
  );
}
