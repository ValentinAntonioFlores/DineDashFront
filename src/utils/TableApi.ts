import axios, { AxiosInstance } from 'axios';

const BASE_URL = "http://localhost:8000";

// Import shared utilities from the main API file
// If you can't import them, you can duplicate them here temporarily
const getAuthToken = (): string | null => {
    const tokenKeys = ["authToken", "token", "accessToken", "jwt"];

    for (const key of tokenKeys) {
        const token = localStorage.getItem(key);
        if (token && token.trim()) {
            console.log(`Table API - Found token with key: ${key}`);
            return token.trim();
        }
    }

    console.warn('Table API - No valid authentication token found in localStorage');
    return null;
};

const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Math.floor(Date.now() / 1000);
        return payload.exp < currentTime;
    } catch (error) {
        console.error('Table API - Error checking token expiration:', error);
        return true;
    }
};

const clearAuthData = () => {
    const tokenKeys = ["authToken", "token", "accessToken", "jwt"];
    tokenKeys.forEach(key => localStorage.removeItem(key));
    localStorage.removeItem("userInfo");
    console.log('Table API - Cleared authentication data');
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
            console.error('Table API Error:', error.response?.data || error.message);

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

// Type definitions
export interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

export interface TableDTO {
    positionX: number;
    positionY: number;
    capacity: number;
    isAvailable: boolean;
    isTable?: boolean;
}

export interface CreateTableRequest {
    positionX: number;
    positionY: number;
    capacity: number;
    isAvailable: boolean;
}

export interface GridCell {
    isTable: boolean;
    capacity: number;
    isAvailable: boolean;
}

export interface SaveGridRequest {
    restaurantId: string;
    gridLayout: TableDTO[];
}

// Create a single table
export const createTable = async (
    restaurantId: string,
    table: CreateTableRequest
) => {
    try {
        const response = await apiClient.post('/tables', {
            restaurantId,
            tableDTO: table,
        });
        return response.data;
    } catch (error) {
        console.error('Error creating table:', error);
        if (error.name === 'AuthenticationError') {
            // Handle authentication error specifically
            throw new Error('Please login again to continue.');
        }
        throw error;
    }
};

// Fetch full grid layout for a restaurant
export const fetchGridLayout = async (restaurantId: string): Promise<Table[][]> => {
    try {
        // Log the request details for debugging
        console.log('Fetching grid layout for restaurant:', restaurantId);

        const response = await apiClient.get('/tables/grid', {
            params: { restaurantId }
        });

        const rawGrid: GridCell[][] = response.data;
        console.log('Successfully fetched grid layout:', rawGrid);

        // Transform backend data to frontend Table interface
        return rawGrid.map((row: GridCell[]) =>
            row.map((cell: GridCell) => ({
                isTable: cell.isTable || false,
                seats: cell.capacity || 0,
                reserved: !cell.isAvailable,
            }))
        );
    } catch (error) {
        console.error('Error fetching grid layout:', error);

        if (error.name === 'AuthenticationError') {
            throw new Error('Authentication failed. Please login again to view table layout.');
        }

        if (error.response?.status === 404) {
            throw new Error(`Restaurant with ID ${restaurantId} not found.`);
        }

        throw error;
    }
};

// Save grid layout (2D Table[][]) to backend
export const saveGridLayout = async (restaurantId: string, gridLayout: Table[][]) => {
    try {
        console.log('Saving grid layout for restaurant:', restaurantId);

        // Transform frontend Table interface to backend format
        const mappedGrid = gridLayout.map((row, rowIndex) =>
            row.map((cell, colIndex) => ({
                positionX: rowIndex,
                positionY: colIndex,
                capacity: cell.seats,
                isAvailable: !cell.reserved,
                isTable: cell.isTable,
            }))
        );

        const response = await apiClient.post('/tables/save', {
            restaurantId,
            gridLayout: mappedGrid,
        });

        console.log('Successfully saved grid layout');
        return response.data;
    } catch (error) {
        console.error('Error saving grid layout:', error);

        if (error.name === 'AuthenticationError') {
            throw new Error('Authentication failed. Please login again to save changes.');
        }

        throw error;
    }
};

// Additional table management functions

// Update a specific table
export const updateTable = async (
    tableId: string,
    updates: Partial<CreateTableRequest>
) => {
    try {
        const response = await apiClient.put(`/tables/${tableId}`, updates);
        return response.data;
    } catch (error) {
        console.error('Error updating table:', error);
        throw error;
    }
};

// Delete a specific table
export const deleteTable = async (tableId: string) => {
    try {
        const response = await apiClient.delete(`/tables/${tableId}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting table:', error);
        throw error;
    }
};

// Get all tables for a restaurant (flat list)
export const fetchRestaurantTables = async (restaurantId: string) => {
    try {
        const response = await apiClient.get('/tables', {
            params: { restaurantId }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching restaurant tables:', error);
        throw error;
    }
};

// Get table availability for a specific time range
export const checkTableAvailability = async (
    restaurantId: string,
    startTime: string,
    endTime: string
) => {
    try {
        const response = await apiClient.post('/tables/availability', {
            restaurantId,
            startTime,
            endTime,
        });
        return response.data;
    } catch (error) {
        console.error('Error checking table availability:', error);
        throw error;
    }
};

// Update table availability status
export const updateTableAvailability = async (
    tableId: string,
    isAvailable: boolean
) => {
    try {
        const response = await apiClient.patch(`/tables/${tableId}/availability`, {
            isAvailable,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating table availability:', error);
        throw error;
    }
};

// Bulk update table positions (useful for drag & drop functionality)
export const updateTablePositions = async (
    restaurantId: string,
    tablePositions: Array<{
        tableId: string;
        positionX: number;
        positionY: number;
    }>
) => {
    try {
        const response = await apiClient.put('/tables/positions', {
            restaurantId,
            positions: tablePositions,
        });
        return response.data;
    } catch (error) {
        console.error('Error updating table positions:', error);
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

// Export the API client for advanced use cases
export { apiClient, getAuthToken, isTokenExpired, clearAuthData };