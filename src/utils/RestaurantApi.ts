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
