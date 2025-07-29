import React, { useState, useEffect, useRef } from 'react';
import { Bell, CalendarCheck, Pencil, Shield, User, MapPin } from 'lucide-react';
import { EditableField } from "../components/EditableField.tsx";
import { useNavigate } from 'react-router-dom';
import { fetchUserReservations } from "../utils/Api.ts";
import UserMap from "../components/UserMap.tsx";
import EmailNotificationToggle from "../components/UserEmail.tsx";
import { Toaster, toast } from 'sonner';


type Props = {
    formData: {
        firstName: string;
        lastName: string;
        email: string;
        message: string;
        password: string;
        confirmPassword: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    onSave: (updatedData: Props['formData']) => void;
    userId: string;
    onSignOut: () => void;
};

// Constants for filtering
const STATUS_FILTERS = ["ALL", "PENDING", "ACCEPTED", "REJECTED"];

const generateTimeBlocks = () => [
    { label: "5:00 PM - 6:30 PM", start: "17:00", end: "18:30" },
    { label: "6:30 PM - 8:00 PM", start: "18:30", end: "20:00" },
    { label: "8:00 PM - 9:30 PM", start: "20:00", end: "21:30" },
    { label: "9:30 PM - 11:00 PM", start: "21:30", end: "23:00" },
    { label: "1:00 AM - 2:30 AM", start: "01:00", end: "02:30" },
];

const RESERVATIONS_PER_PAGE = 6; // Fewer per page for user view

export const UserConfigurationLayout: React.FC<Props> = ({ formData, onChange, onSave, userId, onSignOut }) => {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState<string>('Profile Settings');
    const [isEditingAll, setIsEditingAll] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [currentFormData, setCurrentFormData] = useState(formData);
    const [reservations, setReservations] = useState<any[]>([]);

    // Filtering states
    const [filter, setFilter] = useState<string>("ALL");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [filterDate, setFilterDate] = useState<string>("");
    const [filterStartTime, setFilterStartTime] = useState<string>("");
    const [filterEndTime, setFilterEndTime] = useState<string>("");
    const [currentPage, setCurrentPage] = useState<number>(1);

    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setCurrentFormData(formData);
    }, [formData]);

    useEffect(() => {
        const loadReservations = async () => {
            if (selectedCard === 'Reservations' && userId) {
                try {
                    const data = await fetchUserReservations(userId);
                    setReservations(data);
                    setCurrentPage(1); // Reset to first page when reservations are loaded
                } catch (error) {
                    console.error("Failed to fetch reservations:", error);
                }
            }
        };

        loadReservations();
    }, [selectedCard, userId]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

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
            hour12: false,
        };

        const formattedDate = date.toLocaleDateString('en-GB', dateOptions);
        const formattedTime = date.toLocaleTimeString('en-GB', timeOptions);

        return `${formattedDate}, ${formattedTime}`;
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

    // Filter reservations logic
    const filteredReservations = reservations.filter((r) => {
        const matchesStatus = filter === "ALL" || r.reservationStatus === filter;

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

    // Pagination logic
    const indexOfLastReservation = currentPage * RESERVATIONS_PER_PAGE;
    const indexOfFirstReservation = indexOfLastReservation - RESERVATIONS_PER_PAGE;
    const currentReservations = filteredReservations.slice(indexOfFirstReservation, indexOfLastReservation);
    const totalPages = Math.ceil(filteredReservations.length / RESERVATIONS_PER_PAGE);

    const paginate = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:8000/clientUsers/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            localStorage.removeItem('authToken');
            toast.success("Account deleted successfully!");
            navigate('/signup');
        } catch (error) {
            console.error('Error deleting account:', error);
            toast.error('Failed to delete account. Please try again.');
        }
    };

    const handleSaveAll = async () => {
        if (!currentFormData) return;

        if (changePassword) {
            const password = currentFormData.password.trim();
            const confirmPassword = currentFormData.confirmPassword.trim();

            if (password !== confirmPassword) {
                toast.error("Passwords do not match.");
                return;
            }

            if (password.length < 6) {
                toast.error("Password must be at least 6 characters long.");
                return;
            }
        }

        try {
            onSave(currentFormData);
            setIsEditingAll(false);
            setChangePassword(false);
        } catch (error) {
            console.error("Error updating user:", error);
            toast.error("There was an error updating your information. Please try again later.");
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
            {/* Sidebar */}
            <aside
                className="w-64 bg-white border border-gray-200 p-6 shadow-xl flex flex-col transition-all duration-300 ease-in-out rounded-2xl">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Settings Menu</h3>
                <nav className="space-y-3">
                    {[
                        {label: 'Profile Settings', icon: <User className="w-5 h-5"/>},
                        {label: 'Email', icon: <Pencil className="w-5 h-5"/>},
                        {label: 'Reservations', icon: <CalendarCheck className="w-5 h-5"/>},
                        {label: 'My Location', icon: <MapPin className="w-5 h-5"/>}
                    ].map(({label, icon}) => (
                        <button
                            key={label}
                            onClick={() => setSelectedCard(label)}
                            className={`flex items-center w-full gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
          ${selectedCard === label
                                ? 'bg-blue-600 text-white shadow-lg transform translate-x-1'
                                : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 hover:shadow-sm'}`}
                        >
                            {icon}
                            <span>{label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-8 space-y-3">
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Delete Account
                    </button>
                    <button
                        onClick={onSignOut}
                        className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 p-10 overflow-y-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto space-y-8">
                    <header className="flex justify-between items-center border-b border-gray-200 pb-4">
                        <h2 className="text-3xl font-bold text-gray-900">{selectedCard}</h2>
                        {selectedCard === 'Profile Settings' && (
                            <button
                                onClick={() => setIsEditingAll(!isEditingAll)}
                                className="p-2 rounded-full text-gray-500 hover:text-blue-600 hover:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Toggle Edit Mode"
                            >
                                <Pencil size={24}/>
                            </button>
                        )}
                    </header>

                    <section className="space-y-8">
                        {selectedCard === 'Profile Settings' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <EditableField
                                        label="First Name"
                                        name="firstName"
                                        value={currentFormData.firstName}
                                        onChange={(e) => setCurrentFormData(prev => ({
                                            ...prev,
                                            firstName: e.target.value
                                        }))}
                                        isEditing={isEditingAll}
                                    />
                                    <EditableField
                                        label="Last Name"
                                        name="lastName"
                                        value={currentFormData.lastName}
                                        onChange={(e) => setCurrentFormData(prev => ({
                                            ...prev,
                                            lastName: e.target.value
                                        }))}
                                        isEditing={isEditingAll}
                                    />
                                </div>

                                <EditableField
                                    label="Email"
                                    name="email"
                                    value={currentFormData.email}
                                    onChange={(e) => setCurrentFormData(prev => ({...prev, email: e.target.value}))}
                                    isEditing={isEditingAll}
                                />

                                {isEditingAll && (
                                    <label
                                        className="flex items-center gap-2 text-base font-medium text-gray-700 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={changePassword}
                                            onChange={(e) => setChangePassword(e.target.checked)}
                                            className="accent-blue-600 w-5 h-5"
                                        />
                                        Change Password
                                    </label>
                                )}

                                {changePassword && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <EditableField
                                            label="Password"
                                            name="password"
                                            value={currentFormData.password}
                                            onChange={(e) => setCurrentFormData(prev => ({
                                                ...prev,
                                                password: e.target.value
                                            }))}
                                            isEditing={isEditingAll}
                                            type="password"
                                        />
                                        <EditableField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            value={currentFormData.confirmPassword}
                                            onChange={(e) => setCurrentFormData(prev => ({
                                                ...prev,
                                                confirmPassword: e.target.value
                                            }))}
                                            isEditing={isEditingAll}
                                            type="password"
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveAll}
                                    className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${
                                        isEditingAll
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed opacity-70'
                                    }`}
                                    disabled={!isEditingAll}
                                >
                                    Save Changes
                                </button>
                            </>
                        )}

                        {selectedCard === 'Account Info' && (
                            <textarea
                                name="message"
                                value={currentFormData.message}
                                onChange={onChange}
                                placeholder="Your message..."
                                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition-all duration-200 text-base"
                                rows={6}
                            />
                        )}

                        {selectedCard === 'Email' && (
                            <EmailNotificationToggle userId={userId}/>
                        )}

                        {selectedCard === 'Notifications' &&
                            <p className="text-lg text-gray-600">Manage your notification preferences here.</p>}
                        {selectedCard === 'Privacy' &&
                            <p className="text-lg text-gray-600">Adjust your privacy settings.</p>}

                        {selectedCard === 'Reservations' && (
                            <div className="space-y-6">
                                {/* Filtering Controls */}
                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                                    <h3 className="text-lg font-semibold mb-4 text-gray-900">Filter Reservations</h3>

                                    {/* Date and Time Block Filters */}
                                    <div className="flex flex-wrap gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                            <input
                                                type="date"
                                                value={filterDate}
                                                onChange={(e) => {
                                                    setFilterDate(e.target.value);
                                                    setCurrentPage(1);
                                                }}
                                                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time
                                                Block</label>
                                            <select
                                                onChange={(e) => {
                                                    const block = generateTimeBlocks().find(b => b.label === e.target.value);
                                                    if (block) {
                                                        setFilterStartTime(block.start);
                                                        setFilterEndTime(block.end);
                                                    } else {
                                                        setFilterStartTime("");
                                                        setFilterEndTime("");
                                                    }
                                                    setCurrentPage(1);
                                                }}
                                                className="border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
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

                                    {/* Status Filter Dropdown */}
                                    <div className="relative w-48" ref={dropdownRef}>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                        <button
                                            onClick={() => setDropdownOpen(!dropdownOpen)}
                                            className="w-full flex justify-between items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition focus:ring-2 focus:ring-blue-300 focus:border-blue-300"
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
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                                            </svg>
                                        </button>
                                        {dropdownOpen && (
                                            <ul className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                                                {STATUS_FILTERS.map((status) => (
                                                    <li
                                                        key={status}
                                                        onClick={() => {
                                                            setFilter(status);
                                                            setDropdownOpen(false);
                                                            setCurrentPage(1);
                                                        }}
                                                        className={`px-4 py-2 cursor-pointer hover:bg-blue-600 hover:text-white transition ${
                                                            filter === status ? "bg-blue-100 font-medium" : ""
                                                        }`}
                                                    >
                                                        {status}
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>

                                {/* Reservations Display */}
                                {filteredReservations.length === 0 ? (
                                    <p className="text-lg text-gray-500 italic text-center py-8">
                                        {reservations.length === 0
                                            ? "You have no reservations yet."
                                            : "No reservations match your current filters."}
                                    </p>
                                ) : (
                                    <>
                                        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                                            {currentReservations.map((res, i) => (
                                                <div key={indexOfFirstReservation + i}
                                                     className="bg-white border border-gray-200 rounded-xl p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform">
                                                    <p className="text-sm text-gray-500 mb-2">Reservation
                                                        #{indexOfFirstReservation + i + 1}</p>
                                                    <p className="mt-1 text-lg"><span
                                                        className="font-semibold text-gray-800">Restaurant:</span> {res.restaurantName}
                                                    </p>
                                                    <p className="text-md text-gray-700"><span
                                                        className="font-semibold">Start Time:</span> {formatDateTime(res.startTime)}
                                                    </p>
                                                    <p className="text-md text-gray-700"><span
                                                        className="font-semibold">End Time:</span> {formatDateTime(res.endTime)}
                                                    </p>
                                                    <p className="mt-2"><span
                                                        className="font-semibold text-gray-800">Status:</span> <span
                                                        className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                            res.reservationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                                res.reservationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                                    'bg-yellow-100 text-yellow-800'
                                                        }`}>{res.reservationStatus}</span></p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Pagination Controls */}
                                        {totalPages > 1 && (
                                            <div className="flex justify-center mt-8 space-x-2">
                                                <button
                                                    onClick={() => paginate(currentPage - 1)}
                                                    disabled={currentPage === 1}
                                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                                        ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                                >
                                                    Previous
                                                </button>

                                                {Array.from({length: totalPages}, (_, i) => i + 1).map((pageNumber) => (
                                                    <button
                                                        key={pageNumber}
                                                        onClick={() => paginate(pageNumber)}
                                                        className={`px-4 py-2 rounded-lg transition-all duration-200
                                                            ${currentPage === pageNumber ? 'bg-blue-700 text-white font-bold' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                                                    >
                                                        {pageNumber}
                                                    </button>
                                                ))}

                                                <button
                                                    onClick={() => paginate(currentPage + 1)}
                                                    disabled={currentPage === totalPages}
                                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                                        ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                                >
                                                    Next
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {selectedCard === 'My Location' && (
                            <UserMap/>
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
}