import React from 'react';

interface ReviewButtonProps {
    onClick: () => void;
}

export function ReviewButton({ onClick }: ReviewButtonProps) {
    return (
        <button
            onClick={onClick}
            className="
        fixed bottom-6 left-6
        bg-gradient-to-r from-blue-600 to-indigo-600
        text-white
        py-3 px-6
        rounded-full
        shadow-xl
        hover:from-blue-700 hover:to-indigo-700
        focus:outline-none focus:ring-4 focus:ring-blue-300
        transition
        duration-300
        z-50
        font-semibold
        text-lg
        flex items-center justify-center
        gap-2
      "
            aria-label="Write Review"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 20h9" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.121 2.121 0 113 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Write Review
        </button>
    );
}
