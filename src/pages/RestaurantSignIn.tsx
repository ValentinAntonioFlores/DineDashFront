import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from '../layouts/SignInLayout';
import AuthInput from '../components/AuthInput';
import { signInRestaurantUser } from '../utils/Api';
import { Toaster, toast } from 'sonner';

interface RestaurantSignInFormState {
    email: string;
    password: string;
}

const RestaurantSignIn: React.FC = () => {
    const [formData, setFormData] = useState<RestaurantSignInFormState>({
        email: '',
        password: '',
    });

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
            toast.error('Please fill in both fields.');
            return;
        }

        try {
            const response = await signInRestaurantUser(formData);
            const { token, restaurantName, email, idRestaurante, userType } = response;
            localStorage.setItem('authToken', token);
            const userInfo = { id: idRestaurante, restaurantName, email, token, userType };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));
            navigate('/restaurantHome');
        } catch (error: any) {
            setError(error?.message || 'An unexpected error occurred');
        }
    };

    // Botón Google
    const handleGoogleSignIn = () => {
        const params = new URLSearchParams({
            user_type: "restaurant",
            redirect_uri: window.location.origin + "/oauth2/redirect"
        });
        window.location.href = `http://localhost:8000/oauth2/authorization/google?${params.toString()}`;
    };

    return (
        <SignInLayout>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md mx-auto mt-8">
                <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    style={{
                        background: "#fff",
                        color: "#444",
                        border: "1px solid #ddd",
                        borderRadius: 4,
                        padding: "8px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer",
                        marginBottom: 12
                    }}
                >
                    <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" style={{ width: 20, height: 20 }} />
                    Ingresar con Google
                </button>
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