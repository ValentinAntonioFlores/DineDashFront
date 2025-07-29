import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from "../layouts/SignInLayout";
import AuthInput from "../components/AuthInput";
import { signIn } from "../utils/Api";

interface SignInFormState {
    email: string;
    password: string;
}

const SignInForm: React.FC = () => {
    const [formData, setFormData] = useState<SignInFormState>({
        email: '',
        password: '',
    });
    const [userTypeForOAuth, setUserTypeForOAuth] = useState<'client' | 'restaurant'>('client');

    // Check if user is already authenticated
    if (localStorage.getItem("authToken")) {
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

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            alert("Please fill in both fields.");
            return;
        }

        try {
            const response = await signIn(formData);
            const { token, firstName, lastName, email, idUsuario, userType } = response;
            localStorage.setItem('authToken', token);
            const userInfo = { id: idUsuario, firstName, lastName, email, userType };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            if (userType === 'restaurant') {
                navigate('/restaurantHome');
            } else {
                navigate('/home');
            }
            window.location.reload();
        } catch (error: any) {
            setError(error.message);
        }
    };

    const handleGoogleSignIn = (userType: 'client' | 'restaurant') => {
        // Store user type in session storage so it survives the OAuth redirect
        sessionStorage.setItem('pendingOAuthUserType', userType);

        // Encode userType in state parameter for additional safety
        const state = btoa(`userType=${userType}`);

        // Build the OAuth URL with state parameter
        const oauthUrl = `http://localhost:8000/oauth2/authorization/google?state=${state}`;

        console.log(`Starting OAuth flow for ${userType} user`);
        window.location.href = oauthUrl;
    };

    return (
        <SignInLayout>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8">

                {/* Enhanced Google Sign-In Button */}
                <button
                    type="button"
                    onClick={() => handleGoogleSignIn(userTypeForOAuth)}
                    className="group relative w-full bg-white hover:bg-gray-50 border border-gray-300 hover:border-gray-400 rounded-lg px-6 py-3 font-medium text-gray-700 hover:text-gray-900 transition-all duration-200 ease-in-out shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                    <div className="flex items-center justify-center gap-3">
                        {/* Google Logo SVG for better quality */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            className="flex-shrink-0"
                        >
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium">
                            Ingresar con Google
                        </span>
                    </div>

                    {/* Subtle hover effect overlay */}
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 opacity-0 group-hover:opacity-20 transition-opacity duration-200"></div>
                </button>

                {/* Enhanced divider */}
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500 font-medium">o continúa con</span>
                    </div>
                </div>

                {/* Regular Sign-In Form */}
                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                    SIGN IN
                </button>
            </form>
        </SignInLayout>
    );
};

export default SignInForm;