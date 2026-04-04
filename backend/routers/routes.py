import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict

router = APIRouter()

# -----------------------
# API KEYS
# -----------------------
ORS_API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImQzNTZjNzFhZDZlNTRiYmE5M2EzODFmYWJhYWFiZTBhIiwiaCI6Im11cm11cjY0In0="
LOCATIONIQ_API_KEY = "pk.59507886437a440ac753714afa0d53c5"

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
# 🔎 LOCATION SEARCH (LocationIQ)
# ==========================================
@router.post("/search-location")
def search_location(data: SearchRequest):

    url = "https://us1.locationiq.com/v1/autocomplete"

    params = {
        "key": LOCATIONIQ_API_KEY,
        "q": data.query,
        "countrycodes": "in",
        "limit": 5,
        "format": "json"
    }

    response = requests.get(url, params=params, timeout=10)

    if response.status_code != 200:
        return []

    results = response.json()

    suggestions = []

    for place in results:
        suggestions.append({
            "label": place["display_name"],
            "coordinates": [
                float(place["lon"]),
                float(place["lat"])
            ]
        })

    return suggestions


# ==========================================
# 🚗 ROUTE USING ORS
# ==========================================
@router.post("/get-route")
def get_route(data: RouteRequest):

    cache_key = f"{data.from_coords}_{data.to_coords}"

    if cache_key in route_cache:
        return route_cache[cache_key]

    route_url = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

    body = {
        "coordinates": [
            data.from_coords,
            data.to_coords
        ],
        "alternative_routes": {
            "target_count": 3,
            "share_factor": 0.6,
            "weight_factor": 1.6
        },
    }

    response = requests.post(
        route_url,
        headers={
            "Authorization": ORS_API_KEY,
            "Content-Type": "application/json"
        },
        json=body,
        timeout=20
    )

    route_data = response.json()

    if "features" not in route_data:
        raise HTTPException(status_code=404, detail="Route not found")

    routes = []

    for feature in route_data["features"]:

        geometry = feature["geometry"]["coordinates"]
        summary = feature["properties"]["summary"]

        distance_m = summary["distance"]
        duration_s = summary["duration"]

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

        routes.append({
            "coordinates": geometry,
            "distance_km": distance_km,
            "duration": formatted_duration,
            "price": price
        })

    result = {
        "routes": routes
    }

    route_cache[cache_key] = result

    return result
