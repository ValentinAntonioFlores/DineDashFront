import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from '../layouts/SignInLayout';
import AuthInput from '../components/AuthInput';
import { signInRestaurantUser } from '../utils/Api';
import { Toaster, toast } from 'sonner';

interface RestaurantSignInFormState {
    email: string;
    password: string;
}

interface UserInfo {
    id: string;
    restaurantName: string;
    email: string;
    userType: string;
}

const RestaurantSignIn: React.FC = () => {
    const [formData, setFormData] = useState<RestaurantSignInFormState>({
        email: '',
        password: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check for existing authentication on component mount
    useEffect(() => {
        const checkExistingAuth = () => {
            const token = localStorage.getItem("authToken");
            const userInfoStr = localStorage.getItem("userInfo");

            if (token && userInfoStr) {
                try {
                    const userInfo: UserInfo = JSON.parse(userInfoStr);
                    console.log('Found existing auth:', userInfo);

                    // Validate token format (basic JWT check)
                    if (token.split('.').length === 3) {
                        // Check if token is expired
                        try {
                            const payload = JSON.parse(atob(token.split('.')[1]));
                            const currentTime = Math.floor(Date.now() / 1000);

                            if (payload.exp && payload.exp > currentTime) {
                                // Token is valid, redirect based on user type
                                if (userInfo.userType === 'restaurant') {
                                    console.log('Valid restaurant token found, redirecting...');
                                    navigate('/restaurantHome', { replace: true });
                                    return;
                                } else {
                                    navigate('/home', { replace: true });
                                    return;
                                }
                            } else {
                                console.log('Token expired, clearing auth data');
                                clearAuthData();
                            }
                        } catch (tokenError) {
                            console.error('Error parsing token:', tokenError);
                            clearAuthData();
                        }
                    } else {
                        console.log('Invalid token format, clearing auth data');
                        clearAuthData();
                    }
                } catch (parseError) {
                    console.error('Error parsing user info:', parseError);
                    clearAuthData();
                }
            }
        };

        checkExistingAuth();
    }, [navigate]);

    const clearAuthData = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
        localStorage.removeItem("token"); // Clear any other token keys
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (error) setError(null);
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            toast.error('Email is required.');
            return false;
        }

        if (!formData.password.trim()) {
            toast.error('Password is required.');
            return false;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            toast.error('Please enter a valid email address.');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            console.log('Attempting login with:', { email: formData.email });

            const response = await signInRestaurantUser(formData);
            console.log('Login API full response:', response);

            // Validate response structure
            if (!response.token || !response.idRestaurante) {
                throw new Error('Invalid response from server. Missing token or restaurant ID.');
            }

            const { token, restaurantName, email, idRestaurante, userType } = response;

            // Validate token format
            if (!token || token.split('.').length !== 3) {
                throw new Error('Invalid token format received from server.');
            }

            // Clear any existing auth data first
            clearAuthData();

            // Store the token (only in authToken key for consistency)
            localStorage.setItem('authToken', token);

            // Store user info (WITHOUT the token to avoid duplication)
            const userInfo: UserInfo = {
                id: idRestaurante,
                restaurantName: restaurantName || 'Unknown Restaurant',
                email,
                userType: userType || 'restaurant'
            };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            console.log('Authentication successful:', {
                tokenLength: token.length,
                restaurantId: idRestaurante,
                userType
            });

            toast.success(`Welcome back, ${restaurantName || 'Restaurant Owner'}!`);

            // Navigate after a brief delay to show the success message
            setTimeout(() => {
                navigate('/restaurantHome', { replace: true });
            }, 1000);

        } catch (error: any) {
            console.error('Login error:', error);

            // Clear any potentially corrupted auth data
            clearAuthData();

            let errorMessage = 'An unexpected error occurred';

            if (error.response?.status === 401) {
                errorMessage = 'Invalid email or password. Please try again.';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Please contact support.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error. Please try again later.';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SignInLayout>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8">
                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                />
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                        {error}
                    </div>
                )}
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`font-bold py-2 px-6 rounded-full transition-colors ${
                        isLoading
                            ? 'bg-gray-400 cursor-not-allowed text-gray-700'
                            : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                >
                    {isLoading ? 'SIGNING IN...' : 'SIGN IN'}
                </button>
            </form>
            <Toaster />
        </SignInLayout>
    );
};

export default RestaurantSignIn;