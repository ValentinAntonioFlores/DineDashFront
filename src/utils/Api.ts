import axios from 'axios';

export const signUp = async (payload: { firstName: string, lastName: string, email: string, password: string }) => {
    try {
        const response = await fetch('http://localhost:8000/clientUsers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error('Failed to sign up');
        }

        const result = await response.json();
        return result; // Assuming your backend returns the created user data or a success message
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};


// In Api.ts
// utils/Api.ts

export async function signIn(data: { email: string; password: string }) {
    const response = await axios.post('http://localhost:8000/clientUsers/login', data);
    return response.data; // This will now include token + name + email
};


export const apiUpdateUser = async (
    id: string,
    data: { firstName: string; lastName: string; email: string; password?: string }
) => {
    try {
        const response = await axios.put(`http://localhost:8000/clientUsers/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error('Failed to update user');
        }
    } catch (error) {
        console.error('Error updating user:', error);

        if (axios.isAxiosError(error) && error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
            throw new Error(error.response?.data?.message || 'Error occurred while updating user');
        }

        throw error;
    }
};


export const registerRestaurant = async (payload: {
    restaurantName: string;
    email: string;
    password: string;
}) => {
    try {
        const response = await fetch("http://localhost:8000/restaurantUsers/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            throw new Error("Failed to register restaurant");
        }

        return await response.text(); // or .json() if your backend returns a JSON response
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
};




