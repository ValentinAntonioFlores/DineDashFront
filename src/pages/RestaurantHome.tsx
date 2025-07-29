import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import GridLayout from "../components/GridLayout.tsx";
import ImageUpload from "../components/ImageUpload.tsx";
import ReservationsOverview from "../components/ReservationsOverview.tsx";
import Logout from "../components/Logout.tsx";
import { fetchGridLayout, saveGridLayout } from "../utils/TableApi.ts";
import { Table } from "../utils/TableApi";
import {fetchPendingReservationsCount as fetchNotificationsCount,  getRestaurant, saveRestaurant } from "../utils/RestaurantApi.ts";
import RestaurantReservations from "../components/RestaurantReservations.tsx";
import { motion } from "framer-motion";
import Menu from "../components/Menu.tsx";
import Map from "../components/Map.tsx";
import { Image, LayoutGrid, CalendarDays, Bell, Utensils, Map as MapIcon, LogOut, UserRound, AlertCircle, RefreshCw } from 'lucide-react';
import RestaurantEmailNotificationToggle from "../components/RestaurantEmail.tsx";
import { Toaster, toast } from 'sonner';

// Enhanced authentication utilities (inline for this example)
class AuthManager {
    private static readonly TOKEN_KEY = 'authToken';
    private static readonly USER_INFO_KEY = 'userInfo';

    static getValidToken(): string | null {
        const token = localStorage.getItem(this.TOKEN_KEY);

        if (!token) {
            console.warn('No authentication token found');
            return null;
        }

        if (this.isTokenExpired(token)) {
            console.warn('Token is expired, clearing auth data');
            this.clearAuthData();
            return null;
        }

        return token;
    }

    static isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const bufferTime = 5 * 60; // 5 minutes buffer

            return !payload.exp || payload.exp < (currentTime + bufferTime);
        } catch (error) {
            console.error('Error parsing token:', error);
            return true;
        }
    }

    static clearAuthData() {
        const keysToRemove = [
            this.TOKEN_KEY,
            this.USER_INFO_KEY,
            'token',
            'accessToken',
            'jwt'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));
        console.log('All authentication data cleared');
    }

    static getUserInfo() {
        const userInfoStr = localStorage.getItem(this.USER_INFO_KEY);
        if (!userInfoStr) return null;

        try {
            return JSON.parse(userInfoStr);
        } catch (error) {
            console.error('Error parsing user info:', error);
            return null;
        }
    }

    static isAuthenticated(): boolean {
        const token = this.getValidToken();
        const userInfo = this.getUserInfo();
        return !!(token && userInfo);
    }
}

interface UserInfo {
    id: string;
    restaurantName: string;
    email: string;
}

const RestaurantHome: React.FC = () => {
    // Navigation
    const navigate = useNavigate();

    // UI State
    const [selectedSection, setSelectedSection] = useState<"image" | "layout" | "reservations" | "notifications" |"Email" | "menu" | "map" | "logout">("image");

    // Grid State
    const [grid, setGrid] = useState<Table[][]>(
        Array.from({ length: 10 }, () =>
            Array.from({ length: 10 }, () => ({ isTable: false, seats: 0, reserved: false }))
        )
    );
    const [selectedSeats, setSelectedSeats] = useState(4);
    const [mode, setMode] = useState<"table" | "erase">("table");

    // Restaurant Data State
    const [restaurantImage, setRestaurantImage] = useState<string | null>(null);
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [pendingReservationsCount, setPendingReservationsCount] = useState<number>(0);

    // Loading and Error State
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);

    // Enhanced error handler
    const handleError = useCallback((error: any, context: string) => {
        console.error(`Error in ${context}:`, error);

        // Handle authentication errors
        if (error.name === 'AuthenticationError' ||
            error.message.includes('login again') ||
            error.message.includes('session has expired') ||
            error.message.includes('Authentication failed')) {

            console.log('Authentication error detected, redirecting to login');
            AuthManager.clearAuthData();
            toast.error('Your session has expired. Please login again.');

            // Delay redirect to show toast
            setTimeout(() => {
                navigate('/restaurant-signin', { replace: true });
            }, 1500);
            return;
        }

        // Handle other errors
        const errorMessage = error.message || `Failed to ${context}`;
        setError(errorMessage);
        toast.error(errorMessage);
    }, [navigate]);

    // Load grid with proper validation
    const loadGrid = useCallback((gridData: any[][]): Table[][] => {
        const defaultGridSize = 10;

        if (!gridData || !Array.isArray(gridData)) {
            console.warn('Invalid grid data, using default grid');
            return Array.from({ length: defaultGridSize }, () =>
                Array.from({ length: defaultGridSize }, () => ({ isTable: false, seats: 0, reserved: false }))
            );
        }

        const grid = [...gridData];

        // Expand rows if needed
        while (grid.length < defaultGridSize) {
            grid.push(new Array(defaultGridSize).fill({ isTable: false, seats: 0, reserved: false }));
        }

        // Expand columns in each row
        for (let i = 0; i < grid.length; i++) {
            if (!Array.isArray(grid[i])) {
                grid[i] = new Array(defaultGridSize).fill({ isTable: false, seats: 0, reserved: false });
                continue;
            }

            while (grid[i].length < defaultGridSize) {
                grid[i].push({ isTable: false, seats: 0, reserved: false });
            }
        }

        // Normalize each cell
        return grid.map(row =>
            row.map(cell => ({
                isTable: cell?.isTable || false,
                seats: cell?.seats || 0,
                reserved: cell?.reserved || false,
            }))
        );
    }, []);

    // Enhanced data fetching function
    const fetchData = useCallback(async (restaurantId: string, isRetry = false) => {
        try {
            if (!isRetry) {
                setLoading(true);
                setError(null);
            }

            console.log('Fetching data for restaurant:', restaurantId);

            // Check authentication before proceeding
            if (!AuthManager.isAuthenticated()) {
                throw new Error('Authentication required. Please login again.');
            }

            // Fetch all data concurrently with individual error handling
            const dataPromises = [
                fetchGridLayout(restaurantId).catch(err => {
                    console.error('Grid fetch failed:', err);
                    return null;
                }),
                getRestaurant(restaurantId).catch(err => {
                    console.error('Restaurant details fetch failed:', err);
                    return null;
                }),
                fetchNotificationsCount(restaurantId).catch(err => {
                    console.error('Notifications count fetch failed:', err);
                    return 0;
                })
            ];

            const [fetchedGrid, restaurantDetails, count] = await Promise.all(dataPromises);

            // Update grid layout
            if (fetchedGrid) {
                setGrid(loadGrid(fetchedGrid));
            } else {
                console.warn('Using default grid due to fetch failure');
            }

            // Update restaurant image
            if (restaurantDetails?.imageBase64) {
                setRestaurantImage(restaurantDetails.imageBase64);
            }

            // Update notifications count
            setPendingReservationsCount(count || 0);

            // Reset error state on success
            setError(null);
            setRetryCount(0);

            console.log('Data fetched successfully');

        } catch (error: any) {
            handleError(error, 'fetch restaurant data');
        } finally {
            setLoading(false);
        }
    }, [loadGrid, handleError]);

    // Initialize component
    useEffect(() => {
        const initializeComponent = async () => {
            console.log('Initializing RestaurantHome component');

            // Check authentication first
            if (!AuthManager.isAuthenticated()) {
                console.warn('User not authenticated, redirecting to login');
                navigate('/restaurant-signin', { replace: true });
                return;
            }

            // Get user info
            const storedUserInfo = AuthManager.getUserInfo();
            if (!storedUserInfo || !storedUserInfo.id) {
                console.error('User info not found or invalid');
                setError('User information not found. Please login again.');
                setLoading(false);
                return;
            }

            setUserInfo(storedUserInfo);

            // Fetch data
            await fetchData(storedUserInfo.id);
        };

        initializeComponent();
    }, [navigate, fetchData]);

    // Periodic refresh for notifications
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (userInfo?.id && AuthManager.isAuthenticated()) {
            const refreshCount = async () => {
                try {
                    const count = await fetchNotificationsCount(userInfo.id);
                    setPendingReservationsCount(count);
                } catch (error: any) {
                    // Silently handle periodic refresh errors unless it's auth-related
                    if (error.name === 'AuthenticationError') {
                        handleError(error, 'refresh notifications');
                    }
                }
            };

            interval = setInterval(refreshCount, 15000); // Refresh every 15 seconds
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [userInfo?.id, handleError]);

    // Enhanced logout handler
    const handleLogout = useCallback(() => {
        console.log('Logging out user');
        AuthManager.clearAuthData();
        toast.success('Logged out successfully');
        navigate('/restaurant-signin', { replace: true });
    }, [navigate]);

    // Enhanced save functions with better error handling
    const saveCurrentGridLayout = async () => {
        if (!userInfo) {
            toast.error("User not logged in. Cannot save layout.");
            return;
        }

        if (!AuthManager.isAuthenticated()) {
            handleError(new Error('Authentication required'), 'save grid layout');
            return;
        }

        try {
            toast.loading('Saving grid layout...');
            await saveGridLayout(userInfo.id, grid);
            toast.dismiss();
            toast.success("Grid layout saved successfully!");
        } catch (error: any) {
            toast.dismiss();
            handleError(error, 'save grid layout');
        }
    };

    const saveRestaurantImage = async () => {
        if (!userInfo || !restaurantImage) {
            toast.error("No image or user info found.");
            return;
        }

        if (!AuthManager.isAuthenticated()) {
            handleError(new Error('Authentication required'), 'save image');
            return;
        }

        try {
            console.log("Saving image for restaurant:", userInfo.restaurantName);
            toast.loading('Saving image...');

            await saveRestaurant({
                id: userInfo.id,
                image: restaurantImage,
            });

            toast.dismiss();
            toast.success("Image saved successfully!");
        } catch (error: any) {
            toast.dismiss();
            handleError(error, 'save restaurant image');
        }
    };

    const toggleCell = (row: number, col: number) => {
        setGrid((prevGrid) => {
            const newGrid = prevGrid.map((r, rowIndex) =>
                r.map((cell, colIndex) => {
                    return rowIndex === row && colIndex === col
                        ? {
                            ...cell,
                            isTable: mode === "table",
                            seats: mode === "table" ? selectedSeats : 0,
                        }
                        : cell;
                })
            );
            return newGrid;
        });
    };

    // Retry handler
    const handleRetry = useCallback(() => {
        if (userInfo?.id) {
            setRetryCount(prev => prev + 1);
            fetchData(userInfo.id, true);
        }
    }, [userInfo?.id, fetchData]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center bg-white p-8 rounded-2xl shadow-xl">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto mb-4"></div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Loading Restaurant Dashboard</h3>
                    <p className="text-gray-600">Please wait while we fetch your data...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !userInfo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
                <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">Error Loading Dashboard</h3>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <div className="space-x-4">
                        <button
                            onClick={handleRetry}
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2 mx-auto"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4 font-inter"
        >
            {/* Sidebar */}
            <aside className="w-64 bg-gray-900 text-white flex flex-col py-8 space-y-3 shadow-2xl rounded-2xl">
                <h3 className="text-xl font-bold text-center mb-4 text-gray-100">Restaurant Dashboard</h3>
                {[
                    { label: "Image Upload", value: "image", icon: <Image className="w-5 h-5" /> },
                    { label: "Grid Layout", value: "layout", icon: <LayoutGrid className="w-5 h-5" /> },
                    { label: "Notifications", value: "notifications", icon: <Bell className="w-5 h-5" /> },
                    { label: "Email", value: "Email", icon: <Bell className="w-5 h-5" /> },
                    { label: "Menu", value: "menu", icon: <Utensils className="w-5 h-5" /> },
                    { label: "Map", value: "map", icon: <MapIcon className="w-5 h-5" /> },
                    { label: "Personal Account", value: "logout", icon: <UserRound className="w-5 h-5" /> },
                ].map((item) => (
                    <button
                        key={item.value}
                        onClick={() => setSelectedSection(item.value as any)}
                        className={`w-11/12 mx-auto flex items-center gap-3 py-3 px-4 rounded-xl text-left font-medium transition-all duration-300 relative group
                            ${selectedSection === item.value
                            ? "bg-white text-gray-900 font-semibold shadow-xl ring-2 ring-blue-500"
                            : "hover:bg-gray-700 hover:text-white"
                        }
                        `}
                    >
                        <span className="flex-shrink-0">{item.icon}</span>
                        <span className="flex-grow">{item.label}</span>
                        {/* Conditional rendering of the pending count badge */}
                        {item.value === "notifications" && pendingReservationsCount > 0 && (
                            <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2 group-hover:scale-110 transition-transform">
                                {pendingReservationsCount}
                            </span>
                        )}
                    </button>
                ))}
            </aside>

            {/* Main Content */}
            <div className="flex-1 p-10 bg-white shadow-xl rounded-2xl overflow-y-auto ml-4">
                {/* Error banner for non-critical errors */}
                {error && userInfo && (
                    <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                        <div className="flex-grow">
                            <p className="text-sm text-yellow-800">{error}</p>
                        </div>
                        <button
                            onClick={handleRetry}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Section Title */}
                <h2 className="text-4xl font-bold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
                    {selectedSection === "image" && "Restaurant Image Upload"}
                    {selectedSection === "layout" && "Restaurant Floor Plan"}
                    {selectedSection === "reservations" && "Manage Reservations"}
                    {selectedSection === "notifications" && "Reservation Notifications"}
                    {selectedSection === "Email" && "Update your email"}
                    {selectedSection === "menu" && "Manage Restaurant Menu"}
                    {selectedSection === "map" && "Restaurant Location Map"}
                    {selectedSection === "logout" && "Personal Account Settings"}
                </h2>

                <div className="space-y-8">
                    {selectedSection === "image" && (
                        <>
                            <ImageUpload
                                restaurantImage={restaurantImage}
                                onImageChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onload = () => setRestaurantImage(reader.result as string);
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            <button
                                onClick={saveRestaurantImage}
                                disabled={!restaurantImage}
                                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
                            >
                                Save Image
                            </button>
                        </>
                    )}

                    {selectedSection === "layout" && (
                        <>
                            <GridLayout
                                grid={grid}
                                selectedSeats={selectedSeats}
                                mode={mode}
                                toggleCell={toggleCell}
                                setSelectedSeats={setSelectedSeats}
                                setMode={setMode}
                            />
                            <button
                                onClick={saveCurrentGridLayout}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all"
                            >
                                Save Grid Layout
                            </button>
                        </>
                    )}

                    {selectedSection === "reservations" && (
                        <ReservationsOverview grid={grid} toggleReservation={(row, col) => toggleCell(row, col)} />
                    )}

                    {selectedSection === "menu" && <Menu />}

                    {selectedSection === "map" && userInfo && <Map restaurantId={userInfo.id} />}

                    {selectedSection === "logout" && (
                        <div className="flex flex-col items-center max-w-lg mx-auto bg-gray-50 p-8 rounded-3xl shadow-xl border border-gray-200">
                            <UserRound className="w-16 h-16 text-blue-600 mb-6" />
                            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Personal Account</h3>
                            {userInfo && (
                                <div className="text-center mb-6 text-gray-700">
                                    <p className="text-sm font-medium">Restaurant:</p>
                                    <p className="text-xl font-bold mb-1">{userInfo.restaurantName}</p>
                                    <p className="text-md font-light">{userInfo.email}</p>
                                </div>
                            )}
                            <Logout onLogout={handleLogout} />
                        </div>
                    )}

                    {selectedSection === "notifications" && <RestaurantReservations />}

                    {selectedSection === "Email" && userInfo && (
                        <RestaurantEmailNotificationToggle restaurantId={userInfo.id} />
                    )}
                </div>
            </div>

            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                }}
            />
        </motion.div>
    );
};

export default RestaurantHome;