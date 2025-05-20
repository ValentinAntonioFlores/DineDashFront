import React from "react";

interface GridLayoutProps {
    grid: any[][];
    selectedSeats?: number;
    mode?: "table" | "erase";
    toggleCell?: (rowIndex: number, colIndex: number) => void;
    setMode?: React.Dispatch<React.SetStateAction<"table" | "erase">>;
    setSelectedSeats?: React.Dispatch<React.SetStateAction<number>>;
    readOnly?: boolean;
}

const GridLayout: React.FC<GridLayoutProps> = ({
                                                   grid,
                                                   selectedSeats = 1,
                                                   mode = "table",
                                                   toggleCell = () => {},
                                                   setMode = () => {},
                                                   setSelectedSeats = () => {},
                                                   readOnly = false,
                                               }) => {
    // Calculate table numbers based on current table cells
    const tableNumbers = grid.flat().reduce((acc, cell, index) => {
        if (cell.isTable) {
            acc.push({
                index,
                tableNumber: acc.length + 1, // Increment the table number
            });
        }
        return acc;
    }, [] as { index: number; tableNumber: number }[]);

    // Get the table number based on cell index
    const getTableNumber = (rowIndex: number, colIndex: number): number | null => {
        const cellIndex = rowIndex * grid[0].length + colIndex;
        const table = tableNumbers.find((item) => item.index === cellIndex);
        return table ? table.tableNumber : null;
    };

    return (
        <div className="flex flex-col md:flex-row items-start">
            <div className="flex-1 flex flex-col items-center mr-4">
                {!readOnly && (
                    <>
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setMode("table")}
                                className={mode === "table"
                                    ? "bg-blue-500 text-white px-4 py-2 rounded"
                                    : "bg-gray-200 px-4 py-2 rounded"}
                            >
                                Table
                            </button>
                            <button
                                onClick={() => setMode("erase")}
                                className={mode === "erase"
                                    ? "bg-red-500 text-white px-4 py-2 rounded"
                                    : "bg-gray-200 px-4 py-2 rounded"}
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
                    </>
                )}

                <div className="grid grid-cols-10 gap-1">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const tableNumber = cell.isTable ? getTableNumber(rowIndex, colIndex) : null;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => {
                                        if (!readOnly) toggleCell(rowIndex, colIndex);
                                    }}
                                    className={`w-10 h-10 flex items-center justify-center rounded border cursor-pointer
                                        ${cell.isTable ? "bg-green-500 text-white" : "bg-white"}`}
                                >
                                    {cell.isTable && tableNumber !== null ? tableNumber : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Table info section */}
            <div className="w-60 bg-gray-200 p-4 rounded-md shadow-lg">
                <h2 className="font-semibold mb-4">Tables Overview</h2>
                <ul className="space-y-2">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            if (cell.isTable) {
                                const tableNumber = getTableNumber(rowIndex, colIndex);
                                return (
                                    <li key={`${rowIndex}-${colIndex}`} className="flex justify-between">
                                        <span>Table {tableNumber}</span>
                                        <span>{cell.seats} seats</span>
                                    </li>
                                );
                            }
                            return null;
                        })
                    )}
                </ul>
            </div>
        </div>
    );
};

export default GridLayout;
