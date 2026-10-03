import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Supplies" };

export default function SuppliesPage() {
  return (
    <PlaceholderScreen
      description="Your household supplies and readiness resources will appear here."
      title="Supplies"
    />
  );
}
