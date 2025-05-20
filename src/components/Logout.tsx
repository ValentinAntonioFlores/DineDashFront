import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LogoutProps {
    onLogout: () => void;
}

const Logout: React.FC<LogoutProps> = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogoutClick = () => {
        onLogout();
        localStorage.removeItem('authToken'); // Elimina el token de autenticación
        navigate('/signup');
    };

    return (
        <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-sm text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Log Out</h2>
            <p className="text-gray-600 mb-6">
                Are you sure you want to log out of your account?
            </p>
            <button
                onClick={handleLogoutClick}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300"
            >
                Confirm Log Out
            </button>
        </div>
    );
};

export default Logout;