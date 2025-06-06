import { useState } from "react";
import { makeReviewOnRestaurant } from "../utils/Api.ts";

type Props = {
    userId: string;
    restaurantId: string;
    restaurantName?: string;
    onClose: () => void;
};

export const ReservationReviewPopup = ({
                                           userId,
                                           restaurantId,
                                           restaurantName = "the restaurant",
                                           onClose,
                                       }: Props) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hoveredStar, setHoveredStar] = useState<number | null>(null);
    const [selectedStar, setSelectedStar] = useState<number | null>(null);

    const handleRating = async (rating: number) => {
        setIsSubmitting(true);
        setError(null);
        setSelectedStar(rating);

        try {
            await makeReviewOnRestaurant({ userId, restaurantId, rating });
            onClose();
        } catch (err) {
            console.error("Review submission failed", err);
            setError("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-2xl w-96 text-center border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                    How was your experience at <span className="text-indigo-600">{restaurantName}</span>?
                </h2>
                <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => !isSubmitting && handleRating(star)}
                            onMouseEnter={() => setHoveredStar(star)}
                            onMouseLeave={() => setHoveredStar(null)}
                            className={`text-3xl transition-transform duration-150 ${
                                (hoveredStar ?? selectedStar) >= star ? "text-yellow-400" : "text-gray-300"
                            } ${!isSubmitting ? "hover:scale-125 cursor-pointer" : "cursor-not-allowed"}`}
                            disabled={isSubmitting}
                            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
                {error && (
                    <p className="text-red-500 text-sm mb-3" role="alert">
                        {error}
                    </p>
                )}
                <button
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="mt-2 px-5 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition disabled:opacity-50"
                >
                    Cancel
                </button>
            </div>

            {/* Animation styles (can be moved to CSS file if needed) */}
            <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
        </div>
    );
};
