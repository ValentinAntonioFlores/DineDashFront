import React, { useState, useEffect } from 'react';
import { Bell, CalendarCheck, Pencil, Shield, User, MapPin } from 'lucide-react';
import { EditableField } from "../components/EditableField.tsx";
import { useNavigate } from 'react-router-dom';
import { fetchUserReservations } from "../utils/Api.ts";
import UserMap from "../components/UserMap.tsx";


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

export const UserConfigurationLayout: React.FC<Props> = ({ formData, onChange, onSave, userId, onSignOut }) => {
    const navigate = useNavigate();
    const [selectedCard, setSelectedCard] = useState<string>('Profile Settings');
    const [isEditingAll, setIsEditingAll] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [currentFormData, setCurrentFormData] = useState(formData);
    const [reservations, setReservations] = useState<any[]>([]);

    useEffect(() => {
        setCurrentFormData(formData);
    }, [formData]);

    useEffect(() => {
        const loadReservations = async () => {
            if (selectedCard === 'Reservations' && userId) {
                try {
                    const data = await fetchUserReservations(userId);
                    setReservations(data);
                } catch (error) {
                    console.error("Failed to fetch reservations:", error);
                }
            }
        };

        loadReservations();
    }, [selectedCard, userId]);

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
            alert("Account deleted successfully!");
            navigate('/signup');
        } catch (error) {
            console.error('Error deleting account:', error);
            alert('Failed to delete account. Please try again.');
        }
    };

    const handleSaveAll = async () => {
        if (!currentFormData) return;

        if (changePassword) {
            const password = currentFormData.password.trim();
            const confirmPassword = currentFormData.confirmPassword.trim();

            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            if (password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }
        }

        try {
            onSave(currentFormData);
            setIsEditingAll(false);
            setChangePassword(false);
        } catch (error) {
            console.error("Error updating user:", error);
            alert("There was an error updating your information. Please try again later.");
        }
    };

    return (
        <div className="flex w-full min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800">
            {/* Sidebar */}
            {/* Removed ml-4 and my-4 to make it flush with the left and fully rounded */}
            <aside className="w-64 bg-white border border-gray-200 p-6 shadow-xl flex flex-col transition-all duration-300 ease-in-out rounded-2xl">
                <h3 className="text-xl font-bold mb-6 text-gray-900">Settings Menu</h3>
                <nav className="space-y-3">
                    {[
                        { label: 'Profile Settings', icon: <User className="w-5 h-5" /> },
                        { label: 'Account Info', icon: <Pencil className="w-5 h-5" /> },
                        { label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
                        { label: 'Privacy', icon: <Shield className="w-5 h-5" /> },
                        { label: 'Reservations', icon: <CalendarCheck className="w-5 h-5" /> },
                        { label: 'My Location', icon: <MapPin className="w-5 h-5" /> }
                    ].map(({ label, icon }) => (
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
                                <Pencil size={24} />
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
                                        onChange={(e) => setCurrentFormData(prev => ({ ...prev, firstName: e.target.value }))}
                                        isEditing={isEditingAll}
                                    />
                                    <EditableField
                                        label="Last Name"
                                        name="lastName"
                                        value={currentFormData.lastName}
                                        onChange={(e) => setCurrentFormData(prev => ({ ...prev, lastName: e.target.value }))}
                                        isEditing={isEditingAll}
                                    />
                                </div>

                                <EditableField
                                    label="Email"
                                    name="email"
                                    value={currentFormData.email}
                                    onChange={(e) => setCurrentFormData(prev => ({ ...prev, email: e.target.value }))}
                                    isEditing={isEditingAll}
                                />

                                {isEditingAll && (
                                    <label className="flex items-center gap-2 text-base font-medium text-gray-700 cursor-pointer">
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
                                            onChange={(e) => setCurrentFormData(prev => ({ ...prev, password: e.target.value }))}
                                            isEditing={isEditingAll}
                                            type="password"
                                        />
                                        <EditableField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            value={currentFormData.confirmPassword}
                                            onChange={(e) => setCurrentFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
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

                        {selectedCard === 'Notifications' && <p className="text-lg text-gray-600">Manage your notification preferences here.</p>}
                        {selectedCard === 'Privacy' && <p className="text-lg text-gray-600">Adjust your privacy settings.</p>}

                        {selectedCard === 'Reservations' && (
                            <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2">
                                {reservations.length === 0 ? (
                                    <p className="text-lg text-gray-500 italic">You have no reservations yet.</p>
                                ) : (
                                    reservations.map((res, i) => (
                                        <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 transform">
                                            <p className="text-sm text-gray-500 mb-2">Reservation #{i + 1}</p>
                                            <p className="mt-1 text-lg"><span className="font-semibold text-gray-800">Restaurant:</span> {res.restaurantName}</p>
                                            <p className="text-md text-gray-700"><span className="font-semibold">Start Time:</span> {formatDateTime(res.startTime)}</p>
                                            <p className="text-md text-gray-700"><span className="font-semibold">End Time:</span> {formatDateTime(res.endTime)}</p>
                                            <p className="mt-2"><span className="font-semibold text-gray-800">Status:</span> <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                                                res.reservationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    res.reservationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-800'
                                            }`}>{res.reservationStatus}</span></p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {selectedCard === 'My Location' && (
                            <UserMap />
                        )}
                    </section>
                </div>
            </main>
        </div>
    );
};
