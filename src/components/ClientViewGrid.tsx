import React from "react";

interface ClientViewGridProps {
    grid: any[][]; // Same shape as before
    onTableClick?: (rowIndex: number, colIndex: number) => void; // optional click handler
    getTableNumber?: (rowIndex: number, colIndex: number) => string; // function to get table number
}

const ClientViewGrid: React.FC<ClientViewGridProps> = ({ grid, onTableClick, getTableNumber }) => {
    // Calculate table numbers similar to the original GridLayout
    const tableNumbers = grid.flat().reduce((acc, cell, index) => {
        if (cell.isTable) {
            acc.push({
                index,
                tableNumber: acc.length + 1,
            });
        }
        return acc;
    }, [] as { index: number; tableNumber: number }[]);

    const getInternalTableNumber = (rowIndex: number, colIndex: number): number | null => {
        const cellIndex = rowIndex * grid[0].length + colIndex;
        const table = tableNumbers.find((item) => item.index === cellIndex);
        return table ? table.tableNumber : null;
    };

    // Use the provided getTableNumber function or fall back to internal calculation
    const getDisplayTableNumber = (rowIndex: number, colIndex: number): string => {
        if (getTableNumber) {
            return getTableNumber(rowIndex, colIndex);
        }
        const tableNum = getInternalTableNumber(rowIndex, colIndex);
        return tableNum ? tableNum.toString() : '';
    };

    // Calculate the container size based on grid dimensions
    const containerWidth = grid[0]?.length * 44 || 440;
    const containerHeight = grid.length * 44 || 440;

    return (
        <div className="flex flex-col lg:flex-row gap-6 items-start p-6 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-xl border border-slate-200">
            {/* Main grid layout */}
            <div className="flex-1 flex flex-col items-center gap-6">
                <div className="flex items-center justify-center">
                    <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-sm"></div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 bg-clip-text text-transparent">
                            Restaurant Layout
                        </h2>
                        <div className="w-3 h-3 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-sm"></div>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center space-x-6 mb-2 text-sm">
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-amber-400 to-amber-600 rounded-full shadow-sm"></div>
                        <span className="text-slate-600 font-medium">Available</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gradient-to-r from-red-400 to-red-600 rounded-full shadow-sm"></div>
                        <span className="text-slate-600 font-medium">Reserved</span>
                    </div>
                </div>

                <div
                    className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl shadow-inner overflow-hidden"
                    style={{
                        width: containerWidth,
                        height: containerHeight,
                        minWidth: 440,
                        minHeight: 440
                    }}
                >
                    {/* Subtle pattern overlay */}
                    <div
                        className="absolute inset-0 opacity-5"
                        style={{
                            backgroundImage: `radial-gradient(circle at 2px 2px, rgb(120 53 15) 1px, transparent 0)`,
                            backgroundSize: '24px 24px'
                        }}
                    ></div>

                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            if (cell.isTable) {
                                const tableNumber = getDisplayTableNumber(rowIndex, colIndex);

                                return (
                                    <div
                                        key={`${rowIndex}-${colIndex}`}
                                        className={`absolute flex flex-col items-center justify-center transition-all duration-300 transform ${
                                            cell.reserved
                                                ? "cursor-not-allowed"
                                                : "hover:scale-125 hover:-translate-y-1 cursor-pointer"
                                        }`}
                                        title={`Table ${tableNumber} - ${cell.seats} seats`}
                                        onClick={() => {
                                            if (!cell.reserved && onTableClick) {
                                                onTableClick(rowIndex, colIndex);
                                            }
                                        }}
                                        style={{
                                            left: colIndex * 44 + 2,
                                            top: rowIndex * 44 + 2,
                                            width: 40,
                                            height: 40
                                        }}
                                    >
                                        {/* Custom table SVG icon with enhanced styling */}
                                        <div className={`relative transition-all duration-300 ${
                                            cell.reserved ? "opacity-90" : "hover:brightness-110 filter drop-shadow-lg"
                                        }`}>
                                            {/* Glow effect for available tables */}
                                            {!cell.reserved && (
                                                <div className="absolute inset-0 bg-amber-400 rounded-full blur-md opacity-0 hover:opacity-20 transition-opacity duration-300 scale-150"></div>
                                            )}

                                            <svg
                                                width="28"
                                                height="28"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="relative z-10"
                                            >
                                                {/* Table top (ellipse) with gradients */}
                                                <defs>
                                                    <radialGradient id={`tableGradient-${rowIndex}-${colIndex}`} cx="50%" cy="30%" r="80%">
                                                        <stop offset="0%" stopColor={cell.reserved ? "#fca5a5" : "#fbbf24"} />
                                                        <stop offset="100%" stopColor={cell.reserved ? "#dc2626" : "#d97706"} />
                                                    </radialGradient>
                                                    <radialGradient id={`legGradient-${rowIndex}-${colIndex}`} cx="50%" cy="0%" r="100%">
                                                        <stop offset="0%" stopColor={cell.reserved ? "#b91c1c" : "#92400e"} />
                                                        <stop offset="100%" stopColor={cell.reserved ? "#7f1d1d" : "#78350f"} />
                                                    </radialGradient>
                                                </defs>

                                                <ellipse cx="12" cy="8" rx="10" ry="3" fill={cell.reserved ? "#b91c1c" : "#92400e"} />
                                                <ellipse cx="12" cy="7" rx="10" ry="3" fill={`url(#tableGradient-${rowIndex}-${colIndex})`} />

                                                {/* Table leg with gradient */}
                                                <rect x="10.5" y="10" width="3" height="8" fill={`url(#legGradient-${rowIndex}-${colIndex})`} rx="1.5" />

                                                {/* Table base with shadow effect */}
                                                <ellipse cx="12" cy="19" rx="6" ry="1.5" fill={cell.reserved ? "#450a0a" : "#451a03"} opacity="0.3" />
                                                <ellipse cx="12" cy="18.5" rx="6" ry="2" fill={cell.reserved ? "#991b1b" : "#78350f"} />

                                                {/* Reserved indicator - X mark overlay */}
                                                {cell.reserved && (
                                                    <g className="animate-pulse">
                                                        <circle cx="12" cy="12" r="8" fill="rgba(255,255,255,0.9)" />
                                                        <line x1="8" y1="8" x2="16" y2="16" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                                                        <line x1="16" y1="8" x2="8" y2="16" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" />
                                                    </g>
                                                )}
                                            </svg>
                                        </div>
                                        {tableNumber && (
                                            <span className={`text-xs font-bold mt-0.5 px-1.5 py-0.5 rounded-full transition-colors duration-300 ${
                                                cell.reserved
                                                    ? "text-red-600 bg-red-50"
                                                    : "text-amber-800 bg-amber-50 shadow-sm"
                                            }`}>
                                                {tableNumber}
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                            return null;
                        })
                    )}
                </div>
            </div>

            {/* Table Overview Sidebar */}
            <div className="w-full lg:w-64 bg-white p-5 rounded-lg shadow-lg border border-slate-200">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                    🪑 <span>Tables Overview</span>
                </h2>
                <ul className="space-y-3 max-h-[400px] overflow-auto pr-2">
                    {grid.map((row, rowIndex) =>
                        row.map((cell, colIndex) => {
                            if (!cell.isTable) return null;
                            const tableNumber = getDisplayTableNumber(rowIndex, colIndex);

                            return (
                                <li
                                    key={`${rowIndex}-${colIndex}`}
                                    onClick={() => onTableClick?.(rowIndex, colIndex)}
                                    className={`flex items-center justify-between px-3 py-2 rounded-md transition-all duration-200 ${
                                        cell.reserved
                                            ? "bg-red-50 border border-red-200"
                                            : "bg-green-50 border border-green-200"
                                    } ${
                                        onTableClick ? "hover:shadow-md cursor-pointer hover:scale-[1.02]" : ""
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <div className={`w-3 h-3 rounded-full ${
                                            cell.reserved ? "bg-red-500" : "bg-green-500"
                                        }`}></div>
                                        <span className={`font-medium ${
                                            cell.reserved ? "text-red-700" : "text-gray-700"
                                        }`}>
                                            Table {tableNumber}
                                        </span>
                                        {cell.reserved && (
                                            <span className="text-xs text-red-500 font-medium">RESERVED</span>
                                        )}
                                    </div>
                                    <span className={`text-sm px-2 py-0.5 rounded-full ${
                                        cell.reserved
                                            ? "bg-red-100 text-red-600"
                                            : "bg-gray-200 text-gray-600"
                                    }`}>
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

export default ClientViewGrid;