import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ForgotPasswordPopup from "../components/ForgotPassWordPopUp.tsx";

interface SignInLayoutProps {
    children: React.ReactNode;
}

const SignInLayout: React.FC<SignInLayoutProps> = ({ children }) => {
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate(); // Add this hook

    useEffect(() => {
        if(
            localStorage.getItem("authToken") &&
            location.pathname !== "/oauth2/redirect"
        ) {
            const userInfo = localStorage.getItem("userInfo");
            if (userInfo) {
                const { userType } = JSON.parse(userInfo);
                if (userType === 'restaurant') {
                    window.location.href = '/restaurantHome';
                } else {
                    window.location.href = '/home';
                }
            }
        }
    }, [location.pathname]);

    const handleUserSignUp = () => {
        console.log("Navigate to sign up");
        navigate('/signup'); // Navigate to the signup page
    };

    const handleForgotPasswordClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsForgotPasswordOpen(true);
    };

    const handleCloseForgotPassword = () => {
        setIsForgotPasswordOpen(false);
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
                    {/* Left Side - Sign In */}
                    <div className="w-1/2 p-10 flex flex-col justify-center">
                        <h2 className="text-3xl font-bold mb-4">Sign in</h2>


                        {children}

                        <a
                            href="#"
                            onClick={handleForgotPasswordClick}
                            className="text-sm text-gray-600 mt-4 hover:underline"
                        >
                            Forgot your password?
                        </a>
                    </div>

                    {/* Right Side - Welcome */}
                    <div className="w-1/2 bg-gradient-to-r from-pink-500 to-red-400 text-white p-10 flex flex-col items-center justify-center">
                        <h2 className="text-3xl font-bold mb-2">Hello, Friend!</h2>
                        <p className="mb-6 text-center max-w-xs">
                            Enter your personal details and start your journey with us
                        </p>
                        <button
                            onClick={handleUserSignUp}
                            className="border-2 border-white text-white font-bold py-2 px-6 rounded-full hover:bg-white hover:text-red-500 transition"
                        >
                            SIGN UP
                        </button>
                    </div>
                </div>
            </div>

            {/* Forgot Password Popup */}
            <ForgotPasswordPopup
                isOpen={isForgotPasswordOpen}
                onClose={handleCloseForgotPassword}
            />
        </>
    );
};

export default SignInLayout;