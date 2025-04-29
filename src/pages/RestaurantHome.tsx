import React, { useState } from "react";
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx"; // Import the ReservationsOverview component

// Define table type for grid state
interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

const RestaurantHome: React.FC = () => {
    const [selectedSection, setSelectedSection] = useState<"image" | "layout" | "reservations">("image");
    const [grid, setGrid] = useState<Table[][]>(
        Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => ({ isTable: false, seats: 0, reserved: false }))
        )
    );
    const [selectedSeats, setSelectedSeats] = useState(4);
    const [mode, setMode] = useState<"seat" | "table" | "erase">("seat");
    const [restaurantImage, setRestaurantImage] = useState<string | null>(null);

    // Toggle reservation status (will be called by ReservationsOverview)
    const toggleReservation = (rowIndex: number, colIndex: number) => {
        setGrid(prevGrid => {
            const newGrid = [...prevGrid.map(row => [...row])];
            const cell = newGrid[rowIndex][colIndex];

            if (cell.isTable) {
                cell.reserved = !cell.reserved; // Toggle the reservation status
            }

            return newGrid;
        });
    };

    const toggleCell = (rowIndex: number, colIndex: number) => {
        setGrid(prevGrid => {
            const newGrid = [...prevGrid.map(row => [...row])];
            const cell = newGrid[rowIndex][colIndex];

            if (mode === "seat" && cell.isTable) {
                cell.seats = selectedSeats;
            } else if (mode === "table") {
                cell.isTable = true;
                cell.seats = selectedSeats;
            } else if (mode === "erase") {
                cell.isTable = false;
                cell.seats = 0;
            }

            return newGrid;
        });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = () => {
                setRestaurantImage(reader.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
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
                {/* Save Button at the bottom */}
                <div className="w-full px-4 mb-8">
                    <button
                        onClick={() => {
                            // Your save logic here
                            console.log("Saving restaurant info...");
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded w-full"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-8">
                {selectedSection === "image" && (
                    <ImageUpload restaurantImage={restaurantImage} onImageChange={handleImageChange} />
                )}
                {selectedSection === "layout" && (
                    <GridLayout
                        grid={grid}
                        selectedSeats={selectedSeats}
                        mode={mode}
                        toggleCell={toggleCell}
                        setMode={setMode}
                        setSelectedSeats={setSelectedSeats}
                    />
                )}
                {selectedSection === "reservations" && (
                    <ReservationsOverview grid={grid} toggleReservation={toggleReservation} />
                )}
            </div>
        </div>
    );
};

export default RestaurantHome;
