import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Plan" };

export default function PlanPage() {
  return (
    <PlaceholderScreen
      description="Your personalized preparedness plan and next steps will appear here."
      title="Plan"
    />
  );
}
