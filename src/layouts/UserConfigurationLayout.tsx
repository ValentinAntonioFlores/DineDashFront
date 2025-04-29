import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { EditableField } from "../components/EditableField.tsx";
import { useNavigate } from 'react-router-dom'; // <-- import this

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
    const navigate = useNavigate(); // <-- Add this hook
    const [selectedCard, setSelectedCard] = useState<string>('Profile Settings');
    const [isEditingAll, setIsEditingAll] = useState(false);
    const [changePassword, setChangePassword] = useState(false);
    const [currentFormData, setCurrentFormData] = useState(formData);

    useEffect(() => {
        setCurrentFormData(formData);
    }, [formData]);


    const handleDeleteAccount = async () => {
        if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
            return;
        }

        try {
            const token = localStorage.getItem('authToken');
            await fetch(`http://localhost:8000/clientUsers/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token ? `Bearer ${token}` : '',
                },
            });

            localStorage.removeItem('authToken'); // clear token
            alert("Account deleted successfully!");
            navigate('/signup'); // redirect after delete
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
        <div className="bg-white h-screen flex">
            {/* Sidebar */}
            <div className="w-[250px] bg-gray-100 p-4 flex flex-col justify-between h-full">
                <div className="space-y-2">
                    {['Profile Settings', 'Account Info', 'Notifications', 'Privacy'].map((label) => (
                        <SidebarCard
                            key={label}
                            label={label}
                            onClick={() => setSelectedCard(label)}
                            selected={selectedCard === label}
                        />
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleDeleteAccount}
                    className="w-full text-white bg-red-500 hover:bg-red-600 p-2 rounded"
                >
                    Delete Account
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
                <div className="bg-gray-100 p-6 rounded shadow-md w-full max-w-[1000px] space-y-6">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-2xl font-semibold text-center">{selectedCard}</h2>
                        {selectedCard === 'Profile Settings' && (
                            <button
                                onClick={() => setIsEditingAll(!isEditingAll)}
                                className="text-gray-500 hover:text-gray-700"
                                title="Edit All"
                            >
                                <Pencil size={20} />
                            </button>
                        )}
                    </div>

                    {selectedCard === 'Profile Settings' && (
                        <>
                            <div className="flex gap-4">
                                <EditableField
                                    label="First Name"
                                    name="firstName"
                                    value={currentFormData.firstName || ""}
                                    onChange={(e) =>
                                        setCurrentFormData((prev) => ({
                                            ...prev,
                                            firstName: e.target.value,
                                        }))
                                    }
                                    isEditing={isEditingAll}
                                />
                                <EditableField
                                    label="Last Name"
                                    name="lastName"
                                    value={currentFormData.lastName || ""}
                                    onChange={(e) =>
                                        setCurrentFormData((prev) => ({
                                            ...prev,
                                            lastName: e.target.value,
                                        }))
                                    }
                                    isEditing={isEditingAll}
                                />
                            </div>
                            <EditableField
                                label="Email"
                                name="email"
                                value={currentFormData.email || ""}
                                onChange={(e) =>
                                    setCurrentFormData((prev) => ({
                                        ...prev,
                                        email: e.target.value,
                                    }))
                                }
                                isEditing={isEditingAll}
                            />

                            {isEditingAll && (
                                <label className="flex items-center gap-2 text-sm text-gray-700">
                                    <input
                                        type="checkbox"
                                        checked={changePassword}
                                        onChange={(e) => setChangePassword(e.target.checked)}
                                    />
                                    Change Password
                                </label>
                            )}

                            <div className="flex gap-4">
                                <div className="w-1/2">
                                    <EditableField
                                        label="Password"
                                        name="password"
                                        value={currentFormData.password || ""}
                                        onChange={(e) =>
                                            setCurrentFormData((prev) => ({
                                                ...prev,
                                                password: e.target.value,
                                            }))
                                        }
                                        isEditing={isEditingAll && changePassword}
                                        disabled={!changePassword}
                                    />
                                </div>
                                {isEditingAll && changePassword && (
                                    <div className="w-1/2">
                                        <EditableField
                                            label="Confirm Password"
                                            name="confirmPassword"
                                            value={currentFormData.confirmPassword || ""}
                                            onChange={(e) =>
                                                setCurrentFormData((prev) => ({
                                                    ...prev,
                                                    confirmPassword: e.target.value,
                                                }))
                                            }
                                            isEditing={true}
                                        />
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    {selectedCard === 'Account Info' && (
                        <textarea
                            name="message"
                            value={currentFormData.message || ""}
                            onChange={onChange}
                            placeholder="Message"
                            className="w-full border border-gray-300 p-2 rounded h-24"
                        />
                    )}

                    {selectedCard === 'Notifications' && <p>You can manage notification settings here.</p>}
                    {selectedCard === 'Privacy' && <p>Privacy controls go here.</p>}

                    {selectedCard === 'Profile Settings' && (
                        <button
                            type="button"
                            onClick={() => {
                                if (isEditingAll) {
                                    handleSaveAll();
                                }
                            }}
                            className={`w-full text-white p-2 rounded transition ${
                                isEditingAll
                                    ? 'bg-blue-500 hover:bg-blue-600'
                                    : 'bg-gray-400 cursor-not-allowed'
                            }`}
                            disabled={!isEditingAll}
                        >
                            {isEditingAll ? 'Confirm' : 'Confirm'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

type CardProps = {
    label: string;
    onClick?: () => void;
    selected?: boolean;
};

const SidebarCard: React.FC<CardProps> = ({ label, onClick, selected }) => {
    return (
        <div
            onClick={onClick}
            className={`cursor-pointer border p-4 rounded transition ${
                selected ? 'bg-blue-200 border-blue-500' : 'bg-white border-gray-400 hover:bg-blue-100'
            }`}
        >
            <span className="text-gray-700">{label}</span>
        </div>
    );
};
