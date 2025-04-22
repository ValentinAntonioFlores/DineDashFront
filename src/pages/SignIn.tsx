import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from "../layouts/SignInLayout.tsx";
import AuthInput from "../components/AuthInput.tsx";

interface SignInFormState {
    email: string;
    password: string;
}

const SignInForm: React.FC = () => {
    const [formData, setFormData] = useState<SignInFormState>({
        email: '',
        password: '',
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
            navigate('/'); // or wherever your home/dashboard is
        } else {
            alert("Please fill in both fields.");
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

export default SignInForm;
