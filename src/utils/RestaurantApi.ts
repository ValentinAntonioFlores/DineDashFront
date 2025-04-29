// RestaurantApi.ts
import axios from "axios";

export const saveRestaurant = async (restaurantData: {
    name: string;
    image?: string | null;
    gridLayout?: any;
}) => {
    const response = await axios.post("/api/restaurants", restaurantData);
    return response.data;
};

export const fetchRestaurants = async () => {
    const response = await axios.get("/api/restaurants");
    return response.data;
};
