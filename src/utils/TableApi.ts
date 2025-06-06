import axios from "axios";

export interface Table {
    isTable: boolean;
    seats: number;
    reserved: boolean;
}

const BASE_URL = "http://localhost:8000";

// Create a single table
export const createTable = async (
    restaurantId: string,
    table: {
        positionX: number;
        positionY: number;
        capacity: number;
        isAvailable: boolean;
    }
) => {
    const response = await axios.post(`${BASE_URL}/tables`, {
        restaurantId,
        tableDTO: table,
    });
    return response.data;
};

// Fetch full grid layout for a restaurant
export const fetchGridLayout = async (restaurantId: string) => {
    const response = await axios.get(`${BASE_URL}/tables/grid?restaurantId=${restaurantId}`);
    const rawGrid = response.data;

    return rawGrid.map((row: any[]) =>
        row.map(cell => ({
            isTable: cell.isTable || false,
            seats: cell.capacity || 0,
            reserved: !cell.isAvailable,
        }))
    );
};

// Save grid layout (2D Table[][]) to backend
export const saveGridLayout = async (restaurantId: string, gridLayout: Table[][]) => {
    const mappedGrid = gridLayout.map((row, rowIndex) =>
        row.map((cell, colIndex) => ({
            positionX: rowIndex,
            positionY: colIndex,
            capacity: cell.seats,
            isAvailable: !cell.reserved,
            isTable: cell.isTable,
        }))
    );

    const response = await axios.post(`${BASE_URL}/tables/save`, {
        restaurantId,
        gridLayout: mappedGrid,
    });

    return response.data;
};
