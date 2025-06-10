import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "../hooks/useAuth";
import { fetchClientUserLocation, fetchPublicRestaurants } from "../utils/Api";

// Blue icon for user
const blueIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
});

// Red icon for restaurants
const redIcon = new L.Icon({
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    shadowSize: [41, 41],
});

type Location = {
    latitude: number;
    longitude: number;
};

type Restaurant = {
    id: string;
    name: string;
    image?: string;
    layout?: any[];
    averageRating?: number;
    latitude: number;
    longitude: number;
};

const MapCenterer: React.FC<{ location: Location | null }> = ({ location }) => {
    const map = useMap();
    React.useEffect(() => {
        if (location) map.setView([location.latitude, location.longitude], 15);
    }, [location, map]);
    return null;
};


const UserLocationView: React.FC = () => {
    const { userData } = useAuth();
    const [location, setLocation] = useState<Location | null>(null);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

    useEffect(() => {
        const loadLocation = async () => {
            if (!userData?.id) return;
            try {
                const loc = await fetchClientUserLocation(userData.id);
                if (
                    loc &&
                    Number.isFinite(loc.latitude) &&
                    Number.isFinite(loc.longitude)
                ) {
                    setLocation({ latitude: loc.latitude, longitude: loc.longitude });
                } else {
                    console.warn("Invalid client user location", loc);
                }
            } catch (error) {
                console.error("Failed to fetch client user location", error);
            }
        };
        loadLocation();
    }, [userData?.id]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const data = await fetchPublicRestaurants();
                data.forEach((r: Restaurant) => {
                    if (
                        !Number.isFinite(r.latitude) ||
                        !Number.isFinite(r.longitude)
                    ) {
                        console.warn("Invalid lat/lng for restaurant", r);
                    }
                });
                setRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch public restaurants", error);
            }
        };
        loadRestaurants();
    }, []);

    return (
        <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem" }}>
            <h2 className="text-center text-blue-700 mb-4">User Location</h2>

            <MapContainer
                center={location ? [location.latitude, location.longitude] : [0, 0]}
                zoom={location ? 15 : 2}
                style={{
                    height: 400,
                    width: "100%",
                    borderRadius: 8,
                    border: "2px solid #2563eb",
                }}
                scrollWheelZoom={true}
                dragging={true}
                doubleClickZoom={true}
                zoomControl={true}
            >
                <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* User location blue marker */}
                {location &&
                    Number.isFinite(location.latitude) &&
                    Number.isFinite(location.longitude) && (
                        <Marker
                            position={[location.latitude, location.longitude]}
                            icon={blueIcon}
                        />
                    )}

                {/* Restaurants red markers with popups */}
                {restaurants.map(
                    (r) =>
                        Number.isFinite(r.latitude) &&
                        Number.isFinite(r.longitude) && (
                            <Marker
                                key={r.id}
                                position={[r.latitude, r.longitude]}
                                icon={redIcon}
                                title={r.name}
                            >
                                <Popup>{r.name}</Popup>
                            </Marker>
                        )
                )}

                <MapCenterer location={location} />
            </MapContainer>
        </div>
    );
};

export default UserLocationView;
