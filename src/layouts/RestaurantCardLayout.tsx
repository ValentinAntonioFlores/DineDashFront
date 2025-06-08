// src/pages/RestaurantCardLayout.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GridLayout from '../components/GridLayout.tsx';
import CustomCalendar from '../components/Calendar.tsx';
import {fetchAcceptedReservationsByRestaurant, fetchPublicRestaurants, makeReservation, markAsFavorite, unmarkAsFavorite, fetchUserFavoritesForHome} from "../utils/Api.ts";
import HomeLayout from './HomeHeaderLayout.tsx';
import { FaStar, FaRegStar} from 'react-icons/fa';
import { ReservationReviewPopup } from '../components/ReservationReviewPopup'; // adjust the path if needed
import { ReviewButton} from "../components/ReviewButton.tsx";
import UserMenu from "../components/UserMenu.tsx";


// DTO interfaces
interface TableDTO {
    idTable: string;
    capacity: number;
    positionX: number;
    positionY: number;
    available: boolean;
}

interface PublicRestaurantDTO {
    id: string;
    name: string;
    imageUrl: string;
    layout: TableDTO[];
}


const generateTimeBlocks = () => [
    { label: "5:00 PM - 6:30 PM", start: "17:00" },
    { label: "6:30 PM - 8:00 PM", start: "18:30" },
    { label: "8:00 PM - 9:30 PM", start: "20:00" },
    { label: "9:30 PM - 11:00 PM", start: "21:30" },
    { label: "1:00 AM - 2:30 AM", start: "01:00" }, // Just for example.
];

// Helper to format date as yyyy-mm-dd for sending to API or display
const formatDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};





const RestaurantCardLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<PublicRestaurantDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTable, setSelectedTable] = useState<{ x: number; y: number } | null>(null);

    // Change selectedDate from string to Date | undefined for easier handling with CustomCalendar
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedTime, setSelectedTime] = useState("");
    const [isFavorited, setIsFavorited] = useState(false);
    const [showReviewPopUp, setShowReviewPopUp] = useState(false);


    const handleReviewSubmit = (rating: number, restaurantId: string) => {
        // You can extend this to send the review to backend or store locally
        setShowReviewPopUp(false);
    };

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;
            try {
                const all = await fetchPublicRestaurants();
                const found = all.find(r => r.id === id);
                if (!found) throw new Error('Restaurant not found');
                setRestaurant(found);
                setError(null);

                // Check if user has favorited this restaurant
                const userInfoString = localStorage.getItem('userInfo');
                if (userInfoString) {
                    const { id: userId } = JSON.parse(userInfoString);
                    const favorites = await fetchUserFavoritesForHome(userId);
                    console.log("Favorites returned for user:", favorites);
                    console.log("Current restaurant ID:", found.id);
                    setIsFavorited(favorites.includes(found.id));
                } else {
                    setIsFavorited(false); // no user, can't favorite
                }
            } catch (e: any) {
                console.error(e);
                setError(e.message || 'Unable to load restaurant');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);


    // State to track reserved tables
    const [reservedTables, setReservedTables] = useState<Set<string>>(new Set());
    useEffect(() => {
        if (!id || !selectedDate || !selectedTime) {
            setReservedTables(new Set());
            return;
        }

        const fetchReservedTables = async () => {
            try {
                const startISO = new Date(`${formatDate(selectedDate)}T${selectedTime}:00`).toISOString();
                const endDate = new Date(startISO);
                endDate.setMinutes(endDate.getMinutes() + 90);
                const endISO = endDate.toISOString();

                const reservations = await fetchAcceptedReservationsByRestaurant(id, startISO, endISO);
                console.log("Fetched accepted reservations:", reservations);

                const reservedIds = new Set(reservations); // reservations is already string[]
                console.log("Reserved table IDs:", reservedIds);

                setReservedTables(reservedIds);

                // Also if current selectedTable is reserved, reset selection
                if (selectedTable && reservedIds.has(
                    restaurant?.layout.find(t => t.positionX === selectedTable.x && t.positionY === selectedTable.y)?.idTable || ""
                )) {
                    setSelectedTable(null);
                }

            } catch (e) {
                console.error(e);
                setReservedTables(new Set());
            }
        };

        fetchReservedTables();

    }, [id, selectedDate, selectedTime, selectedTable, restaurant]);

    const formatDateDisplay = (date: Date): string => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2); // get last two digits of year
        return `${day}/${month}/${year}`;
    };

    const calendarRef = useRef<HTMLDivElement>(null);

    // Close calendar if clicked outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
                setShowCalendar(false);
            }
        };
        if (showCalendar) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showCalendar]);

    const handleConfirmReservation = async (reservation: { name: string; date: string; time: string }) => {
        if (!restaurant || selectedTable === null) return;

        const userInfoString = localStorage.getItem('userInfo');
        if (!userInfoString) {
            alert("You must be logged in to make a reservation.");
            return;
        }

        const userInfo = JSON.parse(userInfoString);
        const userId = userInfo.id;

        const table = restaurant.layout.find(
            (t) => t.positionX === selectedTable.x && t.positionY === selectedTable.y
        );

        if (!table) {
            alert("Table not found.");
            return;
        }

        const startTime = new Date(`${reservation.date}T${reservation.time}`);
        const endTime = new Date(startTime.getTime() + 90 * 60000); // 90 minutes

        try {
            await makeReservation({
                userId: userId,
                restaurantId: restaurant.id,
                tableId: table.idTable,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
                status: "PENDING",
            });

            alert(`Reservation for Table ${getTableNumber(selectedTable)} confirmed on ${reservation.date} at ${reservation.time}.`);
        } catch (e) {
            alert("Failed to reserve table. Please try again.");
        }
    };

    const buildGrid = (
        tables: TableDTO[]
    ): { isTable: boolean; seats: number; reserved: boolean }[][] => {
        const ROWS = 10;
        const COLS = 10;

        const grid = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => ({
                isTable: false,
                seats: 0,
                reserved: false,
            }))
        );

        tables.forEach(t => {
            if (t.positionY >= 0 && t.positionY < ROWS && t.positionX >= 0 && t.positionX < COLS) {
                grid[t.positionY][t.positionX] = {
                    isTable: true,
                    seats: t.capacity,
                    reserved: reservedTables.has(t.idTable), // <-- mark reserved based on fetched data
                };
            }
        });

        return grid;
    };

    const getTableNumber = (pos: { x: number; y: number }) => {
        if (!restaurant) return "";

        const index = restaurant.layout.findIndex(
            t => t.positionX === pos.x && t.positionY === pos.y
        );

        return index !== -1 ? (index + 1).toString() : "";
    };




    if (loading) return <HomeLayout><p className="p-6">Loading…</p></HomeLayout>;
    if (error) return <HomeLayout><p className="p-6 text-red-600">Error: {error}</p></HomeLayout>;
    if (!restaurant) return <HomeLayout><p className="p-6">No data found.</p></HomeLayout>;

    const gridData = buildGrid(restaurant.layout);
    const availableTables = restaurant.layout
        .filter(table => table.available)
        .map((table, index) => ({
            id: table.idTable,
            label: `Table ${index + 1}`, // or use table.positionX/Y or any other label
            x: table.positionX,
            y: table.positionY,
        }));

    return (
        <HomeLayout>

            <div className="flex px-4 py-4">
            {/* Left rectangle narrower (240px) with restaurant name on top */}
                <div className="w-full max-w-[280px] p-6 border border-gray-200 rounded-2xl shadow-lg bg-white h-full flex flex-col">

                    {/* Restaurant Name and Favorite Star */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
                            {restaurant.name}
                        </h1>
                        {isFavorited ? (
                            <FaStar
                                onClick={async () => {
                                    const userInfoString = localStorage.getItem('userInfo');
                                    if (!userInfoString || !restaurant) {
                                        alert("You must be logged in to modify favorites.");
                                        return;
                                    }
                                    const { id: userId } = JSON.parse(userInfoString);
                                    try {
                                        await unmarkAsFavorite(userId, restaurant.id);
                                        setIsFavorited(false);
                                    } catch (e) {
                                        console.error("Failed to unfavorite:", e);
                                        alert("Something went wrong. Try again.");
                                    }
                                }}
                                className="text-yellow-400 cursor-pointer hover:text-yellow-500 transition-colors duration-300"
                                size={28}
                            />
                        ) : (
                            <FaRegStar
                                onClick={async () => {
                                    const userInfoString = localStorage.getItem('userInfo');
                                    if (!userInfoString || !restaurant) {
                                        alert("You must be logged in to modify favorites.");
                                        return;
                                    }
                                    const { id: userId } = JSON.parse(userInfoString);
                                    try {
                                        await markAsFavorite(userId, restaurant.id);
                                        setIsFavorited(true);
                                    } catch (e) {
                                        console.error("Failed to favorite:", e);
                                        alert("Something went wrong. Try again.");
                                    }
                                }}
                                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-300"
                                size={28}
                            />
                        )}

                    </div>

                    {/* Section Title */}
                    <h2 className="text-xl font-semibold text-gray-700 mb-6 border-b border-gray-300 pb-2">
                        Make a reservation!
                    </h2>

                    {/* Date Picker */}
                    <div className="mb-5">
                        <label htmlFor="date" className="block mb-1 font-semibold text-gray-700">
                            Choose Date:
                        </label>
                        <input
                            type="text"
                            id="date"
                            readOnly
                            placeholder="Select a date"
                            value={selectedDate ? formatDateDisplay(selectedDate) : ""}
                            onClick={() => setShowCalendar(!showCalendar)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        {showCalendar && (
                            <div
                                ref={calendarRef}
                                className="mt-1 bg-white shadow-lg rounded-lg p-3 absolute z-30"
                                style={{ width: "240px" }}
                            >
                                <CustomCalendar
                                    selected={selectedDate}
                                    onSelect={(date) => {
                                        setSelectedDate(date);
                                        setShowCalendar(false);
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Time Picker */}
                    <div className="mb-5">
                        <label htmlFor="time" className="block mb-1 font-semibold text-gray-700">
                            Choose Time:
                        </label>
                        <select
                            id="time"
                            value={selectedTime}
                            onChange={(e) => setSelectedTime(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Time</option>
                            {generateTimeBlocks().map((block) => {
                                let isPast = false;

                                if (selectedDate) {
                                    const now = new Date();
                                    const [hour, minute] = block.start.split(":").map(Number);
                                    const blockDateTime = new Date(selectedDate);
                                    blockDateTime.setHours(hour, minute, 0, 0);

                                    if (formatDate(now) === formatDate(selectedDate) && blockDateTime <= now) {
                                        isPast = true;
                                    }
                                }

                                return (
                                    <option
                                        key={block.start}
                                        value={block.start}
                                        disabled={isPast}
                                    >
                                        {block.label} {isPast ? "(Unavailable)" : ""}
                                    </option>
                                );
                            })}
                        </select>
                    </div>

                    {/* Table Picker */}
                    <div className="mb-6">
                        <label htmlFor="table" className="block mb-1 font-semibold text-gray-700">
                            Choose Table:
                        </label>
                        <select
                            id="table"
                            value={selectedTable ? `table-${selectedTable.x}-${selectedTable.y}` : ""}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    setSelectedTable(null);
                                } else {
                                    const parts = val.split("-");
                                    setSelectedTable({ x: Number(parts[1]), y: Number(parts[2]) });
                                }
                            }}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Table</option>
                            {restaurant.layout.map((table, index) => (
                                <option
                                    key={table.idTable}
                                    value={`table-${table.positionX}-${table.positionY}`}
                                    disabled={!table.available || reservedTables.has(table.idTable)}
                                >
                                    Table {index + 1} {(!table.available || reservedTables.has(table.idTable)) ? "- Unavailable" : ""}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Reserve Button */}
                    {selectedTable && selectedDate && selectedTime && (
                        <button
                            onClick={() =>
                                handleConfirmReservation({
                                    name: "N/A",
                                    date: formatDate(selectedDate),
                                    time: selectedTime,
                                })
                            }
                            className="mt-auto bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-md"
                        >
                            Reserve Table {getTableNumber(selectedTable)}
                        </button>
                    )}
                </div>
                <div className="flex-1 ml-1 pr-4 h-full">
                    <div className="w-full h-full border rounded-3xl shadow-xl p-6 bg-white">
                        <h2 className="text-xl font-semibold mb-4">Choose your desired table:</h2>

                        <div className="overflow-auto max-h-[calc(100vh-220px)]">
                            <GridLayout
                                grid={gridData}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
            {/* UserMenu just below the grid card */}
            <div className="mt-4">
                <UserMenu restaurantId={id ?? ''} />
            </div>

            <ReviewButton onClick={() => setShowReviewPopUp(true)} />

            {showReviewPopUp && (
                <ReservationReviewPopup
                    userId={JSON.parse(localStorage.getItem('userInfo') || '{}').id || ''}
                    restaurantId={restaurant.id}
                    restaurantName={restaurant.name}
                    onSubmit={handleReviewSubmit}
                    onClose={() => setShowReviewPopUp(false)}

                />
            )}
        </HomeLayout>
    );
};

export default RestaurantCardLayout;
