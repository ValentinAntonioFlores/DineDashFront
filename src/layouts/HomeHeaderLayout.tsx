import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationsBell';
import { updateClientUserLocation } from '../utils/Api'; // Ensure this path is correct
import { MapPinIcon } from '@heroicons/react/24/outline';


type Props = {
    children: ReactNode;
};

export default function HomeLayout({ children }: Props) {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null); // This will hold the actual URL or null
    const [displayAvatarContent, setDisplayAvatarContent] = useState<string | null>(null); // This will hold the URL or the first letter
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = userInfo?.id || '';

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');

        if (storedUserInfo) {
            const parsed = JSON.parse(storedUserInfo);
            const userFirstName = parsed.firstName || 'Usuario';
            setFirstName(userFirstName);
            setAvatarUrl(parsed.avatarUrl || null); // Set avatarUrl from parsed data, or null

            // Determine what to display in the avatar
            if (parsed.avatarUrl) {
                // If a URL is provided, use it
                setDisplayAvatarContent(parsed.avatarUrl);
            } else {
                // If no URL, generate a placeholder with the first letter of the name
                const firstLetter = userFirstName.charAt(0).toUpperCase();
                // Using placehold.co to generate an image with the first letter
                setDisplayAvatarContent(`https://placehold.co/150x150/F3F4F6/6B7280?text=${firstLetter}`);
            }
        }
    }, []);

    const goHome = () => {
        navigate('/');
    };

    // --- NEW: Function to handle saving current location ---
    const handleSaveCurrentLocation = async () => {
        if (!userId) {
            alert("Please log in to save your location.");
            return;
        }

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    try {
                        await updateClientUserLocation(userId, { latitude, longitude });
                        alert("Your current location has been saved!");
                    } catch (error) {
                        console.error("Error saving location:", error);
                        alert("Failed to save location. Please try again.");
                    }
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    let errorMessage = "Unable to retrieve your location.";
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied. Please enable it in your browser settings.";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information is unavailable.";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "The request to get user location timed out.";
                            break;
                        default:
                            break;
                    }
                    alert(errorMessage);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
            alert("Geolocation is not supported by your browser.");
        }
    };
    // --- END NEW FUNCTION ---

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
            {/* Header */}
            <header className="w-full bg-white shadow-lg border-b border-gray-100 py-4 px-8 md:px-16 flex items-center justify-between sticky top-0 z-[9999] transition-all duration-300 ease-in-out">
                {/* Left: Logo */}
                <div
                    className="flex items-center space-x-3 cursor-pointer group transform transition-transform duration-200 hover:scale-105"
                    onClick={goHome}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-8 h-8 text-blue-600 transition-colors duration-200 group-hover:text-blue-700"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2} // Slightly thicker stroke for icons
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" />
                    </svg>
                    <span className="text-3xl font-extrabold text-gray-800 tracking-tight transition-colors duration-200 group-hover:text-gray-900">
                        DineDash
                    </span>
                </div>

                {/* Right: Location Button + Notifications + User Info */}
                <div className="flex items-center gap-6"> {/* Increased gap between elements */}
                    {/* --- NEW: Location Button --- */}
                    <button
                        onClick={handleSaveCurrentLocation}
                        aria-label="Save Current Location"
                        title="Save my current location"
                        className="p-2 rounded-full text-gray-600 hover:bg-gray-100 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                    >
                        <MapPinIcon className="h-6 w-6 text-gray-600 hover:text-blue-600" />


                    </button>
                    {/* --- END NEW: Location Button --- */}

                    <NotificationBell userId={userId} />

                    {/* User Name */}
                    <span className="hidden sm:inline-block text-lg font-semibold text-gray-700">
                        {firstName || 'User'}
                    </span>

                    {/* Avatar Link */}
                    <Link to="/userConfiguration" className="block transform transition-transform duration-200 hover:scale-105">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-blue-400 shadow-md transition-all duration-200 hover:border-blue-600 hover:shadow-lg flex items-center justify-center">
                            {displayAvatarContent && displayAvatarContent.startsWith('http') ? (
                                <img
                                    src={displayAvatarContent}
                                    alt="User Avatar"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                // This div acts as the placeholder for the first letter
                                <div className="w-full h-full bg-gray-200 text-gray-700 text-xl font-bold flex items-center justify-center">
                                    {displayAvatarContent ? displayAvatarContent.charAt(displayAvatarContent.length -1) : ''}
                                </div>
                            )}
                        </div>
                    </Link>
                </div>
            </header>

            {/* Page Content */}
            <main className="px-6 sm:px-8 md:px-16 py-10">{children}</main>
        </div>
    );
}
