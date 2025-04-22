import React from 'react';
import {useNavigate} from "react-router-dom";

interface SignUpLayoutProps {
    children: React.ReactNode;
}

const RestaurantSignUpLayout: React.FC<SignUpLayoutProps> = ({ children }) => {

    const navigate = useNavigate();

    const handleSignIn = () => {
        navigate("/signin"); // Navigate to user sign-in page
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
                {/* Left Side - Form */}
                <div className="w-1/2 p-10 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-6">Create Restaurant Account</h2>
                    {children}
                </div>

                {/* Right Side - Welcome */}
                <div className="w-1/2 bg-gradient-to-r from-pink-500 to-red-400 text-white p-10 flex flex-col items-center justify-center">
                    <h2 className="text-3xl font-bold mb-2">Hello, Friend!</h2>
                    <p className="mb-6 text-center max-w-xs">
                        Enter your restaurant details and start managing your place with us
                    </p>

                    <button
                        onClick={handleSignIn}
                        className="border-2 border-white text-white font-bold py-2 px-6 rounded-full hover:bg-white hover:text-red-500 transition"
                    >
                        SIGN IN
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RestaurantSignUpLayout;
