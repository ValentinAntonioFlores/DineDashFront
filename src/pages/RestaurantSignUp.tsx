import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUpRestaurant } from "../utils/Api.ts";
import AuthInput from '../components/AuthInput.tsx';
import RestaurantSignUpLayout from '../layouts/RestaurantSignUpLayout';
import { toast, Toaster } from 'sonner';  // <-- Import both toast and Toaster here

interface SignUpFormState {
    restaurantName: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const SignUpRestaurantForm: React.FC = () => {
    const [formData, setFormData] = useState<SignUpFormState>({
        restaurantName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const { restaurantName, email, password, confirmPassword } = formData;

        if (!restaurantName || !email || !password || !confirmPassword) {
            toast.error('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        const payload = {
            restaurantName,
            email,
            password
        };

        try {
            const result = await signUpRestaurant(payload);

            if (result.message === 'Restaurant registered successfully.') {
                toast.success('Signup successful!');
                navigate('/RestaurantSignIn');
            } else {
                toast.error(`Signup failed: ${result.message}`);
            }
        } catch (error: any) {
            if (error instanceof Error && error.message) {
                toast.error(error.message);
            } else {
                toast.error('Unknown error during signup.');
            }
        }
    };

    return (
        <RestaurantSignUpLayout>
            {/* Place Toaster once per app or per page */}
            <Toaster position="top-right" richColors />

            <form onSubmit={handleSubmit} className="w-full p-8 space-y-4">
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

                <div className="relative">
                    <AuthInput
                        label="Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className="absolute right-2 top-9 text-sm text-blue-600"
                    >
                        {showPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
                <div className="relative">
                    <AuthInput
                        label="Confirm Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                    />
                    <button
                        type="button"
                        onClick={() => setShowConfirmPassword(prev => !prev)}
                        className="absolute right-2 top-9 text-sm text-blue-600"
                    >
                        {showConfirmPassword ? 'Hide' : 'Show'}
                    </button>
                </div>
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
