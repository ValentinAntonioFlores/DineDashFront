import React, { useState } from "react";

interface Props {
    tableNumber: string;
    onClose: () => void;
    onConfirm: (reservation: { name: string; date: string; time: string }) => void;
}

const ReservationModal: React.FC<Props> = ({ tableNumber, onClose, onConfirm }) => {
    const [name, setName] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const handleSubmit = () => {
        if (name && date && time) {
            onConfirm({ name, date, time });
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
        <div className="bg-white p-6 rounded shadow-lg w-80">
        <h2 className="text-lg font-semibold mb-4">Reserve Table {tableNumber}</h2>

    <label className="block mb-2">
        Name:
    <input
        type="text"
    className="border w-full p-1 mt-1"
    value={name}
    onChange={(e) => setName(e.target.value)}
    />
    </label>

    <label className="block mb-2">
        Date:
    <input
        type="date"
    className="border w-full p-1 mt-1"
    value={date}
    onChange={(e) => setDate(e.target.value)}
    />
    </label>

    <label className="block mb-4">
        Time:
    <input
        type="time"
    className="border w-full p-1 mt-1"
    value={time}
    onChange={(e) => setTime(e.target.value)}
    />
    </label>

    <div className="flex justify-end gap-2">
    <button onClick={onClose} className="px-3 py-1 bg-gray-300 rounded">
        Cancel
        </button>
        <button onClick={handleSubmit} className="px-3 py-1 bg-blue-600 text-white rounded">
        Reserve
        </button>
        </div>
        </div>
        </div>
);
};

export default ReservationModal;
