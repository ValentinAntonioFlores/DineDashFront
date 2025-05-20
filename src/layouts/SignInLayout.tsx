import { useNavigate } from 'react-router-dom';
import React from 'react';

interface SignInLayoutProps {
    children: React.ReactNode;
}


const SignInLayout: React.FC<SignInLayoutProps> = ({ children }) => {

    const navigate = useNavigate();

    const handleUserSignUp = () => {
        navigate("/signUp"); // Navigate to user sign-in page
    };

    if(localStorage.getItem("authToken")) {
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


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg flex overflow-hidden">
                {/* Left Side - Sign In */}
                <div className="w-1/2 p-10 flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-4">Sign in</h2>
                    <div className="flex gap-3 mb-6">
                        <button className="border rounded-full w-10 h-10 flex items-center justify-center">G+</button>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">or use your account</p>

                    {children}

                    <a href="#" className="text-sm text-gray-600 mt-4 hover:underline">
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
    );
};

export default SignInLayout;
