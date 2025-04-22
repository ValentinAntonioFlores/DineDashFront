import React, { useState } from 'react';
import AuthInput from '../components/AuthInput.tsx';
import UserSignUpLayout from '../layouts/UserSignUpLayout';
import {signUp} from "../utils/Api.ts";

interface SignUpFormState {
    firstname: string;
    lastname: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const SignUpForm: React.FC = () => {
    const [formData, setFormData] = useState<SignUpFormState>({
        firstname: '',
        lastname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // Ensure that passwords match
        if (formData.password !== formData.confirmPassword) {
            console.error('Passwords do not match!');
            return;
        }

        const payload = {
            firstName: formData.firstname,
            lastName: formData.lastname,
            email: formData.email,
            password: formData.password
        };

        try {
            const result = await signUp(payload); // Call the API function from api.ts
            console.log('Signup successful!', result);
            // Optionally, redirect or show a success message
        } catch (error) {
            console.error('Error during signup:', error);
        }
    };

    return (
        <UserSignUpLayout>
            <form onSubmit={handleSubmit} className="w-full p-8 space-y-4">
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
        </UserSignUpLayout>
    );
};

export default SignUpForm;
