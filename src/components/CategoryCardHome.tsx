import React from 'react';

interface Props {
    title: string;
    imageUrl?: string;
    onClick?: () => void;
}

const CategoryCard: React.FC<Props> = ({ title, imageUrl, onClick }) => {
    // Determine the correct src:
    let src: string | undefined;
    if (imageUrl) {
        if (imageUrl.startsWith('data:')) {
            // Already a complete data URL (e.g. "data:image/png;base64,...")
            src = imageUrl;
        } else {
            // Raw base64 blob — prepend JPEG prefix
            src = `data:image/jpeg;base64,${imageUrl}`;
        }
    }

    return (
        <div
            onClick={onClick}
            className="w-32 h-32 bg-white rounded-lg shadow-md flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition overflow-hidden"
        >
            {src ? (
                <img
                    src={src}
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
