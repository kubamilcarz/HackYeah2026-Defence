"use client";

import { ArrowRight, Compass, Crosshair, MapPin } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { Map, type MapMarker, type MapPosition } from "@/components/ui/Map";
import { IconButton } from "@/components/ui/Button";
import { SearchField } from "@/components/ui/FormControls";
import { useLocalization } from "@/components/localization/LocalizationProvider";
import {
  getEmergencyPlanServerSnapshot,
  getEmergencyPlanSnapshot,
  subscribeToEmergencyPlan,
} from "@/components/app/emergency-plan";
import { getNearbyPlaces, type NearbyPlace } from "@/lib/api";
import { Alert } from "@/components/ui/Alert";

type SheetSize = "compact" | "browse" | "expanded";
type MapFilter = "plan" | "all" | "shelters" | "hospitals" | "pharmacies";

const SHEET_SIZES: SheetSize[] = ["compact", "browse", "expanded"];
const DEFAULT_CENTER: MapPosition = { lat: 50.0674, lng: 19.9915 };

export function MapScreen() {
  const { locale, messages } = useLocalization();
  const copy = messages.map;
  const emergencyPlan = useSyncExternalStore(subscribeToEmergencyPlan, getEmergencyPlanSnapshot, getEmergencyPlanServerSnapshot);
  const sheetLabels: Record<SheetSize, string> = copy.sizes;
  const mapFilters: { id: MapFilter; label: string }[] = [
    { id: "plan", label: copy.yourPlan }, { id: "all", label: copy.all }, { id: "shelters", label: copy.shelters }, { id: "hospitals", label: copy.hospitals }, { id: "pharmacies", label: copy.pharmacies },
  ];
  const [center, setCenter] = useState(DEFAULT_CENTER);
  const [locationStatus, setLocationStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<MapFilter>("all");
  const [sheetSize, setSheetSize] = useState<SheetSize>("browse");
  const [places, setPlaces] = useState<NearbyPlace[]>([]);
  const [placesError, setPlacesError] = useState("");
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [unavailableTypes, setUnavailableTypes] = useState<string[]>([]);
  const dragStartY = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (selectedFilter === "plan") return;
    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoadingPlaces(true);
      setPlacesError("");
      try {
        const types = selectedFilter === "all"
          ? "shelter,hospital,pharmacy"
          : ({ shelters: "shelter", hospitals: "hospital", pharmacies: "pharmacy" } as const)[selectedFilter];
        const response = await getNearbyPlaces({ lat: center.lat, lon: center.lng, locale, query: searchQuery.trim(), types });
        if (!controller.signal.aborted) {
          setPlaces(response.results);
          setUnavailableTypes(response.unavailable_types);
        }
      } catch {
        if (!controller.signal.aborted) {
          setPlaces([]);
          setPlacesError(copy.nearbyUnavailable);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoadingPlaces(false);
      }
    }, searchQuery ? 350 : 0);
    return () => { controller.abort(); window.clearTimeout(timeout); };
  }, [center, copy.nearbyUnavailable, locale, searchQuery, selectedFilter]);

  const markers = useMemo<MapMarker[]>(() => (selectedFilter === "plan" ? [] : places.map((place) => ({
    id: place.id, title: place.title, position: { lat: place.latitude, lng: place.longitude },
    description: `${place.address} · ${place.distance_km} km · ${place.source}`,
    tone: place.type === "shelter" ? "success" : "info",
  }))), [places, selectedFilter]);

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
      <Map ariaLabel={copy.ariaLabel} center={center} className="map-screen__map" markers={markers} onMoveEnd={setCenter} zoom={14} />
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
            clearLabel={copy.clearSearch}
            hideLabel
            label={copy.search}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder={copy.search}
            value={searchQuery}
          />

          {sheetSize !== "compact" && (
            <>
              {selectedFilter === "plan" && <section aria-labelledby="plan-places-heading" className="map-sheet__section">
                <div className="map-sheet__section-heading">
                  <h2 className="type-h3" id="plan-places-heading">{copy.planPlaces}</h2>
                  <Link className="map-sheet__text-link" href="/plan">{copy.managePlan}</Link>
                </div>
                <div className="map-sheet__setup-card">
                  <span aria-hidden="true" className="map-sheet__setup-icon"><MapPin size={24} weight="bold" /></span>
                  <div>
                    <h3 className="type-h3">{copy.primaryMeetingPlace}</h3>
                    <p className="type-caption">{emergencyPlan.primaryMeetingPlace || copy.meetingPlaceDescription}</p>
                    {emergencyPlan.backupMeetingPlace && <p className="type-caption">{emergencyPlan.backupMeetingPlace}</p>}
                  </div>
                  <Link aria-label={emergencyPlan.primaryMeetingPlace ? copy.managePlan : copy.addMeetingPlace} className="map-sheet__setup-action" href="/plan/details">
                    <span>{emergencyPlan.primaryMeetingPlace ? copy.managePlan : copy.add}</span><ArrowRight aria-hidden="true" size={20} weight="bold" />
                  </Link>
                </div>
              </section>}

              <section aria-labelledby="nearby-places-heading" className="map-sheet__section">
                <div className="map-sheet__section-heading">
                  <h2 className="type-h3" id="nearby-places-heading">{copy.nearbyPlaces}</h2>
                  <span className="type-caption">{copy.mapArea}</span>
                </div>
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
                {selectedFilter === "plan" ? <div className="map-sheet__nearby-empty"><Compass aria-hidden="true" size={24} weight="bold" /><p className="type-caption">{copy.meetingPlaceDescription}</p></div> : isLoadingPlaces ? <p className="type-caption" role="status">{copy.mapLoading}</p> : placesError ? <Alert description={placesError} title={copy.nearbyPlaces} variant="warning" /> : (
                  <>
                    {unavailableTypes.length > 0 && <Alert description={`${copy.nearbyUnavailable} (${unavailableTypes.join(", ")})`} title={copy.nearbyPlaces} variant="warning" />}
                    {places.length === 0 ? <div className="map-sheet__nearby-empty"><Compass aria-hidden="true" size={24} weight="bold" /><p className="type-caption">{copy.nearbyUnavailable}</p></div> : <ul className="map__marker-list">{places.map((place) => <li key={place.id}><article className="map-sheet__setup-card"><div><h3 className="type-h3">{place.title}</h3><p className="type-caption">{place.address}</p><p className="type-caption">{place.type} · {place.distance_km} km · {place.source}</p><p className="type-caption">{copy.updatedAt}: {new Intl.DateTimeFormat(locale, { dateStyle: "short", timeStyle: "short" }).format(new Date(place.retrieved_at))}</p>{place.accessibility && <p className="type-caption">{place.accessibility}</p>}</div></article></li>)}</ul>}
                  </>
                )}
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
