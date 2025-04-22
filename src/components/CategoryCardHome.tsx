// src/components/CategoryCard.tsx
import React from 'react';

interface Props {
    title: string;
    onClick: () => void;
}

const CategoryCard: React.FC<Props> = ({ title, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-32 h-32 bg-white rounded-lg shadow-md flex items-center justify-center cursor-pointer hover:bg-gray-100 transition"
        >
            <span className="text-center font-semibold">{title}</span>
        </div>
    );
};

export default CategoryCard;
