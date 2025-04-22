import React, { useState } from 'react';

interface Table {
    id: number;
    name: string;
    seats: number;
    status: 'available' | 'booked';
}

const TableManagement: React.FC = () => {
    // Example seating arrangement for the restaurant
    const [tables, setTables] = useState<Table[]>([
        { id: 1, name: 'Table 1', seats: 4, status: 'available' },
        { id: 2, name: 'Table 2', seats: 2, status: 'available' },
        { id: 3, name: 'Table 3', seats: 6, status: 'booked' },
        { id: 4, name: 'Table 4', seats: 4, status: 'available' },
        // More tables...
    ]);

    const handleSeatChange = (tableId: number, seats: number) => {
        setTables(prev =>
            prev.map(table =>
                table.id === tableId ? { ...table, seats } : table
            )
        );
    };

    const handleStatusChange = (tableId: number, status: 'available' | 'booked') => {
        setTables(prev =>
            prev.map(table =>
                table.id === tableId ? { ...table, status } : table
            )
        );
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Manage Your Tables</h2>
            <div className="grid grid-cols-2 gap-4">
                {tables.map(table => (
                    <div key={table.id} className="border p-4 rounded">
                        <h3 className="text-xl">{table.name}</h3>
                        <p>Seats: {table.seats}</p>
                        <p>Status: {table.status}</p>

                        {/* Edit Seats */}
                        <input
                            type="number"
                            value={table.seats}
                            onChange={(e) => handleSeatChange(table.id, parseInt(e.target.value))}
                            className="border p-2 rounded"
                        />
                        {/* Toggle Status */}
                        <button
                            onClick={() => handleStatusChange(table.id, table.status === 'available' ? 'booked' : 'available')}
                            className={`mt-2 px-4 py-2 rounded ${table.status === 'available' ? 'bg-green-500' : 'bg-red-500'}`}
                        >
                            {table.status === 'available' ? 'Mark as Booked' : 'Mark as Available'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableManagement;
