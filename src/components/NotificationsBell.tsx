import { useState, useEffect, useRef } from "react";
import { fetchUserReservations } from "../utils/Api.ts";

interface Notification {
    id: string;
    reservationStatus: string;
    restaurantName: string;
    updatedAt: string;
}

interface NotificationBellProps {
    userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [seenUpdated, setSeenUpdated] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Fetch and filter notifications by status, sort newest first
    const loadNotifications = async () => {
        try {
            const res = await fetchUserReservations(userId);
            const filtered = res
                .filter(
                    (r: Notification) =>
                        r.reservationStatus &&
                        ["ACCEPTED", "REJECTED"].includes(r.reservationStatus.toUpperCase())
                )
                .sort(
                    (a, b) =>
                        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );

            setNotifications(filtered);
        } catch (error) {
            console.error("Error fetching notifications", error);
        }
    };

    // Initial load + reload every 30s
    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, [userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Toggle dropdown and mark notifications as seen
    const toggleDropdown = () => {
        if (!showDropdown) {
            const seen = JSON.parse(localStorage.getItem("seenNotifications") || "[]");
            const currentIds = notifications.map((n) => n.id);
            const updatedSeen = Array.from(new Set([...seen, ...currentIds]));
            localStorage.setItem("seenNotifications", JSON.stringify(updatedSeen));
            setSeenUpdated((v) => !v); // trigger re-render for unseen count
        }
        setShowDropdown(!showDropdown);
    };

    // Calculate count of unseen notifications
    const unseenCount = (() => {
        const seen = JSON.parse(localStorage.getItem("seenNotifications") || "[]");
        return notifications.filter((n) => !seen.includes(n.id)).length;
    })();

    return (
        <div className="relative">
            <button
                onClick={toggleDropdown}
                aria-label="Notifications"
                className="relative p-1 rounded-full hover:bg-gray-200 focus:outline-none"
            >
                {/* Bell Icon */}
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-6 h-6 text-gray-700"
                >
                    <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {unseenCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2">
            {unseenCount}
          </span>
                )}
            </button>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50"
                >
                    <div className="p-4 text-sm text-gray-700 font-semibold border-b border-gray-200">
                        Notifications
                    </div>

                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500">No notifications</div>
                    ) : (
                        <ul className="max-h-60 overflow-y-auto">
                            {notifications.map((notif) => (
                                <li
                                    key={notif.id}
                                    className={`
    flex items-center space-x-3 p-3 mb-2 rounded-md
    border border-gray-200
    ${
                                        notif.reservationStatus.toUpperCase() === "ACCEPTED"
                                            ? "bg-green-50 text-green-700 border-green-300"
                                            : "bg-red-50 text-red-700 border-red-300"
                                    }
    hover:shadow-md transition-shadow duration-200
  `}
                                >
                                    {/* Status icon */}
                                    {notif.reservationStatus.toUpperCase() === "ACCEPTED" ? (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 flex-shrink-0"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth={3}
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}

                                    {/* Message */}
                                    <p className="flex-1 text-sm font-medium leading-tight">
                                        Your reservation at <strong>{notif.restaurantName}</strong> was{" "}
                                        <span className="capitalize font-semibold">{notif.reservationStatus}</span>.
                                    </p>
                                </li>

                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
