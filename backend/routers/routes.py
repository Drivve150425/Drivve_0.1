import requests
import polyline
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import logging

router = APIRouter()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

GMAP_API_KEY = "AIzaSyDUmZXstmZbpfNFfN-J08fc5Qac5AOfQMw"

# Cache with expiry (optional)
route_cache: Dict[str, dict] = {}

BASE_FARE = 50
PER_KM_RATE = 12
PER_MIN_RATE = 2

class RouteRequest(BaseModel):
    from_coords: list
    to_coords: list

class SearchRequest(BaseModel):
    query: str


@router.post("/get-route")
def get_route(data: RouteRequest):
    """Get route between two points using Google Routes API"""
    
    cache_key = f"{data.from_coords}_{data.to_coords}"
    
    # Check cache
    if cache_key in route_cache:
        logger.info(f"Returning cached route for {cache_key}")
        return route_cache[cache_key]
    
    try:
        logger.info(f"Fetching route from {data.from_coords} to {data.to_coords}")
        
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
        
        response = requests.post(route_url, headers=headers, json=body, timeout=30)
        
        # Check if request was successful
        if response.status_code != 200:
            logger.error(f"Google Routes API error: {response.status_code} - {response.text}")
            # Return fallback route data instead of failing
            return get_fallback_route(data.from_coords, data.to_coords)
        
        route_data = response.json()
        
        if "routes" not in route_data or not route_data["routes"]:
            logger.warning("No routes found, using fallback")
            return get_fallback_route(data.from_coords, data.to_coords)
        
        routes = []
        
        for route in route_data["routes"]:
            encoded_polyline = route.get("polyline", {}).get("encodedPolyline", "")
            distance_m = route.get("distanceMeters", 0)
            duration_str = route.get("duration", "0s")
            
            # Parse duration
            duration_s = 0
            if isinstance(duration_str, str) and duration_str.endswith("s"):
                try:
                    duration_s = int(duration_str[:-1])
                except ValueError:
                    duration_s = 0
            elif isinstance(duration_str, (int, float)):
                duration_s = int(duration_str)
            
            distance_km = round(distance_m / 1000, 1)
            
            hours = int(duration_s // 3600)
            minutes = int((duration_s % 3600) // 60)
            
            formatted_duration = f"{hours} Hr {minutes} Min" if hours > 0 else f"{minutes} Min"
            
            price = round(BASE_FARE + (distance_km * PER_KM_RATE) + ((duration_s / 60) * PER_MIN_RATE), 2)
            
            # Decode polyline
            decoded_coords = []
            if encoded_polyline:
                try:
                    lat_lngs = polyline.decode(encoded_polyline)
                    decoded_coords = [[lng, lat] for lat, lng in lat_lngs]
                except Exception as e:
                    logger.error(f"Polyline decode error: {str(e)}")
                    decoded_coords = create_dummy_coordinates(data.from_coords, data.to_coords)
            
            routes.append({
                "coordinates": decoded_coords,
                "distance_km": distance_km,
                "duration": formatted_duration,
                "price": price
            })
        
        result = {"routes": routes}
        route_cache[cache_key] = result
        return result
        
    except requests.exceptions.Timeout:
        logger.error("Google Routes API timeout")
        return get_fallback_route(data.from_coords, data.to_coords)
    except requests.exceptions.ConnectionError:
        logger.error("Google Routes API connection error")
        return get_fallback_route(data.from_coords, data.to_coords)
    except Exception as e:
        logger.error(f"Route fetch error: {str(e)}")
        return get_fallback_route(data.from_coords, data.to_coords)


def get_fallback_route(from_coords: List[float], to_coords: List[float]) -> dict:
    """Return fallback route data when API fails"""
    
    # Calculate straight line distance (as crow flies)
    from math import radians, sin, cos, sqrt, atan2
    
    lat1, lon1 = from_coords[1], from_coords[0]
    lat2, lon2 = to_coords[1], to_coords[0]
    
    R = 6371  # Earth's radius in km
    dlat = radians(lat2 - lat1)
    dlon = radians(lon2 - lon1)
    a = sin(dlat/2) * sin(dlat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2) * sin(dlon/2)
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    straight_distance = R * c
    
    # Estimate road distance (20-30% more than straight line)
    estimated_distance = round(straight_distance * 1.25, 1)
    
    # Estimate duration (average speed 40 km/h)
    estimated_minutes = int((estimated_distance / 40) * 60)
    hours = estimated_minutes // 60
    minutes = estimated_minutes % 60
    formatted_duration = f"{hours} Hr {minutes} Min" if hours > 0 else f"{minutes} Min"
    
    # Estimate price
    estimated_price = round(BASE_FARE + (estimated_distance * PER_KM_RATE) + (estimated_minutes * PER_MIN_RATE), 2)
    
    # Create dummy coordinates (straight line points)
    coordinates = create_dummy_coordinates(from_coords, to_coords)
    
    return {
        "routes": [{
            "coordinates": coordinates,
            "distance_km": estimated_distance,
            "duration": formatted_duration,
            "price": estimated_price
        }]
    }


def create_dummy_coordinates(from_coords: List[float], to_coords: List[float], num_points: int = 10) -> List[List[float]]:
    """Create dummy coordinates for fallback route"""
    
    from_lng, from_lat = from_coords
    to_lng, to_lat = to_coords
    
    coordinates = []
    for i in range(num_points + 1):
        t = i / num_points
        lng = from_lng + (to_lng - from_lng) * t
        lat = from_lat + (to_lat - from_lat) * t
        coordinates.append([lng, lat])
    
    return coordinates


@router.post("/search-location")
def search_location(data: SearchRequest):
    """Search location using Google Places API"""
    
    try:
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
            logger.error(f"Places API error: {response.status_code}")
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
                "coordinates": [float(lng), float(lat)]
            })
        
        return suggestions
        
    except Exception as e:
        logger.error(f"Location search error: {str(e)}")
        return []