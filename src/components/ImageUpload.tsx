import React, { ChangeEvent } from "react";

interface ImageUploadProps {
    restaurantImage: string | null;
    onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ restaurantImage, onImageChange }) => {
    return (
        <div className="flex-1 flex flex-col items-center">
            <label
                htmlFor="image-upload"
                className="relative w-64 h-64 cursor-pointer group rounded-xl overflow-hidden shadow-lg border-2 border-dashed border-gray-300 hover:border-blue-400 transition"
            >
                {!restaurantImage ? (
                    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-500 group-hover:bg-blue-50 transition-all">
                        <span className="text-lg font-medium">Upload Image</span>
                        <span className="text-4xl">📷</span>
                    </div>
                ) : (
                    <img
                        src={restaurantImage}
                        alt="Restaurant"
                        className="w-full h-full object-cover transition group-hover:opacity-75"
                    />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100">
                    <span className="text-sm font-medium">Change Image</span>
                </div>
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
