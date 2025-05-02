import axios from 'axios';

const BASE_URL = "http://localhost:8000"; // Spring Boot backend

// Upload restaurant image
export const uploadRestaurantImage = async (restaurantId: string, imageBase64: string) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/restaurantUsers/${restaurantId}/image`,
            { imagenBase64: imageBase64 },
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

// Fetch restaurants (just as before)
export const fetchRestaurants = async () => {
    const response = await axios.get(`${BASE_URL}/api/restaurants`);
    return response.data;
};
