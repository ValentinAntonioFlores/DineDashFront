import React, { useState, useEffect } from 'react';
import { Pencil } from 'lucide-react';
import { EditableField } from "../components/EditableField.tsx";


type Props = {
    formData: {
        name: string;
        email: string;
        message: string;
        password: string;
        confirmPassword: string;
    },
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    onSave: (updatedData: formData) => void; // <== accept the draftData
};

export const UserConfigurationLayout: React.FC<Props> = ({ formData, onChange, onSave }) => {
    const [selectedCard, setSelectedCard] = useState<string>('Profile Settings');
    const [isEditingAll, setIsEditingAll] = useState(false);
    const [changePassword, setChangePassword] = useState(false); // ✅ FIXED: inside the component
    const [draftData, setDraftData] = useState(formData);

    useEffect(() => {
        setDraftData(formData);
    }, [formData]);

    const handleSaveAll = async () => {
        if (!draftData) return;

        if (changePassword) {
            const password = draftData.password.trim();
            const confirmPassword = draftData.confirmPassword.trim();

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
            onSave(formData);
            setIsEditingAll(false);
            setChangePassword(false); // Reset checkbox after saving
        } catch (error) {
            console.error("Error updating user:", error);
            alert("There was an error updating your information. Please try again later.");
        }
    };

    return (
        <div className="bg-white min-h-screen flex">
            {/* Sidebar */}
            <div className="w-[250px] bg-gray-100 p-2 space-y-2">
                {['Profile Settings', 'Account Info', 'Notifications', 'Privacy'].map((label) => (
                    <SidebarCard
                        key={label}
                        label={label}
                        onClick={() => setSelectedCard(label)}
                        selected={selectedCard === label}
                    />
                ))}
            </div>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="bg-gray-100 p-8 rounded shadow-md w-full max-w-[1000px] space-y-6">
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
                            <EditableField
                                label="Name"
                                name="name"
                                value={draftData.name}
                                onChange={(e) =>
                                    setDraftData((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                isEditing={isEditingAll}
                            />
                            <EditableField
                                label="Email"
                                name="email"
                                value={draftData.email}
                                onChange={(e) =>
                                    setDraftData((prev) => ({
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
                                        value={draftData.password}
                                        onChange={(e) =>
                                            setDraftData((prev) => ({
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
                                            value={draftData.confirmPassword}
                                            onChange={(e) =>
                                                setDraftData((prev) => ({
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
                            value={draftData.message}
                            onChange={onChange}
                            placeholder="Message"
                            className="w-full border border-gray-300 p-2 rounded h-24"
                        />
                    )}

                    {selectedCard === 'Notifications' && <p>You can manage notification settings here.</p>}
                    {selectedCard === 'Privacy' && <p>Privacy controls go here.</p>}

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
                                : 'bg-red-500 hover:bg-red-600'
                        }`}
                    >
                        {isEditingAll ? 'Confirm' : 'Delete Account'}
                    </button>
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
