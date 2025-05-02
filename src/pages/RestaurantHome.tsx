import React, { useState, useEffect } from "react";
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx";
import Logout from "../components/Logout.tsx";
import { fetchGridLayout, saveGridLayout } from "../utils/TableApi.ts";
import { Table } from "../utils/TableApi";
import {saveRestaurant} from "../utils/RestaurantApi.ts";

const RestaurantHome: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<"image" | "layout" | "reservations" | "logout">("image");
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
                    console.log("Fetched grid layout from backend:", fetchedGrid);
                    setGrid(loadGrid(fetchedGrid));
                } catch (error) {
                    console.error("Error fetching grid layout:", error);
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
                name: userInfo.restaurantName,
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
                    // Prevent toggling reserved cells
                    if (cell.reserved) return cell;

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
        <div className="flex h-screen">
            {/* Sidebar */}
            <div className="w-48 bg-gray-800 text-white flex flex-col items-center py-8">
                <button onClick={() => setSelectedSection("image")} className="mb-4 p-2 w-full hover:bg-gray-700">
                    📷 Image Upload
                </button>
                <button onClick={() => setSelectedSection("layout")} className="mb-4 p-2 w-full hover:bg-gray-700">
                    🪑 Grid Layout
                </button>
                <button onClick={() => setSelectedSection("reservations")} className="mb-4 p-2 w-full hover:bg-gray-700">
                    📅 Reservations
                </button>
                <button onClick={() => setSelectedSection("logout")} className="mb-4 p-2 w-full hover:bg-gray-700">
                    👤 Personal Account
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
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

                {selectedSection === "logout" && (
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-4">Personal Account</h3>
                        {userInfo && (
                            <div className="mb-4">
                                <p className="text-sm">Restaurant Name: {userInfo.restaurantName}</p>
                                <p className="text-sm">Email: {userInfo.email}</p>
                            </div>
                        )}
                        <Logout onLogout={handleLogout} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default RestaurantHome;
