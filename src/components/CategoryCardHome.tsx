import React from 'react';

interface Props {
    title: string;
    imageUrl?: string;
    onClick?: () => void;
}

const CategoryCard: React.FC<Props> = ({ title, imageUrl, onClick }) => {
    let src: string | undefined;
    if (imageUrl) {
        src = imageUrl.startsWith('data:')
            ? imageUrl
            : `data:image/jpeg;base64,${imageUrl}`;
    }

    return (
        <div
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={(e) => {
                if (onClick && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className="
        group
        w-36 h-40
        bg-white rounded-xl shadow-sm border border-gray-200
        hover:shadow-md hover:border-gray-300 transition-all
        cursor-pointer flex flex-col overflow-hidden
        outline-none
        focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-1
      "
        >
            {src ? (
                <img
                    src={src}
                    alt={title}
                    className="w-full h-24 object-cover rounded-t-xl group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-24 bg-gray-100 rounded-t-xl flex items-center justify-center text-gray-400 select-none">
                    No Image
                </div>
            )}
            <div className="flex-1 flex items-center justify-center p-2 text-sm font-medium text-gray-800 text-center truncate">
                {title}
            </div>
        </div>
    );
};

export default CategoryCard;
