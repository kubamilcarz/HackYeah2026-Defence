import type { Metadata } from "next";
import { PlaceholderScreen } from "@/components/app/PlaceholderScreen";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return (
    <PlaceholderScreen
      description="Nearby shelters and other important locations will appear here when sourced information is available."
      title="Map"
    />
  );
}
