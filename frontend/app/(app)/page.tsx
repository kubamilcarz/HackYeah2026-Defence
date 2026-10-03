import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Home" };

export default function HomePage() {
  return (
    <PlaceholderScreen
      description="Your household readiness overview will appear here."
      title="Home"
    />
  );
}
