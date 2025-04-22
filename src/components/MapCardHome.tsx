// src/components/CategoryCard.tsx
import React from 'react';

interface Props {
    title: string;
    onClick: () => void;
}

const MapCard: React.FC<Props> = ({ title, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-[480px] h-[300px] bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
        >
            <span className="text-center font-semibold">{title}</span>
        </div>
    );
};

export default MapCard;
