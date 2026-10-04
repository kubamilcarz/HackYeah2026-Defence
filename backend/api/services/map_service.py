"""Small, transient Mapbox Search Box adapter for nearby critical places."""
from __future__ import annotations

import json
import math
from datetime import datetime, timezone
from urllib.parse import urlencode
from urllib.request import urlopen
from django.conf import settings


def distance_km(lat1, lon1, lat2, lon2):
    radius = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi, delta_lon = math.radians(lat2 - lat1), math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lon / 2) ** 2
    return radius * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class MapboxPlacesService:
    endpoint = "https://api.mapbox.com/search/searchbox/v1/forward"

    def __init__(self, token=None):
        self.token = token if token is not None else getattr(settings, "MAPBOX_SEARCH_TOKEN", "")

    def search(self, *, lat, lon, radius_km, place_type, query, locale):
        if not self.token:
            raise ValueError("MAPBOX_SEARCH_TOKEN is not configured.")
        term = query or ("hospital" if place_type == "hospital" else "pharmacy")
        params = {
            "q": term,
            "access_token": self.token,
            "proximity": f"{lon},{lat}",
            "language": locale,
            "limit": 10,
            "poi_category": place_type,
        }
        try:
            with urlopen(f"{self.endpoint}?{urlencode(params)}", timeout=8) as response:
                payload = json.load(response)
        except Exception as exc:
            raise ConnectionError("Mapbox Search is unavailable.") from exc

        fetched_at = datetime.now(timezone.utc).isoformat()
        results = []
        for feature in payload.get("features", []):
            coordinates = feature.get("geometry", {}).get("coordinates", [])
            if len(coordinates) < 2:
                continue
            item_lon, item_lat = coordinates[:2]
            dist = distance_km(lat, lon, item_lat, item_lon)
            if dist > radius_km:
                continue
            properties = feature.get("properties", {})
            results.append({
                "id": f"mapbox:{feature.get('properties', {}).get('mapbox_id', feature.get('id'))}",
                "type": place_type,
                "title": properties.get("name") or feature.get("name") or term,
                "address": properties.get("full_address") or feature.get("place_name") or "",
                "latitude": item_lat,
                "longitude": item_lon,
                "distance_km": round(dist, 2),
                "accessibility": None,
                "source": "Mapbox Search",
                "retrieved_at": fetched_at,
                "temporary": True,
            })
        return results
