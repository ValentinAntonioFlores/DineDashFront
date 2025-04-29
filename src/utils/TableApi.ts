
import axios from "axios";

export const createTable = async (restaurantId: string, table: {
    positionX: number;
    positionY: number;
    capacity: number;
    isAvailable: boolean;
}) => {
    const response = await axios.post("/tables", {
        restaurantId,
        tableDTO: table,
    });
    return response.data;
};
