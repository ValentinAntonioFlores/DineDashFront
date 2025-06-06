import React, { useState } from "react";
import CustomCalendar from '../components/Calendar.tsx';
import {fetchRestaurantReservations} from "../utils/RestaurantApi.ts";
import { useEffect } from "react";


interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

interface ReservationsOverviewProps {
    grid: Table[][];
    toggleReservation: (rowIndex: number, colIndex: number) => void;
    restaurantId: string;
}



const ReservationsOverview: React.FC<ReservationsOverviewProps> = ({
                                                                       grid,
                                                                       toggleReservation,
                                                                       restaurantId,
                                                                   }) => {

    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [selectedTimeBlock, setSelectedTimeBlock] = useState<string>("");
    const [localGrid, setLocalGrid] = useState<Table[][]>(grid);


    const generateTimeBlocks = () => [
        { label: "5:00 PM - 6:30 PM", start: "17:00" },
        { label: "6:30 PM - 8:00 PM", start: "18:30" },
        { label: "8:00 PM - 9:30 PM", start: "20:00" },
        { label: "9:30 PM - 11:00 PM", start: "21:30" },
        { label: "1:00 AM - 2:30 AM", start: "01:00" },
    ];

    const timeBlocks = generateTimeBlocks();

    useEffect(() => {
        setLocalGrid(grid);
    }, [grid]);

    useEffect(() => {
        const fetchAndMarkReservations = async () => {
            if (!restaurantId || !selectedDate || !selectedTimeBlock) return;

            try {
                const data = await fetchRestaurantReservations(restaurantId);

                const selectedDateString = selectedDate.toISOString().split("T")[0];

                // Filter only relevant accepted reservations
                const accepted = data.filter(
                    (res: any) =>
                        res.status === "ACCEPTED" &&
                        res.date === selectedDateString &&
                        res.time === selectedTimeBlock
                );

                const updatedGrid = localGrid.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                        const isReserved = accepted.some(
                            (res: any) =>
                                res.table.row === rowIndex && res.table.col === colIndex
                        );

                        return {
                            ...cell,
                            reserved: isReserved,
                        };
                    })
                );

                setLocalGrid(updatedGrid);
            } catch (err) {
                console.error("Failed to fetch and apply reservations:", err);
            }
        };

        fetchAndMarkReservations();
    }, [restaurantId, selectedDate, selectedTimeBlock]);

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

            {/* Time Frame Dropdown */}
            <select
                value={selectedTimeBlock}
                onChange={(e) => setSelectedTimeBlock(e.target.value)}
                className="mb-6 ml-4 px-5 py-2 rounded-full bg-cream text-black border border-black hover:bg-black hover:text-cream transition font-semibold italic"
            >
                <option value="">Select Time Frame</option>
                {timeBlocks.map((block) => (
                    <option key={block.start} value={block.start}>
                        {block.label}
                    </option>
                ))}
            </select>
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
                {localGrid.map((row, rowIndex) =>
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
