import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from "../components/AuthInput.tsx";
import RestaurantSignUpLayout from "../layouts/RestaurantSignUpLayout.tsx";
import {registerRestaurant, signUpRestaurant} from "../utils/Api.ts";

interface SignUpRestaurantFormState {
    restaurantName: string;
    email: string;
    password: string;
    confirmPassword: string;
    direccion: string;
}

const SignUpRestaurantForm: React.FC = () => {
    const [formData, setFormData] = useState<SignUpRestaurantFormState>({
        restaurantName: '',
        email: '',
        password: '',
        confirmPassword: '',
        direccion: ''
    });

    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        const payload = {
            restaurantName: formData.restaurantName,
            email: formData.email,
            password: formData.password
        };

        console.log("Submitting registration payload:", payload);

        try {
            await registerRestaurant(payload);
            navigate('/restaurantHome');
        } catch (err) {
            console.error("Registration failed:", err);
            alert("Failed to register. Please try again.");
        }
    };



    return (
        <RestaurantSignUpLayout>
            <form onSubmit={handleSubmit} className="space-y-4">
                    <AuthInput
                        label="Restaurant Name"
                        name="restaurantName"
                        value={formData.restaurantName}
                        onChange={handleChange}
                    />
                <AuthInput
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <AuthInput
                    label="Direccion"
                    name="direccion"
                    type="text"
                    value={formData.direccion}
                    onChange={handleChange}
                />
                <AuthInput
                    label="Password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <AuthInput
                    label="Confirm Password"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <button
                    type="submit"
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full w-full"
                >
                    SIGN UP
                </button>
            </form>
        </RestaurantSignUpLayout>
    );
};

export default SignUpRestaurantForm;
