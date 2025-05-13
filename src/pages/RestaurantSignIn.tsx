import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from '../layouts/SignInLayout';
import AuthInput from '../components/AuthInput';
import { signInRestaurantUser } from '../utils/Api';

interface RestaurantSignInFormState {
    email: string;
    password: string;
}

const RestaurantSignIn: React.FC = () => {
    const [formData, setFormData] = useState<RestaurantSignInFormState>({
        email: '',
        password: '',
    });
    // si hay token que me redirija a restaurantHome
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

    const [error, setError] = useState<string | null>(null);

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.email || !formData.password) {
            alert('Please fill in both fields.');
            return;
        }

        try {
            const response = await signInRestaurantUser(formData);
            console.log('Login API full response:', response);

            const { token, restaurantName, email, idRestaurante, userType } = response;

            // Store the token and user info
            localStorage.setItem('authToken', token);
            // Store token and restaurant info in localStorage
            const userInfo = { id: idRestaurante, restaurantName, email, token, userType }; // Include token
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            console.log('Restaurant info stored:', userInfo);
            navigate('/restaurantHome'); // No need to reload the page
        } catch (error: any) {
            setError(error?.message || 'An unexpected error occurred'); // Improved error handling
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
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full"
                >
                    SIGN IN
                </button>
            </form>
        </SignInLayout>
    );
};

export default RestaurantSignIn;