"use client";

import { Crosshair } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Map, type MapPosition } from "@/components/ui/Map";
import { IconButton } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";
import { useLocalization } from "@/components/localization/LocalizationProvider";

type SheetSize = "compact" | "browse" | "expanded";
type MapFilter = "all" | "shelters" | "hospitals" | "pharmacies" | "meeting-places";

const SHEET_SIZES: SheetSize[] = ["compact", "browse", "expanded"];
const DEFAULT_CENTER: MapPosition = { lat: 50.0674, lng: 19.9915 };

export function MapScreen() {
  const { messages } = useLocalization();
  const copy = messages.map;
  const sheetLabels: Record<SheetSize, string> = copy.sizes;
  const mapFilters: { id: MapFilter; label: string }[] = [
    { id: "all", label: copy.all }, { id: "shelters", label: copy.shelters }, { id: "hospitals", label: copy.hospitals }, { id: "pharmacies", label: copy.pharmacies }, { id: "meeting-places", label: copy.meetingPlaces },
  ];
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationStatus, setLocationStatus] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const [sheetSize, setSheetSize] = useState<SheetSize>("browse");
  const dragStartY = useRef<number | undefined>(undefined);

  function resizeSheet(next: SheetSize) {
    setSheetSize(next);
  }

  function moveSheet(direction: -1 | 1) {
    const currentIndex = SHEET_SIZES.indexOf(sheetSize);
    const nextIndex = Math.min(SHEET_SIZES.length - 1, Math.max(0, currentIndex + direction));
    resizeSheet(SHEET_SIZES[nextIndex]);
  }

  function handleDragEnd(clientY: number) {
    if (dragStartY.current === undefined) return;

    const distance = clientY - dragStartY.current;
    dragStartY.current = undefined;
    if (Math.abs(distance) < 24) {
      moveSheet(1);
      return;
    }
    moveSheet(distance < 0 ? 1 : -1);
  }

  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocationStatus(copy.locationUnavailable);
      return;
    }

    setLocationStatus(copy.requestingLocation);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCenter({ lat: coords.latitude, lng: coords.longitude });
        setLocationStatus(copy.centeredOnLocation);
      },
      () => setLocationStatus(copy.locationDenied),
      { enableHighAccuracy: false, timeout: 10_000 },
    );
  }

  return (
    <main className={`map-screen map-screen--${sheetSize}`}>
      <Map ariaLabel={copy.ariaLabel} center={center} className="map-screen__map" zoom={14} />
      <p className="sr-only" role="status">{locationStatus}</p>

      <div className="map-screen__map-actions">
        <IconButton icon={Crosshair} label={copy.centerOnLocation} onClick={findMyLocation} />
      </div>

      <section aria-label={copy.searchAndLocations} className="map-sheet">
        <button
          aria-label={copy.resizePanel.replace("{size}", sheetLabels[sheetSize])}
          className="map-sheet__handle"
          onKeyDown={(event) => {
            if (event.key === "ArrowUp") {
              event.preventDefault();
              moveSheet(1);
            }
            if (event.key === "ArrowDown") {
              event.preventDefault();
              moveSheet(-1);
            }
            if (event.key === "Home") {
              event.preventDefault();
              resizeSheet("compact");
            }
            if (event.key === "End") {
              event.preventDefault();
              resizeSheet("expanded");
            }
          }}
          onPointerDown={(event) => {
            dragStartY.current = event.clientY;
            event.currentTarget.setPointerCapture(event.pointerId);
          }}
          onPointerUp={(event) => handleDragEnd(event.clientY)}
          type="button"
        >
          <span aria-hidden="true" className="map-sheet__handle-bar" />
        </button>

        <div className="map-sheet__context">
          <SearchField
            hideLabel
            clearLabel={copy.clearSearch}
            label={copy.search}
            placeholder={copy.search}
          />
          <div aria-label={copy.filterLocations} className="map-sheet__filters" role="group">
            {mapFilters.map((filter) => (
              <button
                aria-pressed={selectedFilter === filter.id}
                className="map-sheet__filter"
                key={filter.id}
                onClick={() => setSelectedFilter(filter.id)}
                type="button"
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
