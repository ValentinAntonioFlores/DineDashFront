import React, { useState } from "react";
import CustomCalendar from '../components/Calendar.tsx';

interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

interface ReservationsOverviewProps {
    grid: Table[][];
    toggleReservation: (rowIndex: number, colIndex: number) => void;
}

const ReservationsOverview: React.FC<ReservationsOverviewProps> = ({
                                                                       grid,
                                                                       toggleReservation,
                                                                   }) => {
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg font-serif italic text-gray-800">
            <h2 className="text-3xl font-bold mb-6 border-b-2 border-black pb-2">
                Table Reservations
            </h2>

            {/* Calendar Toggle Button */}
            <button
                onClick={() => setShowCalendar((prev) => !prev)}
                className="mb-6 px-5 py-2 rounded-full bg-cream text-black border border-black hover:bg-black hover:text-cream transition font-semibold italic"
                aria-expanded={showCalendar}
                aria-controls="calendar-container"
            >
                {showCalendar ? "Hide Calendar" : "Show Calendar"}
            </button>

            {/* Calendar Section */}
            <div
                id="calendar-container"
                className={`mb-8 overflow-hidden transition-max-height duration-500 ease-in-out ${
                    showCalendar ? "max-h-[500px]" : "max-h-0"
                }`}
                aria-hidden={!showCalendar}
            >
                {showCalendar && (
                    <CustomCalendar
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                    />
                )}
            </div>

            {/* Tables Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {grid.map((row, rowIndex) =>
                    row.map((cell, colIndex) =>
                        cell.isTable ? (
                            <button
                                key={`${rowIndex}-${colIndex}`}
                                onClick={() => toggleReservation(rowIndex, colIndex)}
                                className={`flex flex-col justify-between p-5 rounded-xl shadow-md transition
                  ${
                                    cell.reserved
                                        ? "bg-gradient-to-br from-red-600 to-red-400 hover:from-red-700 hover:to-red-500"
                                        : "bg-gradient-to-br from-green-600 to-green-400 hover:from-green-700 hover:to-green-500"
                                }
                  focus:outline-none focus:ring-4 focus:ring-black/40
                `}
                                aria-pressed={cell.reserved}
                                aria-label={`Table ${rowIndex * 10 + colIndex + 1}, ${
                                    cell.reserved ? "reserved" : "available"
                                } with ${cell.seats} seats`}
                            >
                                <div className="text-white text-lg font-semibold mb-2">
                                    Table {rowIndex * 10 + colIndex + 1}
                                </div>
                                <div className="text-white text-sm font-light">
                                    {cell.seats} seat{cell.seats > 1 ? "s" : ""}
                                </div>
                                <div
                                    className={`mt-3 text-white font-semibold ${
                                        cell.reserved ? "italic" : ""
                                    }`}
                                >
                                    {cell.reserved ? "Reserved" : "Available"}
                                </div>
                            </button>
                        ) : null
                    )
                )}
            </div>
        </div>
    );
};

export default ReservationsOverview;
