import React from "react";

interface GridLayoutProps {
    grid: any[][];
    selectedSeats?: number;
    mode?: "table" | "erase";
    toggleCell?: (rowIndex: number, colIndex: number) => void;
    setMode?: React.Dispatch<React.SetStateAction<"table" | "erase">>;
    setSelectedSeats?: React.Dispatch<React.SetStateAction<number>>;
    readOnly?: boolean;
    onTableClick?: (rowIndex: number, colIndex: number) => void;
    getCellClassName?: (cell: any, rowIndex: number, colIndex: number) => string;
}

const GridLayout: React.FC<GridLayoutProps> = ({
                                                   grid,
                                                   selectedSeats = 1,
                                                   mode = "table",
                                                   toggleCell = () => {},
                                                   setMode = () => {},
                                                   setSelectedSeats = () => {},
                                                   readOnly = false,
                                                   onTableClick,
                                               }) => {


    const tableNumbers = grid.flat().reduce((acc, cell, index) => {
        if (cell.isTable) {
            acc.push({
                index,
                tableNumber: acc.length + 1,
            });
        }
        return acc;
    }, [] as { index: number; tableNumber: number }[]);

    const getTableNumber = (rowIndex: number, colIndex: number): number | null => {
        const cellIndex = rowIndex * grid[0].length + colIndex;
        const table = tableNumbers.find((item) => item.index === cellIndex);
        return table ? table.tableNumber : null;
    };

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start p-6 bg-gray-50 rounded-lg shadow-md">
            <div className="flex-1 flex flex-col items-center gap-6">
                {!readOnly && (
                    <div className="w-full max-w-md bg-white p-4 rounded-lg shadow">
                        <div className="flex gap-4 mb-4">
                            <button
                                onClick={() => setMode("table")}
                                className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                                    mode === "table"
                                        ? "bg-blue-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            >
                                🪑 Table
                            </button>
                            <button
                                onClick={() => setMode("erase")}
                                className={`flex-1 px-4 py-2 rounded font-semibold transition ${
                                    mode === "erase"
                                        ? "bg-red-600 text-white"
                                        : "bg-gray-200 hover:bg-gray-300"
                                }`}
                            >
                                🧽 Erase
                            </button>
                        </div>
                        <div className="flex items-center justify-between">
                            <label className="font-medium">Seats per table:</label>
                            <input
                                type="number"
                                value={selectedSeats}
                                onChange={(e) => setSelectedSeats(Number(e.target.value))}
                                className="border border-gray-300 rounded px-3 py-1 w-24 text-center focus:outline-none focus:ring-2 focus:ring-blue-300"
                                min={1}
                                max={12}
                            />
                        </div>
                    </div>
                )}

                <div className="bg-white p-4 rounded-lg shadow grid grid-cols-10 gap-1">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            const tableNumber = cell.isTable ? getTableNumber(rowIndex, colIndex) : null;

                            return (
                                <div
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => {
                                        if (!readOnly && !cell.reserved) toggleCell(rowIndex, colIndex);
                                    }}
                                    className={`w-10 h-10 flex items-center justify-center rounded border text-sm font-medium transition ${
                                        cell.isTable
                                            ? cell.reserved
                                                ? "bg-red-500 text-white cursor-not-allowed"
                                                : "bg-green-500 text-white hover:bg-green-600 cursor-pointer"
                                            : "bg-gray-100 hover:bg-gray-200 cursor-pointer"
                                    }`}
                                >
                                    {cell.isTable && tableNumber !== null ? tableNumber : ""}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-full lg:w-64 bg-white p-5 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4 text-gray-800">🪑 Tables Overview</h2>
                <ul className="space-y-3 max-h-[400px] overflow-auto pr-2">
                    {grid.map((row, rowIndex) =>
                            row.map((cell, colIndex) => {
                                if (!cell.isTable) return null;
                                const tableNumber = getTableNumber(rowIndex, colIndex);

                                return (
                                    <li
                                        key={`${rowIndex}-${colIndex}`}
                                        onClick={() => onTableClick?.(rowIndex, colIndex)}
                                        className={`flex items-center justify-between px-3 py-2 rounded-md transition ${
                                            onTableClick ? "hover:bg-gray-100 cursor-pointer" : ""
                                        }`}
                                    >
                                        <span className="font-medium text-gray-700">Table {tableNumber}</span>
                                        <span className="bg-gray-200 text-sm px-2 py-0.5 rounded-full text-gray-600">
                    {cell.seats} seats
                  </span>
                                    </li>
                                );
                            })
                    )}
                </ul>
            </div>
        </div>
    );
};

export default GridLayout;
