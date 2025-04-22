import React, { useState } from "react";

const GRID_SIZE = 10; // 10x10 grid

interface Cell {
    isTable: boolean;
    seats: number;
}

const generateEmptyGrid = (): Cell[][] => {
    return Array.from({ length: GRID_SIZE }, () =>
        Array.from({ length: GRID_SIZE }, () => ({ isTable: false, seats: 0 }))
    );
};

const RestaurantHome: React.FC = () => {
    const [grid, setGrid] = useState<Cell[][]>(generateEmptyGrid());
    const [selectedSeats, setSelectedSeats] = useState<number>(2); // Default to 2 seats per table
    const [mode, setMode] = useState<"seat" | "table" | "erase">("seat"); // Current mode (seat, table, erase)

    // Toggle the cell to either a table or seat based on the current mode
    const toggleCell = (rowIndex: number, colIndex: number) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((row) => row.map((cell) => ({ ...cell })));
            const cell = newGrid[rowIndex][colIndex];

            if (mode === "seat") {
                cell.isTable = false; // Ensure no table when setting a seat
                cell.seats = selectedSeats; // Set the selected number of seats
            } else if (mode === "table") {
                cell.isTable = true; // Set this cell as a table
                cell.seats = selectedSeats; // Set the selected number of seats for the table
            } else if (mode === "erase") {
                cell.isTable = false; // Remove the table
                cell.seats = 0; // Clear seats
            }

            return newGrid;
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-4">Restaurant Seat Layout</h1>

            {/* Mode selection buttons */}
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

            {/* Seats per table input */}
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

            {/* Grid of seats and tables */}
            <div className="grid grid-cols-10 gap-1">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            onClick={() => toggleCell(rowIndex, colIndex)}
                            className={`w-12 h-12 flex items-center justify-center rounded border cursor-pointer
                ${cell.isTable ? "bg-green-500 text-white" : "bg-white"}`}
                        >
                            {cell.isTable ? cell.seats : ""}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RestaurantHome;
