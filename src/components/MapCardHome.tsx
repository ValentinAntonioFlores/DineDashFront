// src/components/MapCard.tsx
import React from 'react';

interface Props {
    title: string;
    onClick: () => void;
}

const MapCard: React.FC<Props> = ({ title, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-full h-72 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 cursor-pointer transition-all flex items-center justify-center"
        >
            <span className="text-xl font-semibold text-gray-700">{title}</span>
        </div>
    );
};

export default MapCard;
