import React, { useState } from 'react';

interface Table {
    id: number;
    name: string;
    seats: number;
    status: 'available' | 'booked';
}

const TableSelection: React.FC = () => {
    const [tables, setTables] = useState<Table[]>([
        { id: 1, name: 'Table 1', seats: 4, status: 'available' },
        { id: 2, name: 'Table 2', seats: 2, status: 'booked' },
        { id: 3, name: 'Table 3', seats: 6, status: 'available' },
        { id: 4, name: 'Table 4', seats: 4, status: 'booked' },
        // More tables...
    ]);

    const handleTableSelect = (tableId: number) => {
        setTables(prev =>
            prev.map(table =>
                table.id === tableId && table.status === 'available'
                    ? { ...table, status: 'booked' }
                    : table
            )
        );
    };

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-4">Select Your Table</h2>
            <div className="grid grid-cols-2 gap-4">
                {tables.map(table => (
                    <div
                        key={table.id}
                        className={`border p-4 rounded ${table.status === 'available' ? 'bg-green-100' : 'bg-gray-300'}`}
                    >
                        <h3 className="text-xl">{table.name}</h3>
                        <p>Seats: {table.seats}</p>
                        <p>Status: {table.status}</p>
                        <button
                            onClick={() => handleTableSelect(table.id)}
                            disabled={table.status === 'booked'}
                            className={`mt-2 px-4 py-2 rounded ${table.status === 'available' ? 'bg-green-500' : 'bg-gray-400'}`}
                        >
                            {table.status === 'available' ? 'Select Table' : 'Table Booked'}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TableSelection;
