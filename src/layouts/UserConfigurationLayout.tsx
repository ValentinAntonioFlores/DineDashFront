import React, { useState, useEffect } from 'react';
import {Bell, CalendarCheck, Pencil, Shield, User} from 'lucide-react';
import { EditableField } from "../components/EditableField.tsx";
import { useNavigate } from 'react-router-dom';
import { fetchUserReservations } from "../utils/Api.ts";
import UserMap from "../components/UserMap.tsx";
import { IoLocationSharp } from "react-icons/io5";


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
};

export const UserConfigurationLayout: React.FC<Props> = ({ formData, onChange, onSave, userId }) => {
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
        <div className="flex h-screen bg-gray-50 text-gray-800">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r p-4 shadow-md rounded-r-xl flex flex-col">
                <nav className="space-y-2">
                    {[
                        { label: 'Profile Settings', icon: <Pencil className="w-4 h-4" /> },
                        { label: 'Account Info', icon: <User className="w-4 h-4" /> },
                        { label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
                        { label: 'Privacy', icon: <Shield className="w-4 h-4" /> },
                        { label: 'Reservations', icon: <CalendarCheck className="w-4 h-4" /> },
                        { label: 'My Location', icon: <IoLocationSharp className="w-4 h-4" />}
                    ].map(({ label, icon }) => (
                        <button
                            key={label}
                            onClick={() => setSelectedCard(label)}
                            className={`flex items-center w-full gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all
          ${selectedCard === label
                                ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                                : 'text-gray-600 hover:bg-gray-100 hover:text-blue-600'}`}
                        >
                            {icon}
                            {label}
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6">
                    <button
                        onClick={handleDeleteAccount}
                        className="w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                    >
                        Delete Account
                    </button>
                </div>
            </aside>


            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <div className="bg-white rounded-xl shadow-md p-6 max-w-4xl mx-auto space-y-6">
                    <header className="flex justify-between items-center">
                        <h2 className="text-2xl font-semibold">{selectedCard}</h2>
                        {selectedCard === 'Profile Settings' && (
                            <button
                                onClick={() => setIsEditingAll(!isEditingAll)}
                                className="text-gray-500 hover:text-gray-700"
                                title="Toggle Edit Mode"
                            >
                                <Pencil size={20} />
                            </button>
                        )}
                    </header>

                    <section className="space-y-6">
                        {selectedCard === 'Profile Settings' && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={changePassword}
                                            onChange={(e) => setChangePassword(e.target.checked)}
                                            className="accent-blue-500"
                                        />
                                        Change Password
                                    </label>
                                )}

                                {changePassword && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <EditableField
                                            label="Password"
                                            name="password"
                                            value={currentFormData.password}
                                            onChange={(e) => setCurrentFormData(prev => ({ ...prev, password: e.target.value }))}
                                            isEditing={isEditingAll}
                                        />
                                        <EditableField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            value={currentFormData.confirmPassword}
                                            onChange={(e) => setCurrentFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            isEditing={isEditingAll}
                                        />
                                    </div>
                                )}

                                <button
                                    onClick={handleSaveAll}
                                    className={`w-full py-2 text-white font-semibold rounded-lg transition ${
                                        isEditingAll
                                            ? 'bg-blue-600 hover:bg-blue-700'
                                            : 'bg-gray-400 cursor-not-allowed'
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
                                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-200"
                                rows={5}
                            />
                        )}

                        {selectedCard === 'Notifications' && <p className="text-gray-600">Manage your notification preferences here.</p>}
                        {selectedCard === 'Privacy' && <p className="text-gray-600">Adjust your privacy settings.</p>}

                        {selectedCard === 'Reservations' && (
                            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                                {reservations.length === 0 ? (
                                    <p className="text-gray-500">You have no reservations yet.</p>
                                ) : (
                                    reservations.map((res, i) => (
                                        <div key={i} className="bg-white border rounded-lg p-4 shadow-sm transition hover:shadow-md">
                                            <p className="text-sm text-gray-500">Reservation #{i + 1}</p>
                                            <p className="mt-1"><span className="font-semibold">Restaurant:</span> {res.restaurantName}</p>
                                            <p><span className="font-semibold">Date:</span> {res.date}</p>
                                            <p><span className="font-semibold">Time:</span> {res.time}</p>
                                            <p><span className="font-semibold">Table:</span> {res.tableId}</p>
                                            <p><span className="font-semibold">Status:</span> <span className={`px-2 py-1 text-xs rounded ${
                                                res.reservationStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                                                    res.reservationStatus === 'REJECTED' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'
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
