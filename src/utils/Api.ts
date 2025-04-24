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

