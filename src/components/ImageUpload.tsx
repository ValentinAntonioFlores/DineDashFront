import React, { ChangeEvent } from "react";

interface ImageUploadProps {
    restaurantImage: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ restaurantImage, onImageChange }) => {
    return (
        <div className="flex-1 flex flex-col items-center">
            <label htmlFor="image-upload" className="relative w-64 h-64 cursor-pointer group">
                <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-center items-center text-white rounded-lg group-hover:bg-opacity-50 transition">
                    <span className="font-semibold text-lg">Choose Picture</span>
                    <span className="text-4xl">+</span>
                </div>
                {!restaurantImage ? (
                    <div className="w-full h-full bg-white border-2 border-dashed border-gray-400 rounded-lg" />
                ) : (
                    <img
                        src={restaurantImage}
                        alt="Restaurant"
                        className="w-full h-full object-cover rounded-lg shadow-md"
                    />
                )}
            </label>
            <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                className="hidden"
            />
        </div>
    );
};

export default ImageUpload;
