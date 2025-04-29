import React from "react";

interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

interface ReservationsOverviewProps {
    grid: Table[][];
    toggleReservation: (rowIndex: number, colIndex: number) => void;
}

const ReservationsOverview: React.FC<ReservationsOverviewProps> = ({ grid, toggleReservation }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-4">Table Reservations</h2>
            <div className="grid grid-cols-4 gap-4">
                {/* Display only tables, in rectangles, with reservation status */}
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        cell.isTable ? (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                className={`p-4 border rounded-md cursor-pointer ${
                                    cell.reserved ? "bg-red-500" : "bg-green-500"
                                }`}
                                onClick={() => toggleReservation(rowIndex, colIndex)} // Toggle reservation on click
                            >
                                {/* Show Table number and seat count */}
                                <span className="text-white">Table {rowIndex * 10 + colIndex + 1}</span>
                                <div className="text-white mt-2">{cell.seats} seats</div>
                                <div className="text-white mt-2">
                                    {cell.reserved ? "Reserved" : "Available"}
                                </div>
                            </div>
                        ) : null
                    )
                )}
            </div>
        </div>
    );
};

export default ReservationsOverview;
