# from fastapi import APIRouter, HTTPException
# from pydantic import BaseModel
# import httpx
# import os
# from typing import Dict, Any, List

# router = APIRouter(tags=["routes"], prefix="/routes")


# class RouteRequest(BaseModel):
#     from_lat: float
#     from_lon: float
#     to_lat: float
#     to_lon: float


# ORS_API_KEY = os.getenv("ORS_API_KEY")


# def ensure_ors_key() -> str:
#     if not ORS_API_KEY:
#         raise HTTPException(500, "ORS_API_KEY missing in backend .env")
#     return ORS_API_KEY


# @router.get("/geocode")
# async def geocode_location(query: str) -> Dict[str, Any]:
#     """
#     Geocode using OpenRouteService /geocode/search.
#     Docs: https://openrouteservice.org/dev/#/api-docs/geocode/search
#     """
#     api_key = ensure_ors_key()
#     url = "https://api.openrouteservice.org/geocode/search"
#     params = {
#         "api_key": api_key,
#         "text": query,
#         "size": 5,
#     }

#     async with httpx.AsyncClient(timeout=20.0) as client:
#         resp = await client.get(url, params=params)
#         print("ORS GEOCODE STATUS:", resp.status_code, resp.text[:200])
#         if resp.status_code != 200:
#             raise HTTPException(
#                 400, f"ORS geocode error {resp.status_code}: {resp.text[:300]}"
#             )

#         data = resp.json()
#         features: List[Dict[str, Any]] = data.get("features", [])
#         if not features:
#             raise HTTPException(404, f"No results for '{query}'")

#         top = features[0]
#         coords = top["geometry"]["coordinates"]  # [lon, lat]
#         lon, lat = float(coords[0]), float(coords[1])
#         label = top.get("properties", {}).get("label", query)

#         return {
#             "latitude": lat,
#             "longitude": lon,
#             "formatted_address": label,
#             "results": [
#                 {
#                     "lat": float(f["geometry"]["coordinates"][1]),
#                     "lon": float(f["geometry"]["coordinates"][0]),
#                     "address": f.get("properties", {}).get("label", ""),
#                 }
#                 for f in features
#             ],
#         }


# @router.post("/")
# async def get_routes(req: RouteRequest) -> Dict[str, Any]:
#     """
#     Routing using OpenRouteService /v2/directions/driving-car.
#     Docs: https://openrouteservice.org/dev/#/api-docs/v2/directions/{profile}/post
#     """
#     api_key = ensure_ors_key()
#     url = "https://api.openrouteservice.org/v2/directions/driving-car"

#     body = {
#         "coordinates": [
#             [req.from_lon, req.from_lat],  # ORS expects [lon, lat]
#             [req.to_lon, req.to_lat],
#         ],
#         "instructions": False,
#         "geometry": True,
#     }

#     headers = {
#         "Authorization": api_key,
#         "Content-Type": "application/json",
#     }

#     async with httpx.AsyncClient(timeout=30.0) as client:
#         resp = await client.post(url, json=body, headers=headers)
#         if resp.status_code != 200:
#             raise HTTPException(
#                 400, f"ORS route error {resp.status_code}: {resp.text[:300]}"
#             )

#         data = resp.json()
#         features = data.get("features", [])
#         if not features:
#             raise HTTPException(404, "No route found")

#         feat = features[0]
#         geom = feat.get("geometry", {})
#         coords = geom.get("coordinates", [])  # list of [lon, lat]
#         summary = feat.get("properties", {}).get("summary", {})

#         # Convert to [lat, lon] for react-native-maps Polyline
#         poly_coords = [
#             [float(c[1]), float(c[0])] for c in coords
#         ]

#         return {
#             "coordinates": poly_coords,
#             "distance": summary.get("distance", 0),  # meters
#             "duration": summary.get("duration", 0) / 60,  # minutes
#         }
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
