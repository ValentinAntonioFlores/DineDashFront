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

export const fetchPublicRestaurants = async () => {
    try {
        const response = await axios.get(
            "http://localhost:8000/restaurantUsers/public/restaurants",
            {
                headers: { Authorization: "" },  // clear the default
            }
        );
        return response.data;
    } catch (e) {
        // if the backend still returns text, grab it:
        if (axios.isAxiosError(e) && e.response) {
            // e.response.data may be text
            const text = typeof e.response.data === "string"
                ? e.response.data
                : JSON.stringify(e.response.data);
            throw new Error(`HTTP ${e.response.status}: ${text}`);
        }
        throw e;
    }
};


export const makeReservation = async (reservation: {
    userId: string;
    restaurantId: string;

    tableId: string;
    startTime: string;
    endTime: string;
    status: string;
}) => {
    try {
        const response = await fetch('http://localhost:8000/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(reservation),
        });

        if (!response.ok) throw new Error("Failed to make reservation");

        return await response.json();
    } catch (error) {
        console.error("Reservation error:", error);
        throw error;
    }
};


export const fetchUserReservations = async (userId: string) => {
    try {
        const token = localStorage.getItem('authToken');

        const response = await axios.post(
            'http://localhost:8000/reservations/by-client-user',
            { userId },
            {
                headers: {
                    Authorization: token ? `Bearer ${token}` : '',
                },
            }
        );

        if (Array.isArray(response.data)) {
            return response.data; // List of Reservation objects
        } else {
            console.warn('Unexpected reservations data:', response.data);
            return [];
        }
    } catch (error) {
        console.error('Error fetching reservations:', error);
        throw error;
    }
};

export const fetchAcceptedReservationsByRestaurant = async (
    restaurantId: string,
    selectedStartTime: string,
    selectedEndTime: string
): Promise<string[]> => {  // returns array of UUID strings
    try {
        const token = localStorage.getItem('authToken');

        const payload = {
            restaurantId,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
        };

        const response = await fetch('http://localhost:8000/reservations/reserved-tables', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: token ? `Bearer ${token}` : '',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            throw new Error(errorResponse.message || 'Failed to fetch reserved tables');
        }

        const reservedTableIds: string[] = await response.json();

        if (!Array.isArray(reservedTableIds)) {
            throw new Error('Unexpected response format: expected array of UUID strings');
        }

        // The backend returns reserved table IDs only, no need to filter by status here
        return reservedTableIds;
    } catch (error) {
        console.error('Error fetching reserved tables:', error);
        throw error;
    }
};

export const makeReviewOnRestaurant = async (review: {
    userId: string;
    restaurantId: string;
    rating: number;
}) => {
    try {
        const response = await fetch('http://localhost:8000/reviews/client-to-restaurant', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                clientId: review.userId,
                restaurantId: review.restaurantId,
                starRating: review.rating,
            }),
        });

        if (!response.ok) throw new Error("Failed to make review");

        return await response.json();
    } catch (error) {
        console.error("Review error:", error);
        throw error;
    }
};


export const fetchReviewByClientAndRestaurant = async (clientId: string, restaurantId: string) => {
    try {
        const response = await fetch(`http://localhost:8000/reviews/client-to-restaurant?clientId=${clientId}&restaurantId=${restaurantId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.status === 404) {
            return null; // no review found
        }
        if (!response.ok) {
            throw new Error('Failed to fetch review');
        }

        const review = await response.json();
        return review;
    } catch (error) {
        console.error("Error fetching review:", error);
        throw error;
    }
};

export const markAsFavorite = async (userId: string, restaurantId: string) => {
    return fetch(`http://localhost:8000/favorites/mark?clientId=${userId}&restaurantId=${restaurantId}`, {
        method: 'POST',
    });
};

export const unmarkAsFavorite = async (userId: string, restaurantId: string) => {
    return fetch(`http://localhost:8000/favorites/remove?clientId=${userId}&restaurantId=${restaurantId}`, {
        method: 'DELETE',
    });
};

type Favorite = {
    restaurantUser: {
        idRestaurante: string;
    };
};

export async function fetchUserFavorites(userId: string): Promise<Favorite[]> {
    const res = await fetch(`http://localhost:8000/favorites/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch favorites");

    return await res.json();
}

export async function fetchUserFavoritesForHome(userId: string): Promise<string[]> {
    type FavoriteDTO = {
        restaurantId: string;
    };
    const res = await fetch(`http://localhost:8000/favorites/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch favorites");

    const favorites: FavoriteDTO[] = await res.json();
    console.log("Favorites received from backend:", favorites);
    return favorites.map(f => f.restaurantId);
}


export async function getUserById(userId: string): Promise<{ id: string; firstName: string; lastName: string; email: string } | null> {
    try {
        const token = localStorage.getItem("token"); // Or wherever you store your auth token

        const res = await fetch(`http://localhost:8000/restaurants/client-info/${userId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            }
        });

        if (res.status === 404) {
            // User not found
            return null;
        }

        if (!res.ok) {
            throw new Error("Failed to fetch user");
        }

        return await res.json();
    } catch (error) {
        console.error("Error fetching user by ID:", error);
        throw error;
    }
}


export interface ReviewDTO {
    id: string;
    clientId: string;
    restaurantId: string;
    isPositive: boolean;
    createdAt: string;
}

export const createRestaurantToClientReview = (
    clientId: string,
    restaurantId: string,
    isPositive: boolean
): Promise<ReviewDTO> => {
    const params = new URLSearchParams({
        clientId,
        restaurantId,
        isPositive: isPositive.toString(),
    });

    return fetch(`http://localhost:8000/reviews/restaurant-to-client?${params.toString()}`, {
        method: "POST",
    })
        .then((res) => {
            if (!res.ok) throw new Error("Failed to create review");
            return res.json();
        });
};



