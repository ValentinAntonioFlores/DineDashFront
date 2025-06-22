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

    const tableNumbers = grid.flat().reduce((acc: { index: number; tableNumber: number }[], cell, index) => {
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">Restaurant Floor Plan</h1>
                    <p className="text-gray-600">Manage your dining space and table arrangements</p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Main Grid Area */}
                    <div className="flex-1">
                        {/* Controls Panel */}
                        {!readOnly && (
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                    Layout Controls
                                </h3>
                                
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-1">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Mode</label>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setMode("table")}
                                                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                    mode === "table"
                                                        ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="text-lg">🪑</span>
                                                    <span>Add Table</span>
                                                </span>
                                            </button>
                                            <button
                                                onClick={() => setMode("erase")}
                                                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                                                    mode === "erase"
                                                        ? "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg"
                                                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                                                }`}
                                            >
                                                <span className="flex items-center justify-center gap-2">
                                                    <span className="text-lg">🧽</span>
                                                    <span>Remove</span>
                                                </span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="sm:w-48">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Seats per Table</label>
                                        <input
                                            type="number"
                                            value={selectedSeats}
                                            onChange={(e) => setSelectedSeats(Number(e.target.value))}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                                            min={1}
                                            max={12}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Grid Container */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20">
                            <div className="grid grid-cols-10 gap-2 max-w-4xl mx-auto">
                                {grid.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => {
                                        const tableNumber = cell.isTable ? getTableNumber(rowIndex, colIndex) : null;

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => {
                                                    if (!readOnly && !cell.reserved) toggleCell(rowIndex, colIndex);
                                                }}
                                                className={`
                                                    w-16 h-16 flex items-center justify-center rounded-xl border-2 transition-all duration-300 transform hover:scale-105 cursor-pointer
                                                    ${cell.isTable
                                                        ? cell.reserved
                                                            ? "bg-gradient-to-br from-red-400 to-red-600 text-white border-red-500 shadow-lg shadow-red-200 cursor-not-allowed"
                                                            : "bg-gradient-to-br from-emerald-400 to-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-200 hover:from-emerald-500 hover:to-emerald-700"
                                                        : "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 border-gray-300 hover:from-gray-200 hover:to-gray-300"
                                                    }
                                                `}
                                            >
                                                {cell.isTable ? (
                                                    <div className="text-center">
                                                        <div className="text-lg font-bold">{tableNumber}</div>
                                                        <div className="text-xs opacity-80">{cell.seats} seats</div>
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-400 text-xs">Empty</div>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:w-80">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20 sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                                <span className="text-2xl">🪑</span>
                                Tables Overview
                            </h2>
                            
                            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                                {grid.map((row, rowIndex) =>
                                    row.map((cell, colIndex) => {
                                        if (!cell.isTable) return null;
                                        const tableNumber = getTableNumber(rowIndex, colIndex);

                                        return (
                                            <div
                                                key={`${rowIndex}-${colIndex}`}
                                                onClick={() => onTableClick?.(rowIndex, colIndex)}
                                                className={`
                                                    p-4 rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer
                                                    ${cell.reserved
                                                        ? "bg-gradient-to-r from-red-50 to-red-100 border border-red-200"
                                                        : "bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200"
                                                    }
                                                    ${onTableClick ? "hover:shadow-lg" : ""}
                                                `}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className={`font-bold text-lg ${
                                                            cell.reserved ? "text-red-700" : "text-emerald-700"
                                                        }`}>
                                                            Table {tableNumber}
                                                        </h3>
                                                        <p className="text-sm text-gray-600 mt-1">
                                                            {cell.seats} seats
                                                        </p>
                                                    </div>
                                                    <div className={`w-3 h-3 rounded-full ${
                                                        cell.reserved ? "bg-red-500" : "bg-emerald-500"
                                                    }`}></div>
                                                </div>
                                                <div className={`mt-2 text-xs font-medium ${
                                                    cell.reserved ? "text-red-600" : "text-emerald-600"
                                                }`}>
                                                    {cell.reserved ? "Reserved" : "Available"}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            
                            {/* Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-600">Total Tables:</span>
                                    <span className="font-bold text-gray-800">{tableNumbers.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-gray-600">Available:</span>
                                    <span className="font-bold text-emerald-600">
                                        {tableNumbers.length - grid.flat().filter(cell => cell.isTable && cell.reserved).length}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-sm mt-2">
                                    <span className="text-gray-600">Reserved:</span>
                                    <span className="font-bold text-red-600">
                                        {grid.flat().filter(cell => cell.isTable && cell.reserved).length}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GridLayout;
