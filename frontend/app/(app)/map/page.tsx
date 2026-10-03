import type { Metadata } from "next";
import { MapScreen } from "@/components/app/MapScreen";

export const metadata: Metadata = { title: "Map" };

export default function MapPage() {
  return <MapScreen />;
}
