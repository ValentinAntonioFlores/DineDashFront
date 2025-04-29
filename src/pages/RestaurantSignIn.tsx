import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from '../layouts/SignInLayout';
import AuthInput from '../components/AuthInput';
import { signIn } from '../utils/Api';

interface RestaurantSignInFormState {
    email: string;
    password: string;
}

const RestaurantSignIn: React.FC = () => {
    const [formData, setFormData] = useState<RestaurantSignInFormState>({
        email: '',
        password: '',
    });

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
            // Pass userType or use a specific endpoint for restaurant users
            const response = await signIn({ ...formData});
            console.log('Login API full response:', response);

            const { token, firstName, lastName, email, idUsuario } = response;

            // Store the token
            const userInfo = { id: idUsuario, firstName, lastName, email };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            console.log('User info stored:', userInfo);
            console.log('Token stored, now navigating to restaurant dashboard...');
            navigate('/restaurant-dashboard');
            window.location.reload();
        } catch (error: any) {
            setError(error.message);
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