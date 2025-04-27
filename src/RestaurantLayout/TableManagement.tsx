import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Table {
    id: string;
    capacity: number;
    positionX: number;
    positionY: number;
    available: boolean;
}

const TableManagement: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);

    useEffect(() => {
        const fetchTables = async () => {
            try {
                const response = await axios.get('/tables/{restaurantId}'); // Replace with actual restaurantId
                setTables(response.data);
            } catch (error) {
                console.error('Error fetching tables:', error);
            }
        };
        fetchTables();
    }, []);

    const handleUpdateTable = async (tableId: string, updatedData: Partial<Table>) => {
        try {
            const data = {
                ...updatedData,
                restaurantId: 'your-restaurant-id', // 🔥 agregarlo al body
            };

            const response = await axios.put(`/tables/${tableId}`, data);

            setTables(prev =>
                prev.map(table => (table.id === tableId ? response.data : table))
            );
        } catch (error) {
            console.error('Error updating table:', error);
        }
    };

    return (
        <div>
            <h2>Manage Tables</h2>
            {tables.map(table => (
                <div key={table.id}>
                    <p>Capacity: {table.capacity}</p>
                    <p>Position: ({table.positionX}, {table.positionY})</p>
                    <p>Status: {table.available ? 'Available' : 'Booked'}</p>
                    <button
                        onClick={() =>
                            handleUpdateTable(table.id, { available: !table.available })
                        }
                    >
                        {table.available ? 'Mark as Booked' : 'Mark as Available'}
                    </button>
                </div>
            ))}
        </div>
    );
};

export default TableManagement;