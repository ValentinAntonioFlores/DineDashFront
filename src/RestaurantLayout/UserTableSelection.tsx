import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Interface para una mesa
interface Table {
    id: string;
    capacity: number;
    positionX: number;
    positionY: number;
    available: boolean;
}

// Subcomponente para mostrar una mesa individual
const TableCard: React.FC<{
    table: Table;
    onReserve: (tableId: string) => void;
}> = ({ table, onReserve }) => {
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px', borderRadius: '8px' }}>
            <p><strong>Capacity:</strong> {table.capacity}</p>
            <p><strong>Position:</strong> ({table.positionX}, {table.positionY})</p>
            <p><strong>Status:</strong> {table.available ? 'Available' : 'Booked'}</p>
            <button
                onClick={() => onReserve(table.id)}
                disabled={!table.available}
                style={{ padding: '6px 12px', cursor: table.available ? 'pointer' : 'not-allowed' }}
            >
                Reserve
            </button>
        </div>
    );
};

const TableSelection: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [reservingTableId, setReservingTableId] = useState<string | null>(null);

    const restaurantId = 'your-restaurant-id'; // 🔥 Cambiar esto por el real cuando tengas acceso

    useEffect(() => {
        const fetchTables = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`/tables/${restaurantId}`);
                setTables(response.data);
            } catch (error) {
                if (axios.isAxiosError(error)) {
                    console.error('Axios error fetching tables:', error.response?.data || error.message);
                } else {
                    console.error('Unexpected error fetching tables:', error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTables();
    }, [restaurantId]);

    const handleReserveTable = async (tableId: string) => {
        setReservingTableId(tableId);
        try {
            const data = {
                tableId,
                restaurantUserId: 'your-user-id', // 🔥 Cambiar aquí
                startTime: new Date().toISOString(),
                endTime: new Date(Date.now() + 3600000).toISOString(),
            };

            await axios.post('/reservations', data); // 👈 mandamos `data`, no `params`

            setTables(prevTables =>
                prevTables.map(table =>
                    table.id === tableId ? { ...table, available: false } : table
                )
            );
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Axios error reserving table:', error.response?.data || error.message);
            } else {
                console.error('Unexpected error reserving table:', error);
            }
        } finally {
            setReservingTableId(null);
        }
    };


    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
            <h2>Select a Table</h2>
            {loading ? (
                <p>Loading tables...</p>
            ) : tables.length === 0 ? (
                <p>No tables available.</p>
            ) : (
                tables.map(table => (
                    <TableCard
                        key={table.id}
                        table={table}
                        onReserve={handleReserveTable}
                    />
                ))
            )}
            {reservingTableId && <p>Reserving table {reservingTableId}...</p>}
        </div>
    );
};

export default TableSelection;
