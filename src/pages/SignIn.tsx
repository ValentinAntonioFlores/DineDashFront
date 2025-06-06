import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SignInLayout from "../layouts/SignInLayout.tsx";
import AuthInput from "../components/AuthInput.tsx";
import { signIn } from "../utils/Api.ts";

interface SignInFormState {
    email: string;
    password: string;
}

const SignInForm: React.FC = () => {
    const [formData, setFormData] = useState<SignInFormState>({
        email: '',
        password: '',
    });

    //si ya hay token, que me redirija a Home
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


    const [error, setError] = useState<string | null>(null);  // To display any login errors

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
            const response = await signIn(formData); // response now has token and user type
            console.log("Login API full response:", response);

            const { token, firstName, lastName, email, idUsuario, userType } = response;  // Assuming userType is included in the response

            // Store the token and user info
            localStorage.setItem('authToken', token);
            const userInfo = { id: idUsuario, firstName, lastName, email, userType };
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            console.log("User info stored:", userInfo);

            // Redirect based on user type
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
