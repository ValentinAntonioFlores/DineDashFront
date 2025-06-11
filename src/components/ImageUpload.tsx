import React, { ChangeEvent } from "react";

interface ImageUploadProps {
    restaurantImage: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ restaurantImage, onImageChange }) => {
    return (
        <div className="flex-1 flex flex-col items-center p-4">
            <label
                htmlFor="image-upload"
                className="relative w-72 h-72 cursor-pointer group rounded-2xl overflow-hidden shadow-xl border-4 border-dashed border-gray-300 hover:border-blue-400 transition-all duration-300 ease-in-out
                           flex flex-col items-center justify-center bg-gray-50
                           transform hover:scale-105" // Added hover scale effect
            >
                {!restaurantImage ? (
                    // Improved placeholder for image upload
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500 group-hover:bg-blue-50 transition-all duration-300 ease-in-out p-4 text-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-16 w-16 text-blue-400 mb-2 transform group-hover:scale-110 transition-transform duration-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={1.5}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-lg font-semibold text-gray-700">Click to Upload Image</span>
                        <span className="text-sm text-gray-500 mt-1">PNG, JPG, GIF up to 5MB</span>
                    </div>
                ) : (
                    // Image preview with improved hover overlay
                    <>
                        <img
                            src={restaurantImage}
                            alt="Restaurant"
                            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-10 w-10 mb-2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-lg font-medium">Change Image</span>
                        </div>
                    </>
                )}
            </label>
            <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
            />
            <p className="mt-4 text-sm text-gray-600">Upload a high-quality image of your restaurant.</p>
        </div>
    );
};

export default ImageUpload;
