import requests
import polyline
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

# -----------------------
# API KEYS
# -----------------------
GMAP_API_KEY = "AIzaSyDUmZXstmZbpfNFfN-J08fc5Qac5AOfQMw"

# -----------------------
# CACHE
# -----------------------
route_cache: Dict[str, dict] = {}

# -----------------------
# PRICING CONFIG
# -----------------------
BASE_FARE = 50
PER_KM_RATE = 12
PER_MIN_RATE = 2


class RouteRequest(BaseModel):
    from_coords: list
    to_coords: list


class SearchRequest(BaseModel):
    query: str


# ==========================================
# 🔎 LOCATION SEARCH (Google Places API New)
# ==========================================
@router.post("/search-location")
def search_location(data: SearchRequest):

    autocomplete_url = "https://places.googleapis.com/v1/places:autocomplete"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GMAP_API_KEY,
    }

    body = {
        "input": data.query,
        "includedRegionCodes": ["in"],
    }

    response = requests.post(autocomplete_url, headers=headers, json=body, timeout=10)

    if response.status_code != 200:
        return []

    results = response.json()
    suggestions = []

    for suggestion in results.get("suggestions", [])[:3]:
        place_prediction = suggestion.get("placePrediction", {})
        place_id = place_prediction.get("placeId", "")
        display_text = place_prediction.get("text", {}).get("text", "")

        if not place_id:
            continue

        # Get place details for coordinates
        detail_url = f"https://places.googleapis.com/v1/places/{place_id}"
        detail_headers = {
            "X-Goog-Api-Key": GMAP_API_KEY,
            "X-Goog-FieldMask": "location",
        }
        detail_response = requests.get(detail_url, headers=detail_headers, timeout=10)

        if detail_response.status_code != 200:
            continue

        place_data = detail_response.json()
        location = place_data.get("location", {})
        lat = location.get("latitude")
        lng = location.get("longitude")

        if lat is None or lng is None:
            continue

        suggestions.append({
            "label": display_text,
            "coordinates": [
                float(lng),
                float(lat)
            ]
        })

    return suggestions


# ==========================================
# 🚗 ROUTE USING Google Routes API
# ==========================================
@router.post("/get-route")
def get_route(data: RouteRequest):

    cache_key = f"{data.from_coords}_{data.to_coords}"

    if cache_key in route_cache:
        return route_cache[cache_key]

    route_url = "https://routes.googleapis.com/directions/v2:computeRoutes"

    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GMAP_API_KEY,
        "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
    }

    body = {
        "origin": {
            "location": {
                "latLng": {
                    "latitude": data.from_coords[1],
                    "longitude": data.from_coords[0]
                }
            }
        },
        "destination": {
            "location": {
                "latLng": {
                    "latitude": data.to_coords[1],
                    "longitude": data.to_coords[0]
                }
            }
        },
        "travelMode": "DRIVE",
        "computeAlternativeRoutes": True,
    }

    response = requests.post(route_url, headers=headers, json=body, timeout=20)
    route_data = response.json()

    if "routes" not in route_data or not route_data["routes"]:
        raise HTTPException(status_code=404, detail="Route not found")

    routes = []

    for route in route_data["routes"]:
        encoded_polyline = route.get("polyline", {}).get("encodedPolyline", "")
        distance_m = route.get("distanceMeters", 0)
        duration_str = route.get("duration", "0s")

        # Parse duration (format: "1234s")
        duration_s = 0
        if isinstance(duration_str, str) and duration_str.endswith("s"):
            try:
                duration_s = int(duration_str[:-1])
            except ValueError:
                duration_s = 0
        elif isinstance(duration_str, int):
            duration_s = duration_str

        distance_km = round(distance_m / 1000, 1)

        hours = int(duration_s // 3600)
        minutes = int((duration_s % 3600) // 60)

        formatted_duration = (
            f"{hours} Hr {minutes} Min"
            if hours > 0
            else f"{minutes} Min"
        )

        price = round(
            BASE_FARE +
            (distance_km * PER_KM_RATE) +
            ((duration_s / 60) * PER_MIN_RATE),
            2
        )

        # Decode polyline to [lon, lat] coordinates
        decoded_coords = []
        if encoded_polyline:
            # polyline.decode returns [(lat, lng), ...]
            lat_lngs = polyline.decode(encoded_polyline)
            decoded_coords = [[lng, lat] for lat, lng in lat_lngs]

        routes.append({
            "coordinates": decoded_coords,
            "distance_km": distance_km,
            "duration": formatted_duration,
            "price": price
        })

    result = {
        "routes": routes
    }

    route_cache[cache_key] = result

    return result

