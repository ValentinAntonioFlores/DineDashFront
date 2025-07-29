import axios from 'axios';

// Create and configure axios instance
const api = axios.create({
    baseURL: 'http://localhost:8000',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle authentication errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('authToken');
            localStorage.removeItem('userInfo');

            // Only redirect if not already on signin page
            if (!window.location.pathname.includes('/signin')) {
                window.location.href = '/signin?error=SessionExpired';
            }
        }
        return Promise.reject(error);
    }
);

// Utility function to get auth headers (for fetch calls)
const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

// AUTH FUNCTIONS
export const signUp = async (payload: { firstName: string, lastName: string, email: string, password: string }) => {
    try {
        const response = await api.post('/clientUsers/register', payload);
        return response.data;
    } catch (error) {
        console.error('Error signing up:', error);
        throw error;
    }
};

export async function signIn(data: { email: string; password: string }) {
    const response = await api.post('/clientUsers/login', data);
    const { token, firstName, lastName, email, idUsuario, userType } = response.data;
    return { token, firstName, lastName, email, idUsuario, userType };
}

export const signInRestaurantUser = async (data: { email: string; password: string }) => {
    try {
        const response = await api.post('/restaurantUsers/login', data);
        const { token, restaurantName, email, idRestaurante, imageBase64 } = response.data;

        if (!token || !restaurantName || !email || !idRestaurante) {
            throw new Error('Invalid response structure from backend');
        }

        // Store the token in authToken (consistent with your interceptors)
        localStorage.setItem('authToken', token);

        // Store user info WITHOUT the token to avoid duplication
        const userInfo = {
            id: idRestaurante,
            restaurantName,
            email,
            userType: 'restaurant' // Add userType for consistency
        };
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        return { token, restaurantName, email, idRestaurante, imageBase64, userType: 'restaurant' };
    } catch (error) {
        console.error('Error during restaurant user sign-in:', error);
        throw error;
    }
};

export const signUpRestaurant = async (payload: { restaurantName: string, email: string, password: string }) => {
    try {
        const response = await api.post('/restaurantUsers/register', payload);
        return response.data;
    } catch (error) {
        console.error('Error signing up restaurant:', error);
        throw error;
    }
};

// USER MANAGEMENT
export const apiUpdateUser = async (
    id: string,
    data: { firstname: string; lastname: string; email: string; password?: string }
) => {
    try {
        const response = await api.put(`/clientUsers/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating user:', error);
        if (axios.isAxiosError(error) && error.response) {
            throw new Error(error.response?.data?.message || 'Error occurred while updating user');
        }
        throw error;
    }
};

export async function getUserById(userId: string): Promise<{ id: string; firstName: string; lastName: string; email: string } | null> {
    try {
        const response = await api.get(`/restaurants/client-info/${userId}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null;
        }
        console.error("Error fetching user by ID:", error);
        throw error;
    }
}

// RESTAURANT FUNCTIONS
export const fetchPublicRestaurants = async () => {
    try {
        // This endpoint might be public, but we'll still use the configured instance
        const response = await api.get('/restaurantUsers/public/restaurants');
        return response.data;
    } catch (error) {
        console.error('Error fetching public restaurants:', error);
        throw error;
    }
};

// RESERVATION FUNCTIONS
export const makeReservation = async (reservation: {
    userId: string;
    restaurantId: string;
    tableId: string;
    startTime: string;
    endTime: string;
    status: string;
}) => {
    try {
        const response = await api.post('/reservations', reservation);
        return response.data;
    } catch (error) {
        console.error("Reservation error:", error);
        throw error;
    }
};

export const fetchUserReservations = async (userId: string) => {
    try {
        const response = await api.post('/reservations/by-client-user', { userId });

        if (Array.isArray(response.data)) {
            return response.data;
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
): Promise<string[]> => {
    try {
        const payload = {
            restaurantId,
            startTime: selectedStartTime,
            endTime: selectedEndTime,
        };

        const response = await api.post('/reservations/reserved-tables', payload);

        if (!Array.isArray(response.data)) {
            throw new Error('Unexpected response format: expected array of UUID strings');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching reserved tables:', error);
        throw error;
    }
};

export const markNotificationsSeenByIds = async (reservationIds: string[]): Promise<boolean> => {
    try {
        const response = await api.post('/reservations/mark-notifications-seen-by-ids', reservationIds);

        if (response.status === 200) {
            console.log(`Notifications with IDs [${reservationIds.join(', ')}] marked as SEEN.`);
            return true;
        } else {
            console.warn(`Unexpected response status ${response.status} when marking notifications seen by IDs.`);
            return false;
        }
    } catch (error) {
        console.error(`Error marking notifications seen by IDs:`, error);
        throw error;
    }
};

// REVIEW FUNCTIONS
export const makeReviewOnRestaurant = async (review: {
    userId: string;
    restaurantId: string;
    rating: number;
    comment?: string;
}) => {
    try {
        const response = await api.post('/reviews/client-to-restaurant', {
            clientId: review.userId,
            restaurantId: review.restaurantId,
            starRating: review.rating,
            comment: review.comment || "",
        });
        return response.data;
    } catch (error) {
        console.error("Review error:", error);
        throw error;
    }
};

export const fetchReviewByClientAndRestaurant = async (clientId: string, restaurantId: string) => {
    try {
        const response = await api.get(`/reviews/client-to-restaurant?clientId=${clientId}&restaurantId=${restaurantId}`);
        return response.data;
    } catch (error: any) {
        if (error.response?.status === 404) {
            return null; // no review found
        }
        console.error("Error fetching review:", error);
        throw error;
    }
};

export interface ReviewDTO {
    id: string;
    clientId: string;
    restaurantId: string;
    isPositive: boolean;
    createdAt: string;
}

export const createRestaurantToClientReview = async (
    clientId: string,
    restaurantId: string,
    isPositive: boolean
): Promise<ReviewDTO> => {
    const params = new URLSearchParams({
        clientId,
        restaurantId,
        isPositive: isPositive.toString(),
    });

    const response = await api.post(`/reviews/restaurant-to-client?${params.toString()}`);
    return response.data;
};

export interface Review {
    id: string;
    userFirstName: string;
    userLastName: string;
    comment: string;
    starRating: number;
}

export const fetchReviewsForRestaurant = async (restaurantId: string): Promise<Review[]> => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}/detailed-reviews`);
    return response.data;
};

export const getAverageRating = async (restaurantId: string): Promise<number> => {
    try {
        const response = await api.get(`/restaurant/${restaurantId}/average-rating`);
        return response.data;
    } catch (error) {
        console.error(error);
        return 0;
    }
};

// FAVORITES FUNCTIONS
export const markAsFavorite = async (userId: string, restaurantId: string) => {
    const response = await api.post(`/favorites/mark?clientId=${userId}&restaurantId=${restaurantId}`);
    return response;
};

export const unmarkAsFavorite = async (userId: string, restaurantId: string) => {
    const response = await api.delete(`/favorites/remove?clientId=${userId}&restaurantId=${restaurantId}`);
    return response;
};

type Favorite = {
    restaurantUser: {
        idRestaurante: string;
    };
};

export async function fetchUserFavorites(userId: string): Promise<Favorite[]> {
    const response = await api.get(`/favorites/${userId}`);
    return response.data;
}

export async function fetchUserFavoritesForHome(userId: string): Promise<string[]> {
    type FavoriteDTO = {
        restaurantId: string;
    };
    const response = await api.get(`/favorites/${userId}`);
    const favorites: FavoriteDTO[] = response.data;
    console.log("Favorites received from backend:", favorites);
    return favorites.map(f => f.restaurantId);
}

// LOCATION FUNCTIONS
export interface LocationDTO {
    latitude: number;
    longitude: number;
}

export const updateClientUserLocation = async (
    id: string,
    locationData: { latitude: number; longitude: number }
) => {
    try {
        const response = await api.put(`/clientUsers/${id}/location`, locationData);
        console.log("Client user location updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating client user location:", error);
        throw error;
    }
};

export const fetchClientUserLocation = async (id: string): Promise<LocationDTO> => {
    try {
        const response = await api.get<LocationDTO>(`/clientUsers/${id}/getLocation`);
        return response.data;
    } catch (error) {
        console.error("Error fetching client user location:", error);
        throw error;
    }
};

// NOTIFICATION FUNCTIONS
export const getEmailNotifications = async (userId: string): Promise<boolean> => {
    try {
        const response = await api.get(`/clientUsers/${userId}/email-notifications`);
        return response.data;
    } catch (error) {
        console.error('Error getting email notification setting:', error);
        throw error;
    }
};

export const updateEmailNotifications = async (userId: string, enabled: boolean): Promise<void> => {
    try {
        await api.put(`/clientUsers/${userId}/email-notifications?enabled=${enabled}`);
    } catch (error) {
        console.error('Error updating email notification setting:', error);
        throw error;
    }
};

// BACKUP EMAIL FUNCTIONS
export async function updateBackupEmail(userId: string, backupEmail: string, token: string) {
    try {
        const response = await api.put(`/clientUsers/${userId}/backup-email`,
            { backUpEmail: backupEmail }
        );
        return response.data;
    } catch (error) {
        console.error("Error updating backup email:", error);
        throw error;
    }
}

export const getBackupEmail = async (userId: string, token: string) => {
    try {
        console.log("=== getBackupEmail API CALL ===");
        console.log("UserID:", userId);
        console.log("Token preview:", token ? token.substring(0, 20) + '...' : 'none');

        const response = await api.get(`/clientUsers/${userId}/backup-email`);
        const data = response.data;

        console.log("✅ getBackupEmail response:", data);

        return {
            backupEmail: data.backUpEmail || data.backupEmail,
            isVerified: data.isVerified || false
        };
    } catch (error) {
        console.error('❌ Error in getBackupEmail API call:', error);
        throw error;
    }
};

// CATEGORY FUNCTIONS
export async function fetchCategories(): Promise<{ restaurantId: string; name: string }[]> {
    const response = await api.get('/categories');
    return response.data;
}

// Export the configured axios instance for direct use if needed
export default api;