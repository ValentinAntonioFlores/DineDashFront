import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthInput from "../components/AuthInput.tsx";
import RestaurantSignUpLayout from "../layouts/RestaurantSignUpLayout.tsx";

interface SignUpRestaurantFormState {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
    direccion: string;
}

const SignUpRestaurantForm: React.FC = () => {
    const [formData, setFormData] = useState<SignUpRestaurantFormState>({
        firstname: '',
        lastname: '',
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

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formData);

        // Simulate successful login (replace with real API call)
        if (formData.email && formData.password) {
            // Navigate after login
            navigate('/restaurantHome'); // or wherever your home/dashboard is
        } else {
            alert("Please fill in both fields.");
        }
    };

    return (
        <RestaurantSignUpLayout>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4">
                    <AuthInput
                        label="First Name"
                        name="firstname"
                        value={formData.firstname}
                        onChange={handleChange}
                    />
                    <AuthInput
                        label="Last Name"
                        name="lastname"
                        value={formData.lastname}
                        onChange={handleChange}
                    />
                </div>
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
