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

    const { token, firstName, lastName, email, idUsuario, userType } = response.data;

    return { token, firstName, lastName, email, idUsuario, userType };
}



export const signInRestaurantUser = async (data: { email: string; password: string }) => {
    try {
        // Make the login request using axios
        const response = await axios.post('http://localhost:8000/restaurantUsers/login', data, {
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const { token, restaurantName, email, idRestaurante, imageBase64 } = response.data;

        // Check if the response contains necessary data
        if (!token || !restaurantName || !email || !idRestaurante) {
            throw new Error('Invalid response structure from backend');
        }

        // Store the token in localStorage
        const userInfo = { id: idRestaurante, restaurantName, email, token };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Store token in axios default headers for subsequent requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        return { token, restaurantName, email, idRestaurante, imageBase64 }; // Return the user data
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error during restaurant user sign-in:', error.message);
        } else {
            console.error('Unknown error during restaurant user sign-in:', error);
        }
        throw error;
    }
};


export const apiUpdateUser = async (
    id: string,
    data: { firstname: string; lastname: string; email: string; password?: string }
) => {
    try {
        const token = localStorage.getItem('authToken'); // Get the token from localStorage

        const response = await axios.put(`http://localhost:8000/clientUsers/${id}`, data, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : '', // Add token to headers
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



// utils/Api.ts
export const signUpRestaurant = async (payload: { restaurantName: string, email: string, password: string }) => {
    try {
        const response = await fetch('http://localhost:8000/restaurantUsers/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const result = await response.json();
            throw new Error(result.message);  // Throw error with the message from the backend
        }

        const result = await response.json();
        return result; // Assuming your backend returns the created restaurant data or a success message
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;  // Ensure the error is thrown
    }
};





