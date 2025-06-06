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
        const dateString = reservationDate.toISOString().split("T")[0]; // "YYYY-MM-DD"
        const timeString = reservationDate.toTimeString().slice(0, 5); // "HH:mm"

        const matchesDate = !filterDate || filterDate === dateString;
        const matchesStartTime = !filterStartTime || timeString >= filterStartTime;
        const matchesEndTime = !filterEndTime || timeString <= filterEndTime;

        return matchesStatus && matchesDate && matchesStartTime && matchesEndTime;
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input
                        type="time"
                        value={filterStartTime}
                        onChange={(e) => setFilterStartTime(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input
                        type="time"
                        value={filterEndTime}
                        onChange={(e) => setFilterEndTime(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1"
                    />
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
                                    {new Date(res.startTime).toLocaleString()}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-800">End Time:</span>{" "}
                                    {new Date(res.endTime).toLocaleString()}
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
