import React from 'react';

interface Props {
    title: string;
    imageUrl?: string;
    onClick?: () => void; // <-- make optional
}
const CategoryCard: React.FC<Props> = ({ title, imageUrl, onClick }) => {
    return (
        <div
            onClick={onClick}
            className="w-32 h-32 bg-white rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition overflow-hidden"
        >
            {imageUrl ? (
                <img
                    src={`data:image/jpeg;base64,${imageUrl}`} // base64 string formatted correctly for the <img> tag
                    alt={title}
                    className="w-full h-20 object-cover"
                />
            ) : (
                <div className="w-full h-20 bg-gray-200" />
            )}
            <span className="text-center font-semibold p-1">{title}</span>
        </div>
    );
};

export default CategoryCard;
