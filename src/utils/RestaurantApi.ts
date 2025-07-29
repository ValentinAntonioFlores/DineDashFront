import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const BASE_URL = "http://localhost:8000"; // Spring Boot backend

// Token management utilities
const getAuthToken = (): string | null => {
    // Try multiple token storage keys in order of preference
    const tokenKeys = ["authToken", "token", "accessToken", "jwt"];

    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (token && token.trim()) {
            console.log(`Found token with key: ${key}`);
            return token.trim();
        }
    }

    console.warn('No valid authentication token found in localStorage');
    return null;
};

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Error checking token expiration:', error);
        return true; // Assume expired if we can't parse
    }
};

const clearAuthData = () => {
    const tokenKeys = ["authToken", "token", "accessToken", "jwt"];
    tokenKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem("userInfo");
    console.log('Cleared authentication data');
};

// Create centralized axios instance with interceptors
const createApiClient = (): AxiosInstance => {
    const client = axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // Request interceptor to add auth token
    client.interceptors.request.use(
        (config) => {
            const token = getAuthToken();

            if (!token) {
                console.warn('No authentication token available for request');
                return config;
            }

            // Check if token is expired
            if (isTokenExpired(token)) {
                console.error('Authentication token has expired');
                clearAuthData();
                // You might want to redirect to login here
                throw new Error('Authentication token has expired. Please login again.');
            }

            config.headers.Authorization = `Bearer ${token}`;
            return config;
        },
        (error) => {
            console.error('Request interceptor error:', error);
            return Promise.reject(error);
        }
    );

    // Response interceptor for error handling
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('Restaurant API Error:', error.response?.data || error.message);

            // Handle authentication errors
            if (error.response?.status === 401) {
                console.error('Authentication failed. Token may be invalid or expired.');
                clearAuthData();

                // Create a more descriptive error
                const authError = new Error('Authentication failed. Please login again.');
                authError.name = 'AuthenticationError';
                return Promise.reject(authError);
            }

            // Handle other HTTP errors
            if (error.response?.status === 403) {
                const forbiddenError = new Error('Access denied. Insufficient permissions.');
                forbiddenError.name = 'AuthorizationError';
                return Promise.reject(forbiddenError);
            }

            return Promise.reject(error);
        }
    );

    return client;
};

// Create the API client instance
const apiClient = createApiClient();

// Helper function for requests that don't need auth
const createPublicApiClient = (): AxiosInstance => {
    return axios.create({
        baseURL: BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });
};

const publicApiClient = createPublicApiClient();

// Upload restaurant image
export const uploadRestaurantImage = async (idRestaurante: string, imageBase64: string) => {
    try {
        const response = await apiClient.post(
            `/restaurantUsers/${idRestaurante}/image`,
            { imageBase64: imageBase64 }
        );
        console.log("Image uploaded:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to upload images.');
        }
        throw error;
    }
};

// Save restaurant (other data)
export const saveRestaurant = async (restaurantData: {
    id: string;
    image?: string | null;
}) => {
    if (restaurantData.image) {
        // Upload the image if provided
        await uploadRestaurantImage(restaurantData.id, restaurantData.image);
    }

    return { message: "Restaurant saved successfully." };
};

// Fetch restaurants
export const fetchRestaurants = async () => {
    try {
        const response = await apiClient.get("/restaurantUsers");
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurants:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view restaurants.');
        }
        throw error;
    }
};

// Fetch a specific restaurant by ID
export const getRestaurant = async (id: string) => {
    try {
        const response = await apiClient.get(`/restaurantUsers/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view restaurant details.');
        }
        if (error.response?.status === 404) {
            throw new Error(`Restaurant with ID ${id} not found.`);
        }
        throw error;
    }
};

// Fetch restaurant reservations
export const fetchRestaurantReservations = async (restaurantId: string) => {
    try {
        const response = await apiClient.post(
            "/reservations/by-restaurant",
            { restaurantId }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view reservations.');
        }
        throw error;
    }
};

// Fetch accepted reservations by restaurant
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

        const response = await apiClient.post('/reservations/reserved-tables', payload);

        if (!Array.isArray(response.data)) {
            throw new Error('Unexpected response format: expected array of UUID strings');
        }

        return response.data;
    } catch (error) {
        console.error('Error fetching reserved tables:', error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view reserved tables.');
        }
        throw error;
    }
};

export const CreateRestaurantCategory = async (categoryData: {
    name: string;
    restaurantId: string // UUID as string
}) => {
    try {
        const response = await apiClient.post('/categories', {
            name: categoryData.name.trim(),
            restaurantId: categoryData.restaurantId
        });
        console.log('Category created/found:', response.data);
        return response.data;
    } catch (error) {
        console.error("Error creating restaurant category:", error);

        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to create categories.');
        }

        // Log the specific error details
        if (error.response) {
            console.error('Error response:', error.response.data);
            console.error('Error status:', error.response.status);
        }

        throw error;
    }
};

// Fetch categories by restaurant
export const fetchCategoriesByRestaurant = async (restaurantId: string) => {
    try {
        const response = await apiClient.get(`/categories/restaurant/${restaurantId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching categories:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view categories.');
        }
        return []; // Return empty array as fallback
    }
};

// Fetch all categories
export const fetchAllCategories = async () => {
    try {
        const response = await apiClient.get('/categories');
        return response.data;
    } catch (error) {
        console.error("Error fetching all categories:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view categories.');
        }
        return [];
    }
};

// Delete category
export const deleteCategory = async (categoryId: string) => {
    try {
        const response = await apiClient.delete(`/categories/${categoryId}`);
        return response.data;
    } catch (error) {
        console.error("Error deleting category:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to delete categories.');
        }
        throw error;
    }
};

// Type definitions
export interface Product {
    id?: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    restaurantUser: {
        idRestaurante: string;
    };
}

export type Plate = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
};

export type PlateUpdate = {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    restaurantUser: {
        idRestaurante: string;
    };
};

// Add product by restaurant
export const AddProductByRestaurant = async (product: {
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    restaurantUser: {
        idRestaurante: string;
    };
}): Promise<Product> => {
    try {
        const response = await apiClient.post('/products', product);
        return response.data;
    } catch (error) {
        console.error('Error in AddProductByRestaurant:', error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to add products.');
        }
        throw error;
    }
};

// Fetch products by restaurant
export const fetchProductsByRestaurant = async (restaurantId: string): Promise<Plate[]> => {
    try {
        const response = await apiClient.get(`/products/restaurant/${restaurantId}`);
        console.log('Fetched products:', response.data);

        return response.data.map((product: any) => ({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            imageUrl: product.image,
        }));
    } catch (error) {
        console.error('Error fetching products:', error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view products.');
        }
        throw error;
    }
};

// Update product by ID
export const updateProductById = async (
    id: string,
    updatedData: PlateUpdate
): Promise<Plate> => {
    try {
        const response = await apiClient.put(`/products/${id}`, updatedData);

        const updatedProduct = response.data;
        return {
            id: updatedProduct.id,
            name: updatedProduct.name,
            description: updatedProduct.description,
            price: updatedProduct.price,
            category: updatedProduct.category,
            imageUrl: updatedProduct.image,
        };
    } catch (error) {
        console.error('Error updating product:', error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to update products.');
        }
        throw error;
    }
};

// Delete product by ID
export const deleteProductById = async (id: string): Promise<void> => {
    try {
        await apiClient.delete(`/products/${id}`);
    } catch (error) {
        console.error('Error deleting product:', error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to delete products.');
        }
        throw error;
    }
};

// Update restaurant location
export const updateRestaurantLocation = async (
    idRestaurante: string,
    locationData: { latitude: number; longitude: number }
) => {
    try {
        const response = await apiClient.put(
            `/restaurantUsers/${idRestaurante}/location`,
            locationData
        );

        console.log("Location updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating location:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to update location.');
        }
        throw error;
    }
};

export interface LocationDTO {
    latitude: number;
    longitude: number;
}

// Fetch restaurant location
export const fetchRestaurantLocation = async (restaurantId: string): Promise<LocationDTO> => {
    try {
        const response = await apiClient.get<LocationDTO>(
            `/restaurantUsers/${restaurantId}/getlocation`
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching location:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view location.');
        }
        throw error;
    }
};

export interface ReviewDTO {
    id: string;
    clientId: string;
    restaurantId: string;
    isPositive: boolean;
    reviewType: 'CLIENT_TO_RESTAURANT' | 'RESTAURANT_TO_CLIENT';
    createdAt: string;
}

// Fetch restaurant reviews for client
export const fetchRestaurantReviewsForClient = async (clientId: string): Promise<ReviewDTO[]> => {
    try {
        const response = await apiClient.get(`/reviews/client/${clientId}/restaurant-reviews`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant reviews for client:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view reviews.');
        }
        if (error.response?.status === 404) {
            throw new Error(`Client with ID ${clientId} not found or no reviews.`);
        }
        throw error;
    }
};

// Fetch pending reservations count
export const fetchPendingReservationsCount = async (restaurantId: string): Promise<number> => {
    try {
        const response = await apiClient.get(
            `/reservations/restaurant/${restaurantId}/pending-count`
        );
        return response.data;
    } catch (error) {
        console.error(`Error fetching pending reservations count for restaurant ${restaurantId}:`, error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view reservations count.');
        }
        throw error;
    }
};

// Fetch email notifications preference
export const fetchEmailNotificationsPreference = async (restaurantId: string): Promise<boolean> => {
    try {
        const response = await apiClient.get(`/restaurantUsers/${restaurantId}/notifications`);
        return response.data;
    } catch (error) {
        console.error("Error fetching email notification preference:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to view notification settings.');
        }
        throw error;
    }
};

// Update email notifications preference
export const updateEmailNotificationsPreference = async (
    restaurantId: string,
    enabled: boolean
): Promise<string> => {
    try {
        const response = await apiClient.put(
            `/restaurantUsers/${restaurantId}/notifications`,
            null,
            {
                params: {
                    enabled: enabled,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error updating email notification preference:", error);
        if (error.name === 'AuthenticationError') {
            throw new Error('Please login again to update notification settings.');
        }
        throw error;
    }
};

// Debug utility function to check token status
export const debugTokenStatus = () => {
    const token = getAuthToken();

    if (!token) {
        console.log('❌ No token found');
        return { hasToken: false, isValid: false, isExpired: true };
    }

    const isExpired = isTokenExpired(token);
    console.log('🔍 Token Debug Info:');
    console.log('- Token found:', !!token);
    console.log('- Token length:', token.length);
    console.log('- Token preview:', token.substring(0, 20) + '...');
    console.log('- Is expired:', isExpired);

    if (!isExpired) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            console.log('- Token expires at:', new Date(payload.exp * 1000).toISOString());
            console.log('- Current time:', new Date().toISOString());
        } catch (e) {
            console.log('- Could not parse token payload');
        }
    }

    return { hasToken: true, isValid: !isExpired, isExpired };
};

// Authentication functions (these should be added to handle login)
export const signInRestaurantUser = async (credentials: { email: string; password: string }) => {
    try {
        console.log('Attempting restaurant login...');
        const response = await publicApiClient.post('/auth/restaurant/signin', credentials);
        console.log('Login successful');
        return response.data;
    } catch (error) {
        console.error('Login error:', error);
        if (error.response?.status === 401) {
            throw new Error('Invalid email or password.');
        }
        if (error.response?.status >= 500) {
            throw new Error('Server error. Please try again later.');
        }
        throw error;
    }
};

// Export the API clients and utilities for advanced use cases
export { apiClient, publicApiClient, getAuthToken, isTokenExpired, clearAuthData };