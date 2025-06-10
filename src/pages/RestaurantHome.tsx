import React, { useState, useEffect } from "react";
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx";
import Logout from "../components/Logout.tsx";
import { fetchGridLayout, saveGridLayout } from "../utils/TableApi.ts";
import { Table } from "../utils/TableApi";
import {getRestaurant, saveRestaurant} from "../utils/RestaurantApi.ts";
import RestaurantReservations from "../components/RestaurantReservations.tsx";
import { motion } from "framer-motion";
import Menu from "../components/Menu.tsx";
import Map from "../components/Map.tsx";

const RestaurantHome: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<"image" | "layout" | "reservations" | "notifications" | "menu" | "map" | "logout">("image");
    const [grid, setGrid] = useState<Table[][]>(
        Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => ({ isTable: false, seats: 0, reserved: false }))
        )
    );
    const [selectedSeats, setSelectedSeats] = useState(4);
    const [mode, setMode] = useState<"table" | "erase">("table");
    const [restaurantImage, setRestaurantImage] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ id: string; restaurantName: string; email: string } | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const loadGrid = (gridData: any[][]): Table[][] => {
        const defaultGridSize = 10;
        const grid = gridData || [];

        // Expand rows if needed
        while (grid.length < defaultGridSize) {
            grid.push(new Array(defaultGridSize).fill({ isTable: false, seats: 0, reserved: false }));
        }

        // Expand columns in each row
        for (let i = 0; i < grid.length; i++) {
            while (grid[i].length < defaultGridSize) {
                grid[i].push({ isTable: false, seats: 0, reserved: false });
            }
        }

        // Normalize each cell
        return grid.map(row =>
            row.map(cell => ({
                isTable: cell?.isTable || false,
                seats: cell?.seats || 0,
                reserved: cell?.reserved || false,
            }))
        );
    };

    // On mount: load user and grid
    useEffect(() => {
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
            const parsed = JSON.parse(storedUserInfo);
            setUserInfo(parsed);

            const fetchData = async () => {
                try {
                    const fetchedGrid = await fetchGridLayout(parsed.id);
                    setGrid(loadGrid(fetchedGrid));

                    // 🔥 Fetch restaurant info (including image)
                    const restaurantDetails = await getRestaurant(parsed.id);
                    if (restaurantDetails.imageBase64) {
                        setRestaurantImage(restaurantDetails.imageBase64);
                    }
                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData();
        } else {
            console.error("User info not found in local storage.");
            setLoading(false);
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
        console.log("User Info Removed");
    };

    const saveCurrentGridLayout = async () => {
        if (!userInfo) {
            alert("Error: User not logged in. Cannot save layout.");
            return;
        }
        try {
            await saveGridLayout(userInfo.id, grid);
            alert("Grid layout saved successfully!");
        } catch (error) {
            console.error("Error saving grid layout:", error);
            alert("Failed to save grid layout.");
        }
    };

    const saveRestaurantImage = async () => {
        if (!userInfo || !restaurantImage) {
            console.error("Error: No user info or image to save.");
            return;
        }

        try {
            console.log("Saving image for restaurant:", userInfo.restaurantName);
            console.log("Image data:", restaurantImage); // Log the image data to confirm

            const response = await saveRestaurant({
                id: userInfo.id,
                image: restaurantImage,
            });

            console.log("Image save response:", response); // Log the response from the API
            alert("Image saved successfully!");
        } catch (err) {
            console.error("Error saving image", err);
            alert("Failed to save image");
        }
    };

    const toggleCell = (row: number, col: number) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    return rowIndex === row && colIndex === col
                        ? {
                            ...cell,
                            isTable: mode === "table",
                            seats: mode === "table" ? selectedSeats : 0,
                        }
                        : cell;
                })
            );
            return newGrid;
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
        <div className="flex h-screen">
            <div className="w-56 bg-gradient-to-b from-gray-900 to-gray-700 text-white flex flex-col items-center py-8 space-y-2 shadow-lg">
                {[
                    { label: "Image Upload", value: "image", icon: "📷" },
                    { label: "Grid Layout", value: "layout", icon: "🪑" },
                    { label: "Reservations", value: "reservations", icon: "📅" },
                    { label: "Notifications", value: "notifications", icon: "🔔" },
                    { label: "Menu", value: "menu", icon: "📋" },
                    { label: "Map", value: "map", icon: "🗺️"},
                    { label: "Personal Account", value: "logout", icon: "👤" },
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setSelectedSection(item.value as any)}
                        className={`w-11/12 py-2 px-4 rounded-lg text-left transition-all duration-200
                ${selectedSection === item.value ? "bg-white text-gray-900 font-semibold shadow-inner" : "hover:bg-gray-600"}
            `}

                    >
                        <span className="mr-2">{item.icon}</span>
                        {item.label}
                    </button>
                ))}
            </div>


            {/* Main Content */}
            <div className="flex-1 p-8 bg-gray-50 overflow-y-auto">
                {selectedSection === "image" && (
                    <>
                        <ImageUpload
                            restaurantImage={restaurantImage}
                            onImageChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = () => setRestaurantImage(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }}
                        />
                        <button
                            onClick={saveRestaurantImage}
                            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
                        >
                            Save Image
                        </button>
                    </>
                )}

                {selectedSection === "layout" && (
                    <>
                        {loading ? (
                            <div>Loading grid layout...</div>
                        ) : (
                            <>
                                <GridLayout
                                    grid={grid}
                                    selectedSeats={selectedSeats}
                                    mode={mode}
                                    toggleCell={toggleCell}
                                    setMode={setMode}
                                    setSelectedSeats={setSelectedSeats}
                                />
                                <button
                                    onClick={saveCurrentGridLayout}
                                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
                                >
                                    Save Grid Layout
                                </button>
                            </>
                        )}
                    </>
                )}

                {selectedSection === "reservations" && (
                    <ReservationsOverview grid={grid} toggleReservation={(row, col) => toggleCell(row, col)} />
                )}

                {selectedSection === "menu" && <Menu />}

                {selectedSection === "map" && userInfo && <Map restaurantId={userInfo.id} />}

                {selectedSection === "logout" && (
                    <div className="flex flex-col items-center max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-md">
                        <h3 className="text-2xl font-semibold text-gray-800 mb-4">Personal Account</h3>
                        {userInfo && (
                            <div className="text-center mb-6">
                                <p className="text-gray-600 text-sm">Restaurant:</p>
                                <p className="text-lg font-medium">{userInfo.restaurantName}</p>
                                <p className="text-gray-600 mt-1 text-sm">{userInfo.email}</p>
                            </div>
                        )}
                        <Logout onLogout={handleLogout} />
                    </div>
                )}

                {selectedSection === "notifications" && (
                    <RestaurantReservations />
                )}
            </div>
        </div>
        </motion.div>
    );
};

export default RestaurantHome;
