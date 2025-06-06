import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface LogoutProps {
    onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const confirmLogout = () => {
        onLogout();
        localStorage.removeItem('authToken');
        navigate('/signup');
    };

    return (
        <>
            <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-xl border border-gray-200">
                <div className="flex flex-col items-center text-center">
                    <div className="bg-red-100 text-red-600 p-3 rounded-full mb-4">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-2 italic">Log Out</h2>
                    <p className="text-gray-600 mb-6 italic">
                        Are you sure you want to log out of your account?
                    </p>
                    <button
                        onClick={openModal}
                        className="w-full py-3 px-6 rounded-full bg-red-700 text-cream italic font-semibold hover:bg-cream hover:text-red-700 transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-red-700/30"
                    >
                        Log Out
                    </button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white rounded-xl shadow-lg max-w-sm w-full p-6 text-center">
                        <h3 className="text-xl font-semibold mb-4 italic">Confirm Logout</h3>
                        <p className="mb-6 italic text-gray-700">
                            Are you sure you want to log out?
                        </p>
                        <div className="flex justify-center gap-4">
                            <button
                                onClick={closeModal}
                                className="py-2 px-5 rounded-full border border-gray-400 text-gray-700 hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="py-2 px-5 rounded-full bg-red-600 text-white hover:bg-red-700 transition"
                            >
                                Confirm Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Logout;
