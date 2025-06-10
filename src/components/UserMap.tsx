import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import { fetchClientUserLocation, updateClientUserLocation } from "../utils/Api";

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

const LocationPicker = ({ onLocationSelected }: { onLocationSelected: (loc: Location) => void }) => {
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
    width: "100%",
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
    width: "100%",
};

const UserMap: React.FC = () => {
    const { userData, updateUser } = useAuth();
    const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
    const [address, setAddress] = useState<Address | null>(null);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [confirming, setConfirming] = useState(false);
    const lastFetchedLocation = useRef<Location | null>(null);

    // Fetch reverse geocode info
    const fetchAddress = async (latitude: number, longitude: number) => {
        if (
            lastFetchedLocation.current &&
            lastFetchedLocation.current.latitude === latitude &&
            lastFetchedLocation.current.longitude === longitude
        ) {
            return;
        }
        lastFetchedLocation.current = { latitude, longitude };
        setLoadingAddress(true);
        try {
            const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: "json",
                },
            });
            const data = response.data;
            setAddress({
                display_name: data.display_name,
                postcode: data.address?.postcode,
                city: data.address?.city || data.address?.town || data.address?.village,
                country: data.address?.country,
            });
        } catch (err) {
            console.error("Reverse geocode failed", err);
            setAddress(null);
        } finally {
            setLoadingAddress(false);
        }
    };

    // Load user location on mount from backend API
    useEffect(() => {
        const loadLocation = async () => {
            if (!userData?.id) {
                console.warn("No user ID available");
                return;
            }
            try {
                const location = await fetchClientUserLocation(userData.id);
                if (location) {
                    const loc = { latitude: location.latitude, longitude: location.longitude };
                    setSelectedLocation(loc);
                    fetchAddress(loc.latitude, loc.longitude);
                }
            } catch (error) {
                console.error("Failed to fetch client user location", error);
            }
        };

        loadLocation();
    }, [userData?.id]);  // add userData.id as dependency so it runs once available


    // Center map on location
    const MapCenterer: React.FC<{ location: Location | null }> = ({ location }) => {
        const map = useMap();
        useEffect(() => {
            if (location) map.setView([location.latitude, location.longitude], 15);
        }, [location, map]);
        return null;
    };

    const handleMapClick = (loc: Location) => {
        setSelectedLocation(loc);
        setAddress(null);
        setConfirming(false);
        fetchAddress(loc.latitude, loc.longitude);
    };

    const handleSaveLocation = () => {
        setConfirming(true);
    };

    const handleConfirm = async () => {
        if (!selectedLocation || !userData?.id) return;

        try {
            await updateClientUserLocation(userData.id, {
                latitude: selectedLocation.latitude,
                longitude: selectedLocation.longitude,
            });
            setConfirming(false);
            alert("Location saved!");
        } catch (err) {
            alert("Failed to save location.");
        }
    };

    const handleCancel = () => {
        setConfirming(false);
    };

    return (
        <>
            {confirming && address && (
                <div style={modalOverlayStyle}>
                    <div style={modalContentStyle}>
                        <h3 style={{ marginTop: 0, marginBottom: "1rem", color: "#1e40af" }}>
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
                        <div style={{ marginTop: "1.5rem", display: "flex", gap: "1rem" }}>
                            <button
                                style={buttonPrimaryStyle}
                                onClick={handleConfirm}
                                onMouseEnter={() => {}}
                                onMouseLeave={() => {}}
                            >
                                Confirm
                            </button>
                            <button
                                style={buttonSecondaryStyle}
                                onClick={handleCancel}
                                onMouseEnter={() => {}}
                                onMouseLeave={() => {}}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div style={{ maxWidth: 700, margin: "2rem auto", padding: "0 1rem" }}>
                <h2 className="text-center text-blue-700 mb-4">My Location</h2>

                <MapContainer
                    center={
                        selectedLocation
                            ? [selectedLocation.latitude, selectedLocation.longitude]
                            : [0, 0]
                    }
                    zoom={selectedLocation ? 15 : 2}
                    style={{ height: 400, width: "100%", borderRadius: 8, border: "2px solid #2563eb" }}
                    scrollWheelZoom={true}
                >
                    <TileLayer
                        attribution="&copy; OpenStreetMap contributors"
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <LocationPicker onLocationSelected={handleMapClick} />
                    {selectedLocation && <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} />}
                    <MapCenterer location={selectedLocation} />
                </MapContainer>

                {loadingAddress && (
                    <p className="mt-4 text-center text-gray-600 italic">Fetching address info...</p>
                )}

                {!loadingAddress && address && (
                    <p className="mt-4 text-center text-gray-600">
                        <strong>Address:</strong> {address.display_name}
                    </p>
                )}

                {!confirming && (
                    <button
                        onClick={handleSaveLocation}
                        disabled={!selectedLocation}
                        className="block mx-auto mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        Save Location
                    </button>
                )}
            </div>
        </>
    );
};

export default UserMap;
