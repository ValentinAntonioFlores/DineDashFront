import React from 'react';
import TableManagement from "./TableManagement.tsx";

const RestaurantDashboard: React.FC = () => {
    const isRestaurant = true; // Replace this with your logic for checking if the user is a restaurant

    return (
        <div>
            {isRestaurant ? (
                <TableManagement /> // Only visible to restaurants
            ) : (
                <p>You do not have access to table management.</p>
            )}
        </div>
    );
};

export default RestaurantDashboard;
