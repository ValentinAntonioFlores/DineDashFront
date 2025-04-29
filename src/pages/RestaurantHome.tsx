import React, { useState, useEffect } from "react";
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx";
import Logout from "../components/Logout.tsx";

interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

const RestaurantHome: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<"image" | "layout" | "reservations" | "logout">("image");
    const [grid, setGrid] = useState<Table[][]>(
        Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => ({ isTable: false, seats: 0, reserved: false }))
        )
    );
    const [selectedSeats, setSelectedSeats] = useState(4);
    const [mode, setMode] = useState<"seat" | "table" | "erase">("seat");
    const [restaurantImage, setRestaurantImage] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<{ restaurantName: string; email: string } | null>(null);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem("userInfo");
        if (storedUserInfo) {
            setUserInfo(JSON.parse(storedUserInfo));
        }
    }, []);

    const handleLogout = () => {
        const previousUserInfo = localStorage.getItem("userInfo");
        console.log("Previous User Info:", previousUserInfo);

        localStorage.setItem("userInfo", "null");
        console.log("Current User Info:", localStorage.getItem("userInfo"));
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
                    <ImageUpload restaurantImage={restaurantImage} onImageChange={(e) => setRestaurantImage(e)} />
                )}
                {selectedSection === "layout" && (
                    <GridLayout
                        grid={grid}
                        selectedSeats={selectedSeats}
                        mode={mode}
                        toggleCell={(row, col) => setGrid((prev) => {
                            const newGrid = [...prev.map((r) => [...r])];
                            const cell = newGrid[row][col];
                            if (mode === "seat" && cell.isTable) cell.seats = selectedSeats;
                            else if (mode === "table") {
                                cell.isTable = true;
                                cell.seats = selectedSeats;
                            } else if (mode === "erase") {
                                cell.isTable = false;
                                cell.seats = 0;
                            }
                            return newGrid;
                        })}
                        setMode={setMode}
                        setSelectedSeats={setSelectedSeats}
                    />
                )}
                {selectedSection === "reservations" && (
                    <ReservationsOverview grid={grid} toggleReservation={(row, col) => setGrid((prev) => {
                        const newGrid = [...prev.map((r) => [...r])];
                        const cell = newGrid[row][col];
                        if (cell.isTable) cell.reserved = !cell.reserved;
                        return newGrid;
                    })} />
                )}
                {selectedSection === "logout" && (
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-bold mb-4">Personal Account</h3>
                        {userInfo && (
                            <div className="mb-4">
                                <p className="text-sm">Name: {userInfo.restaurantName}</p>
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