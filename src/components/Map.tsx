import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import {updateRestaurantLocation, fetchRestaurantLocation,} from "../utils/RestaurantApi.ts";

type Location = {
    latitude: number;
    longitude: number;
};

type Address = {
    display_name: string;
    postcode?: string;
    city?: string;
    country?: string;
};

const LocationPicker = ({
                            onLocationSelected,
                        }: {
    onLocationSelected: (loc: Location) => void;
}) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onLocationSelected({ latitude: lat, longitude: lng });
        },
    });
    return null;
};

const modalOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: 8,
    padding: "1.5rem 2rem",
    maxWidth: 400,
    width: "90%",
    boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
    textAlign: "left",
};

const buttonPrimaryStyle: React.CSSProperties = {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: 4,
    padding: "0.5rem 1.2rem",
    cursor: "pointer",
    fontWeight: "bold",
    marginRight: "1rem",
    transition: "background-color 0.3s",
};

const buttonPrimaryHoverStyle: React.CSSProperties = {
    backgroundColor: "#1d4ed8",
};

const buttonSecondaryStyle: React.CSSProperties = {
    backgroundColor: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: 4,
    padding: "0.5rem 1.2rem",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.3s",
};

const zoomButtonStyle: React.CSSProperties = {
    position: "fixed",
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#2563eb",
    borderRadius: 6,
    boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
    cursor: "pointer",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    color: "white",
    fontWeight: "bold",
    fontSize: 18,
    zIndex: 1100,
    userSelect: "none",
    transition: "all 0.3s ease",
};

const overlayBehindStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: "100vw",
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 1000,
};

const RestaurantLocationMap: React.FC<{ restaurantId: string }> = ({
                                                                       restaurantId,
                                                                   }) => {
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [address, setAddress] = useState<Address | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const [buttonPrimaryHovered, setButtonPrimaryHovered] = useState(false);
    const [buttonSecondaryHovered, setButtonSecondaryHovered] = useState(false);
    const [zoomed, setZoomed] = useState(false); // New state for zoom toggle

    const lastFetchedLocation = useRef<Location | null>(null);

    const fetchAddress = async (latitude: number, lng: number) => {
        console.log("Reverse geocode params:", { latitude, lon: lng });

        if (latitude == null || lng == null || isNaN(latitude) || isNaN(lng)) {
            console.warn("Invalid lat/lon, skipping reverse geocode");
            setAddress(null);
            setLoadingAddress(false);
            return;
        }

        if (
            lastFetchedLocation.current &&
            lastFetchedLocation.current.latitude === latitude &&
            lastFetchedLocation.current.longitude === lng
        ) {
            return;
        }

        lastFetchedLocation.current = { latitude, longitude: lng };

        setLoadingAddress(true);
        try {
            const response = await axios.get(
                `https://nominatim.openstreetmap.org/reverse`,
                {
                    params: {
                        lat: latitude,
                        lon: lng,
                        format: "json",
                    },
                }
            );
            const data = response.data;
            setAddress({
                display_name: data.display_name,
                postcode: data.address.postcode,
                city: data.address.city || data.address.town || data.address.village,
                country: data.address.country,
            });
        } catch (error) {
            console.error("Failed to fetch address", error);
            setAddress(null);
        } finally {
            setLoadingAddress(false);
        }
    };

    const MapZoomToLocation: React.FC<{ location: Location | null }> = ({
                                                                            location,
                                                                        }) => {
        const map = useMap();

        useEffect(() => {
            if (location) {
                map.setView([location.latitude, location.longitude], 15);
            }
        }, [location, map]);

        return null;
    };

    const handleMapClick = (loc: Location) => {
        if (!loc || isNaN(loc.latitude) || isNaN(loc.longitude)) {
            console.warn("Invalid location clicked");
            return;
        }

        setSelectedLocation(loc);
        setAddress(null);
        setConfirming(false);
        fetchAddress(loc.latitude, loc.longitude);
    };

    const handleSaveLocation = () => {
        setConfirming(true);
    };

    const handleConfirm = async () => {
        if (!selectedLocation) return;
        await updateRestaurantLocation(restaurantId, {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
        });
        setConfirming(false);
    };

    useEffect(() => {
        const loadLocation = async () => {
            try {
                const location = await fetchRestaurantLocation(restaurantId);
                const loc = { latitude: location.latitude, longitude: location.longitude };
                setSelectedLocation(loc);
                fetchAddress(loc.latitude, loc.longitude);
            } catch (error) {
                console.error("Failed to fetch restaurant location", error);
            }
        };

        loadLocation();
    }, [restaurantId]);

    return (
        <>
            {/* Overlay when zoomed */}
            {zoomed && <div style={overlayBehindStyle} onClick={() => setZoomed(false)} />}

            <div
                style={{
                    maxWidth: 720,
                    margin: "1rem auto",
                    padding: "0 1rem",
                    position: "relative",
                    zIndex: zoomed ? 1100 : "auto", // bring on top when zoomed
                }}
            >
                <h2
                    style={{ textAlign: "center", marginBottom: "1rem", color: "#1e40af" }}
                >
                    Select Restaurant Location
                </h2>

                <MapContainer
                    center={
                        selectedLocation
                            ? [selectedLocation.latitude, selectedLocation.longitude]
                            : [0, 0]
                    }
                    zoom={selectedLocation ? 15 : 2}
                    style={{
                        height: zoomed ? "80vh" : "400px", // bigger height on zoom
                        width: zoomed ? "90vw" : "100%",
                        borderRadius: 8,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                        border: "3px solid #2563eb", // Added border
                        transition: "all 0.3s ease",
                    }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker onLocationSelected={handleMapClick} />
                    {selectedLocation && (
                        <Marker
                            position={[selectedLocation.latitude, selectedLocation.longitude]}
                        />
                    )}
                    <MapZoomToLocation location={selectedLocation} />
                </MapContainer>

                {selectedLocation && !confirming && (
                    <button
                        onClick={handleSaveLocation}
                        style={{
                            ...buttonPrimaryStyle,
                            marginTop: "1rem",
                            display: "block",
                            width: "100%",
                            maxWidth: 200,
                            marginLeft: "auto",
                            marginRight: "auto",
                        }}
                        onMouseEnter={() => setButtonPrimaryHovered(true)}
                        onMouseLeave={() => setButtonPrimaryHovered(false)}
                    >
                        Save Location
                    </button>
                )}

                {loadingAddress && (
                    <p
                        style={{
                            marginTop: "1rem",
                            textAlign: "center",
                            color: "#6b7280",
                            fontStyle: "italic",
                        }}
                    >
                        Fetching address info...
                    </p>
                )}

                {confirming && address && (
                    <div style={modalOverlayStyle}>
                        <div style={modalContentStyle}>
                            <h3
                                style={{ marginTop: 0, marginBottom: "1rem", color: "#1e40af" }}
                            >
                                Confirm Location
                            </h3>
                            <p>
                                <strong>Address:</strong> {address.display_name}
                            </p>
                            <p>
                                <strong>Postal Code:</strong> {address.postcode || "N/A"}
                            </p>
                            <p>
                                <strong>City:</strong> {address.city || "N/A"}
                            </p>
                            <p>
                                <strong>Country:</strong> {address.country || "N/A"}
                            </p>

                            <div style={{ marginTop: "1.5rem", textAlign: "right" }}>
                                <button
                                    onClick={() => setConfirming(false)}
                                    style={{
                                        ...buttonSecondaryStyle,
                                        marginRight: "1rem",
                                    }}
                                    onMouseEnter={() => setButtonSecondaryHovered(true)}
                                    onMouseLeave={() => setButtonSecondaryHovered(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirm}
                                    style={buttonPrimaryStyle}
                                    onMouseEnter={() => setButtonPrimaryHovered(true)}
                                    onMouseLeave={() => setButtonPrimaryHovered(false)}
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Zoom toggle button */}
            <div
                role="button"
                aria-label={zoomed ? "Close zoom" : "Zoom map"}
                tabIndex={0}
                onClick={() => setZoomed(!zoomed)}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setZoomed(!zoomed);
                    }
                }}
                style={{
                    ...zoomButtonStyle,
                    backgroundColor: zoomed ? "#ef4444" : "#2563eb", // red when zoomed
                }}
            >
                {zoomed ? "✕" : "🔍"}
            </div>
        </>
    );
};

export default RestaurantLocationMap;
