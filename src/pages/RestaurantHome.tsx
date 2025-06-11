import React, { useState, useEffect } from "react";
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx";
import Logout from "../components/Logout.tsx";
import { fetchGridLayout, saveGridLayout } from "../utils/TableApi.ts";
import { Table } from "../utils/TableApi";
import {fetchPendingReservationsCount as fetchNotificationsCount,  getRestaurant, saveRestaurant } from "../utils/RestaurantApi.ts";
import RestaurantReservations from "../components/RestaurantReservations.tsx";
import { motion } from "framer-motion";
import Menu from "../components/Menu.tsx";
import Map from "../components/Map.tsx";
import { Image, LayoutGrid, CalendarDays, Bell, Utensils, Map as MapIcon, LogOut, UserRound } from 'lucide-react'; // Import Lucide icons

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
    const [pendingReservationsCount, setPendingReservationsCount] = useState<number>(0); // State for the badge count

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

    // On mount: load user, grid, restaurant image, and pending reservations count
    useEffect(() => {
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
            const parsed = JSON.parse(storedUserInfo);
            setUserInfo(parsed);

            const fetchData = async (restaurantId: string) => {
                try {
                    const fetchedGrid = await fetchGridLayout(restaurantId);
                    setGrid(loadGrid(fetchedGrid));

                    const restaurantDetails = await getRestaurant(restaurantId);
                    if (restaurantDetails.imageBase64) {
                        setRestaurantImage(restaurantDetails.imageBase64);
                    }

                    // Fetch pending reservations count for the badge
                    const count = await fetchNotificationsCount(restaurantId); // Using the renamed import
                    setPendingReservationsCount(count);

                } catch (error) {
                    console.error("Error fetching data:", error);
                } finally {
                    setLoading(false);
                }
            };

            fetchData(parsed.id);
        } else {
            console.error("User info not found in local storage.");
            setLoading(false);
        }
    }, []);

    // Effect to periodically refresh the pending reservations count
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (userInfo?.id) {
            const refreshCount = async () => {
                try {
                    const count = await fetchNotificationsCount(userInfo.id); // Using the renamed import
                    setPendingReservationsCount(count);
                } catch (error) {
                    console.error("Error refreshing pending reservations count:", error);
                }
            };

            interval = setInterval(refreshCount, 15000); // Refresh every 15 seconds
        }

        return () => {
            if (interval) clearInterval(interval); // Clean up interval on unmount
        };
    }, [userInfo?.id]);

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
            console.log("Image data:", restaurantImage);

            const response = await saveRestaurant({
                id: userInfo.id,
                image: restaurantImage,
            });

            console.log("Image save response:", response);
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
            className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 font-inter" // Added overall padding and Inter font
        >
            {/* Sidebar */}
            {/* Removed ml-4 and my-4 from aside, and instead applied p-4 to the parent div */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 space-y-3 shadow-2xl rounded-2xl">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-100">Restaurant Dashboard</h3>
                {[
                    { label: "Image Upload", value: "image", icon: <Image className="w-5 h-5" /> },
                    { label: "Grid Layout", value: "layout", icon: <LayoutGrid className="w-5 h-5" /> },
                    { label: "Reservations", value: "reservations", icon: <CalendarDays className="w-5 h-5" /> },
                    { label: "Notifications", value: "notifications", icon: <Bell className="w-5 h-5" /> },
                    { label: "Menu", value: "menu", icon: <Utensils className="w-5 h-5" /> },
                    { label: "Map", value: "map", icon: <MapIcon className="w-5 h-5" /> },
                    { label: "Personal Account", value: "logout", icon: <UserRound className="w-5 h-5" /> },
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setSelectedSection(item.value as any)}
                        className={`w-11/12 mx-auto flex items-center gap-3 py-3 px-4 rounded-xl text-left font-medium transition-all duration-300 relative group
                            ${selectedSection === item.value
                            ? "bg-white text-gray-900 font-semibold shadow-xl ring-2 ring-blue-500" // Stronger active state, ring
                            : "hover:bg-gray-700 hover:text-white" // Hover state
                        }
                        `}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="flex-grow">{item.label}</span>
                        {/* Conditional rendering of the pending count badge */}
                        {item.value === "notifications" && pendingReservationsCount > 0 && (
                            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
                                {pendingReservationsCount}
                            </span>
                        )}
                    </button>
                ))}
                {/* Logout button moved to the bottom of the sidebar logically */}

            </aside>


            {/* Main Content */}
            {/* Removed my-4 and mr-4, adjusted rounding to match sidebar */}
            <div className="flex-1 p-10 bg-white shadow-xl rounded-2xl overflow-y-auto ml-4">
                {/* Dynamically render section title based on selectedSection */}
                <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
                    {selectedSection === "image" && "Restaurant Image Upload"}
                    {selectedSection === "layout" && "Restaurant Floor Plan"}
                    {selectedSection === "reservations" && "Manage Reservations"}
                    {selectedSection === "notifications" && "Reservation Notifications"}
                    {selectedSection === "menu" && "Manage Restaurant Menu"}
                    {selectedSection === "map" && "Restaurant Location Map"}
                    {selectedSection === "logout" && "Personal Account Settings"}
                </h2>

                <div className="space-y-8"> {/* Consistent spacing for content */}
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
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
                            >
                                Save Image
                            </button>
                        </>
                    )}

                    {selectedSection === "layout" && (
                        <>
                            {loading ? (
                                <div className="text-gray-600 italic">Loading grid layout...</div>
                            ) : (
                                <>
                                    <GridLayout
                                        grid={grid}
                                        selectedSeats={selectedSeats}
                                        mode={mode}
                                        toggleCell={toggleCell}
                                    />
                                    <button
                                        onClick={saveCurrentGridLayout}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
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
                        <div className="flex flex-col items-center max-w-lg mx-auto bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200">
                            <UserRound className="w-16 h-16 text-blue-600 mb-6" />
                            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Personal Account</h3>
                            {userInfo && (
                                <div className="text-center mb-6 text-gray-700">
                                    <p className="text-sm font-medium">Restaurant:</p>
                                    <p className="text-xl font-bold mb-1">{userInfo.restaurantName}</p>
                                    <p className="text-md font-light">{userInfo.email}</p>
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
