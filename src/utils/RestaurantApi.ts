import axios from 'axios';

const BASE_URL = "http://localhost:8000"; // Spring Boot backend

// Upload restaurant image
export const uploadRestaurantImage = async (idRestaurante: string, imageBase64: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/restaurantUsers/${idRestaurante}/image`,
            { imageBase64: imageBase64},
            { headers: { 'Content-Type': 'application/json' } }
        );
        console.log("Image uploaded:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
};

// Save restaurant (other data)
export const saveRestaurant = async (restaurantData: {
    id: string;              // Add the id field
    image?: string | null;
}) => {
    if (restaurantData.image) {
        // Upload the image if provided
        await uploadRestaurantImage(restaurantData.id, restaurantData.image);
    }

    // You can add additional logic to save other restaurant data if needed
    // For now, we are assuming the `restaurantData` only needs to be saved

    return { message: "Restaurant saved successfully." };
};

// Fetch restaurants (adjusted to match working endpoint)
export async function fetchRestaurants() {
    const token = localStorage.getItem("token"); // adjust if stored elsewhere

    const response = await axios.get("http://localhost:8000/restaurantUsers", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
}

// Fetch a specific restaurant by ID
export const getRestaurant = async (id: string) => {
    try {
        const response = await axios.get(`${BASE_URL}/restaurantUsers/${id}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching restaurant:", error);
        throw error;
    }
};

export const fetchRestaurantReservations = async (restaurantId: string) => {
    try {
        const token = localStorage.getItem("token"); // Adjust the key if needed

        const response = await axios.post(
            `${BASE_URL}/reservations/by-restaurant`,
            { restaurantId },
        {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error fetching reservations:", error);
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

export const CreateRestaurantCategory = async (categoryData: { name: string; restaurantId: number }) => {
    const response = await fetch('http://localhost:8000/categories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(categoryData)  // ✅ use the data passed to the function
    });

    const data = await response.json();
    console.log(data); // The created Category object
    return data;
};


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

export const AddProductByRestaurant = async (
        product: {
            name: string;
            description: string;
            price: number;
            image: string;
            category: string;
            restaurantUser: {
                idRestaurante: string;
            };
        }
    ): Promise<Product> => {
    const response = await fetch('http://localhost:8000/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to add product: ${response.status} - ${errorText}`);
    }

    const createdProduct: Product = await response.json();
    return createdProduct;
};

export type Plate = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
};


// in RestaurantApi.ts
export const fetchProductsByRestaurant = async (restaurantId: string): Promise<Plate[]> => {
    const response = await axios.get(`http://localhost:8000/products/restaurant/${restaurantId}`);
    console.log('response.data:', response.data);
    return response.data.map((product: any) => ({
        ...product,
        imageUrl: product.image, // image -> imageUrl
    }));
};


export type PlateUpdate = {
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl?: string; // optional if your backend allows
};

export const updateProductById = async (
    id: string,
    updatedData: PlateUpdate
): Promise<Plate> => {
    const response = await axios.put(`http://localhost:8000/products/${id}`, {
        ...updatedData,
    });
    return response.data;
};

export const deleteProductById = async (id: string): Promise<void> => {
    await axios.delete(`http://localhost:8000/products/${id}`);
};


export const updateRestaurantLocation = async (
    idRestaurante: string,
    locationData: { latitude: number; longitude: number }
) => {
    try {
        const token = localStorage.getItem("authToken") || "";

        const response = await axios.put(
            `http://localhost:8000/restaurantUsers/${idRestaurante}/location`,
            locationData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        console.log("Location updated:", response.data);
        return response.data;
    } catch (error) {
        console.error("Error updating location:", error);
        throw error;
    }
};

export interface LocationDTO {
    latitude: number;
    longitude: number;
}

export const fetchRestaurantLocation = async (restaurantId: string): Promise<LocationDTO> => {
    try {
        const token = localStorage.getItem("authToken") || "";

        const response = await axios.get<LocationDTO>(
            `http://localhost:8000/restaurantUsers/${restaurantId}/getlocation`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error("Error fetching location:", error);
        throw error;
    }
};


export interface ReviewDTO {
    id: string;
    clientId: string;
    restaurantId: string;
    isPositive: boolean;
    // Add other fields you might have in your ReviewDTO, e.g.:
    // starRating?: number | null; // For client-to-restaurant reviews
    reviewType: 'CLIENT_TO_RESTAURANT' | 'RESTAURANT_TO_CLIENT'; // Make sure this is in your DTO
    createdAt: string; // From your Spring Boot DTO, assuming it has a createdAt field
}
export const fetchRestaurantReviewsForClient = (
    clientId: string
): Promise<ReviewDTO[]> => { // Returns an array of ReviewDTOs
    return fetch(`http://localhost:8000/reviews/client/${clientId}/restaurant-reviews`, {
        method: "GET", // Explicitly define GET method, though it's default for fetch
    })
        .then((res) => {
            if (!res.ok) {
                // You can add more detailed error handling here based on status code
                if (res.status === 404) {
                    throw new Error(`Client with ID ${clientId} not found or no reviews.`);
                }
                throw new Error(`Failed to fetch restaurant reviews for client. Status: ${res.status}`);
            }
            return res.json();
        })
        .then((data: ReviewDTO[]) => {
            // Optional: You can do some data transformation here if needed
            return data;
        })
        .catch((error) => {
            console.error("Error fetching restaurant reviews for client:", error);
            throw error; // Re-throw to allow component to catch and display
        });
};