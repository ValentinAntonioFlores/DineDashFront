import { useState, useEffect, useRef } from "react";
import { fetchUserReservations, markNotificationsSeenByIds } from "../utils/Api.ts"; // Import the new function

interface Notification {
    reservationId: string;
    reservationStatus: string;
    restaurantName: string;
    // Add notificationStatus to the interface as returned by your backend
    notificationStatus: 'NOT_SEEN' | 'SEEN'; // Using explicit literals for type safety
    updatedAt: string;
    startTime: string;
}

interface NotificationBellProps {
    userId: string;
}

export default function NotificationBell({ userId }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Helper function for consistent date/time formatting
    const formatDateTime = (isoString: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);

        const dateOptions: Intl.DateTimeFormatOptions = {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        };
        const timeOptions: Intl.DateTimeFormatOptions = {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false, // Use 24-hour format
        };

        const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

        return `${formattedDate}, ${formattedTime}`;
    };

    // Fetch and filter notifications by status, sort newest first
    const loadNotifications = async () => {
        try {
            // fetchUserReservations should return Notification[] including notificationStatus
            const res: Notification[] = await fetchUserReservations(userId);

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
                // When clicking outside, treat it as closing the bell
                // and mark notifications as seen.
                if (showDropdown) { // Only run if dropdown was actually open
                    handleCloseDropdown();
                }
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [showDropdown, userId]); // Add showDropdown and userId to dependency array

    // Function to handle closing the dropdown and marking notifications as seen
    const handleCloseDropdown = async () => {
        try {
            // Get the IDs of all currently displayed notifications that are NOT_SEEN
            const unseenNotificationIds = notifications
                .filter(n => n.notificationStatus.toUpperCase() === "NOT_SEEN")
                .map(n => n.reservationId);

            if (unseenNotificationIds.length > 0) {
                // Call the backend to mark these specific notifications as seen
                await markNotificationsSeenByIds(unseenNotificationIds);
            }

            // After marking as seen, reload notifications to get the updated status
            // This will also cause the `unseenCount` to update (to 0 if all were marked seen)
            await loadNotifications();
        } catch (error) {
            console.error("Failed to mark notifications as seen:", error);
            // Optionally, handle error state or show a message to the user
        } finally {
            setShowDropdown(false); // Always close the dropdown
        }
    };

    // Toggle dropdown
    const toggleDropdown = () => {
        if (showDropdown) {
            // If currently open, user is clicking to close it
            handleCloseDropdown();
        } else {
            // If currently closed, user is clicking to open it
            setShowDropdown(true);
        }
    };

    // Calculate count of unseen notifications based on backend status
    const unseenCount = notifications.filter(
        (n) => n.notificationStatus.toUpperCase() === "NOT_SEEN"
    ).length;

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
                                    key={notif.reservationId}
                                    className={`
                                        flex items-center space-x-3 p-3 mb-2 rounded-md
                                        border border-gray-200
                                        ${
                                        notif.reservationStatus.toUpperCase() === "ACCEPTED"
                                            ? "bg-green-50 text-green-700 border-green-300"
                                            : "bg-red-50 text-red-700 border-red-300"
                                    }
                                        hover:shadow-md transition-shadow duration-200
                                        ${
                                        notif.notificationStatus.toUpperCase() === "SEEN"
                                            ? "opacity-60" // Dim seen notifications
                                            : "font-bold" // Make unseen notifications stand out
                                    }
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

                                    {/* Message content */}
                                    <div className="flex-1 text-sm font-medium leading-tight">
                                        <p>
                                            Your reservation at <strong>{notif.restaurantName}</strong>{" "}
                                            for <span className="font-semibold">{formatDateTime(notif.startTime)}</span> was{" "}
                                            <span className="capitalize font-semibold">{notif.reservationStatus}</span>.
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Updated: {formatDateTime(notif.updatedAt)}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
