import React, { useState } from "react";
import { saveRestaurant} from "../utils/RestaurantApi.ts";
import { createTable} from "../utils/TableApi.ts";

const GRID_SIZE = 10;

interface Cell {
    isTable: boolean;
    seats: number;
}

const generateEmptyGrid = (): Cell[][] => {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ isTable: false, seats: 0 }))
    );
};

const RestaurantHomes: React.FC<{ restaurantName: string }> = ({ restaurantName }) => {
    const [grid, setGrid] = useState<Cell[][]>(generateEmptyGrid());
    const [selectedSeats, setSelectedSeats] = useState<number>(2);
    const [mode, setMode] = useState<"seat" | "table" | "erase">("seat");
    const [restaurantImage, setRestaurantImage] = useState<string | null>(null);

    const handleSave = async () => {
        if (!restaurantName) {
            alert("Please enter a restaurant name");
            return;
        }

        try {
            const savedRestaurant = await saveRestaurant({
                name: restaurantName,
                image: restaurantImage,
                gridLayout: grid,
            });

            const restaurantId = savedRestaurant.id;  // ← get the restaurant ID

            // Now, create tables from the grid
            const tablePromises = [];

            for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
                for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
                    const cell = grid[rowIndex][colIndex];
                    if (cell.isTable) {
                        const tableDTO = {
                            positionX: colIndex,
                            positionY: rowIndex,
                            capacity: cell.seats,
                            isAvailable: true, // Assuming the tables are available by default
                        };

                        tablePromises.push(
                            createTable(restaurantId, {
                                restaurantId,
                                tableDTO, // Sending tableDTO as expected by the backend
                            })
                        );
                    }
                }
            }

            await Promise.all(tablePromises); // Wait for all table creations

            alert("Restaurant and tables saved successfully!");
        } catch (error) {
            console.error(error);
            alert("Error saving restaurant or tables");
        }
    };


    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const imageUrl = URL.createObjectURL(file);
            setRestaurantImage(imageUrl);
        }
    };

    const toggleCell = (rowIndex: number, colIndex: number) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
            const cell = newGrid[rowIndex][colIndex];

            if (mode === "seat") {
                cell.isTable = false;
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

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Restaurant Configuration</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Image Upload Section */}
                <div className="flex-1 flex flex-col items-center">
                    <label
                        htmlFor="image-upload"
                        className="relative w-64 h-64 cursor-pointer group"
                    >
                        {/* Overlay Text */}
                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white rounded-lg group-hover:bg-opacity-50 transition">
                            <span className="font-semibold text-lg">Choose Picture</span>
                            <span className="text-4xl">+</span>
                        </div>

                        {/* Image or Placeholder */}
                        {!restaurantImage ? (
                            <div className="w-full h-full bg-white border-2 border-dashed border-gray-400 rounded-lg" />
                        ) : (
                            <img
                                src={restaurantImage}
                                alt="Restaurant"
                                className="w-full h-full object-cover rounded-lg shadow-md"
                            />
                        )}
                    </label>

                    <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                    />
                </div>

                {/* Right: Grid + Controls */}
                <div className="flex-1 flex flex-col items-center">
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setMode("seat")}
                            className={mode === "seat" ? "bg-blue-500 text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}
                        >
                            Seat
                        </button>
                        <button
                            onClick={() => setMode("table")}
                            className={mode === "table" ? "bg-blue-500 text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}
                        >
                            Table
                        </button>
                        <button
                            onClick={() => setMode("erase")}
                            className={mode === "erase" ? "bg-red-500 text-white px-4 py-2 rounded" : "bg-gray-200 px-4 py-2 rounded"}
                        >
                            Erase
                        </button>
                    </div>

                    <div className="mb-4">
                        <label className="mr-2 font-semibold">Seats per table:</label>
                        <input
                            type="number"
                            value={selectedSeats}
                            onChange={(e) => setSelectedSeats(Number(e.target.value))}
                            className="border rounded px-2 py-1 w-20"
                            min={1}
                            max={12}
                        />
                    </div>

                    <div className="grid grid-cols-10 gap-1">
                        {grid.map((row, rowIndex) =>
                            row.map((cell, colIndex) => (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => toggleCell(rowIndex, colIndex)}
                                    className={`w-10 h-10 flex items-center justify-center rounded border cursor-pointer
                                        ${cell.isTable ? "bg-green-500 text-white" : "bg-white"}`}
                                >
                                    {cell.isTable ? cell.seats : ""}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-4">
                <button
                    onClick={handleSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                    Save Restaurant Info
                </button>
            </div>

        </div>
    );
};

export default RestaurantHomes;