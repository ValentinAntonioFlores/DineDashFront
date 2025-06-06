import React, { useEffect, useState, useRef } from "react";
import { fetchRestaurantReservations } from "../utils/RestaurantApi.ts";
import { format } from "date-fns";


type Reservation = {
    reservationId: string;
    clientUserName: string;
    tableId: string;
    status: string;
    startTime: string;
    endTime: string;
};

const STATUS_FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED"];

const generateTimeBlocks = () => [
    { label: "5:00 PM - 6:30 PM", start: "17:00", end: "18:30" },
    { label: "6:30 PM - 8:00 PM", start: "18:30", end: "20:00" },
    { label: "8:00 PM - 9:30 PM", start: "20:00", end: "21:30" },
    { label: "9:30 PM - 11:00 PM", start: "21:30", end: "23:00" },
    { label: "1:00 AM - 2:30 AM", start: "01:00", end: "02:30" },
];


const RestaurantReservations = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [filter, setFilter] = useState<string>("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const storedUserInfo = localStorage.getItem("userInfo");
    const restaurantId = storedUserInfo ? JSON.parse(storedUserInfo).id : null;
    const [filterDate, setFilterDate] = useState<string>("");
    const [filterStartTime, setFilterStartTime] = useState<string>("");
    const [filterEndTime, setFilterEndTime] = useState<string>("");



    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchReservations = async () => {
        if (!restaurantId) {
            console.warn("No restaurantId found in localStorage");
            return;
        }
        try {
            const data = await fetchRestaurantReservations(restaurantId);
            setReservations(data);
        } catch (error) {
            console.error("Failed to fetch reservations", error);
        }
    };


    useEffect(() => {
        fetchReservations();
    }, []);

    const updateStatus = async (
        reservationId: string,
        status: "ACCEPTED" | "REJECTED"
    ) => {
        try {
            await fetch("http://localhost:8000/reservations/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reservationId, status }),
            });
            fetchReservations();
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

    const isInTimeBlock = (reservationStart: Date, reservationEnd: Date, blockStart: string, blockEnd: string) => {
        const resStart = reservationStart.getHours() * 60 + reservationStart.getMinutes();
        const resEnd = reservationEnd.getHours() * 60 + reservationEnd.getMinutes();

        const [blockStartHour, blockStartMinute] = blockStart.split(":").map(Number);
        const [blockEndHour, blockEndMinute] = blockEnd.split(":").map(Number);

        const blockStartMinutes = blockStartHour * 60 + blockStartMinute;
        const blockEndMinutes = blockEndHour * 60 + blockEndMinute;

        // Only show reservations that are fully within the block
        return resStart >= blockStartMinutes && resEnd <= blockEndMinutes;
    };


    // Close dropdown if clicked outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const filteredReservations = reservations.filter((r) => {
        const matchesStatus = filter === "ALL" || r.status === filter;

        const reservationDate = new Date(r.startTime);
        const dateString = reservationDate.getFullYear().toString().padStart(4, '0') + '-' +
            (reservationDate.getMonth() + 1).toString().padStart(2, '0') + '-' +
            reservationDate.getDate().toString().padStart(2, '0');


        const matchesDate = !filterDate || filterDate === dateString;
        let matchesTimeBlock = true;
        if (filterStartTime && filterEndTime) {
            const reservationStart = new Date(r.startTime);
            const reservationEnd = new Date(r.endTime);
            matchesTimeBlock = isInTimeBlock(reservationStart, reservationEnd, filterStartTime, filterEndTime);
        }


        return matchesStatus && matchesDate && matchesTimeBlock;
    });

    const formatDateTime = (isoString: string) =>
        new Date(isoString).toLocaleString("en-GB", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        });



    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Reservations</h2>


            <div className="flex gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Block</label>
                    <select
                        onChange={(e) => {
                            const block = generateTimeBlocks().find(b => b.label === e.target.value);
                            if (block) {
                                setFilterStartTime(block.start);
                                setFilterEndTime(block.end);
                            } else {
                                // If no block is selected (i.e. "All Time Blocks"), clear the time filters
                                setFilterStartTime("");
                                setFilterEndTime("");
                            }
                        }}
                        className="border border-gray-300 rounded px-2 py-1"
                        value={
                            generateTimeBlocks().find(
                                b => b.start === filterStartTime && b.end === filterEndTime
                            )?.label || ""
                        }
                    >
                        <option value="">All Time Blocks</option>
                        {generateTimeBlocks().map((block) => (
                            <option key={block.label} value={block.label}>
                                {block.label}
                            </option>
                        ))}
                    </select>

                </div>
            </div>
            {/* Filter Dropdown */}
            <div className="relative w-48 mb-6" ref={dropdownRef}>
                <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition"
                >
                    <span className="capitalize">{filter.toLowerCase()}</span>
                    <svg
                        className={`w-4 h-4 ml-2 transition-transform ${
                            dropdownOpen ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
                {dropdownOpen && (
                    <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden animate-fade-in">
                        {STATUS_FILTERS.map((status) => (
                            <li
                                key={status}
                                onClick={() => {
                                    setFilter(status);
                                    setDropdownOpen(false);
                                }}
                                className={`px-4 py-2 cursor-pointer hover:bg-blue-600 hover:text-white ${
                                    filter === status ? "bg-blue-100 font-medium" : ""
                                }`}
                            >
                                {status}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {/* Reservation List */}
            {filteredReservations.length === 0 ? (
                <p className="text-gray-500 italic">
                    No reservations {filter !== "ALL" ? `with status ${filter}` : ""}.
                </p>
            ) : (
                <div className="space-y-4">
                    {filteredReservations.map((res) => (
                        <div
                            key={res.reservationId}
                            className="flex justify-between items-center bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition"
                        >
                            <div className="space-y-1">
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">User:</span>{" "}
                                    {res.clientUserName}
                                </p>
                                <p className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-800">Start Time:</span>{" "}
                                    {formatDateTime(res.startTime)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">End Time:</span>{" "}
                                    {formatDateTime(res.endTime)}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">Table:</span>{" "}
                                    {res.tableId}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">Status:</span>{" "}
                                    <span
                                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                            res.status === "ACCEPTED"
                                                ? "bg-green-100 text-green-700"
                                                : res.status === "REJECTED"
                                                    ? "bg-red-100 text-red-700"
                                                    : "bg-yellow-100 text-yellow-800"
                                        }`}
                                    >
                {res.status}
              </span>
                                </p>
                            </div>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => updateStatus(res.reservationId, "ACCEPTED")}
                                    className="text-green-600 hover:text-green-800 transition transform hover:scale-110"
                                    title="Accept"
                                >
                                    ✅
                                </button>
                                <button
                                    onClick={() => updateStatus(res.reservationId, "REJECTED")}
                                    className="text-red-600 hover:text-red-800 transition transform hover:scale-110"
                                    title="Reject"
                                >
                                    ❌
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RestaurantReservations;
