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
    const [comment, setComment] = useState("");

    const handleSubmit = async () => {
        if (!selectedStar) {
            setError("Please select a star rating.");
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await makeReviewOnRestaurant({ userId, restaurantId, rating: selectedStar, comment });
            onClose();
        } catch (err) {
            console.error("Review submission failed", err);
            setError("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = {
        1: "Poor",
        2: "Fair",
        3: "Good",
        4: "Very Good",
        5: "Excellent"
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-md text-center border border-gray-100 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                {/* Header with icon */}
                <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Rate Your Experience
                    </h2>
                    <p className="text-gray-600">
                        How was your experience at <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{restaurantName}</span>?
                    </p>
                </div>

                {/* Star Rating */}
                <div className="mb-6">
                    <div className="flex justify-center space-x-1 mb-3">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => !isSubmitting && setSelectedStar(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(null)}
                                className={`text-4xl transition-all duration-300 transform ${
                                    (hoveredStar ?? selectedStar ?? 0) >= star
                                        ? "text-amber-400 scale-110 drop-shadow-lg filter brightness-110"
                                        : "text-gray-300 hover:text-amber-200"
                                } ${!isSubmitting ? "hover:scale-125 cursor-pointer active:scale-95" : "cursor-not-allowed opacity-50"}`}
                                disabled={isSubmitting}
                                aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>

                    {/* Rating Label */}
                    <div className="h-6">
                        {(hoveredStar || selectedStar) && (
                            <p className="text-sm font-medium text-gray-700 animate-fade-in bg-gray-100 px-3 py-1 rounded-full inline-block">
                                {ratingLabels[hoveredStar || selectedStar]}
                            </p>
                        )}
                    </div>
                </div>

                {/* Comment Section */}
                <div className="mb-4">
                    <textarea
                        className="w-full border-2 border-gray-200 rounded-xl p-4 resize-none focus:border-indigo-500 focus:outline-none transition-all duration-200 bg-gray-50 focus:bg-white placeholder-gray-400 shadow-inner"
                        placeholder="Leave a comment (optional)"
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        disabled={isSubmitting}
                    />
                </div>

                <p className="text-gray-500 text-xs mb-4 italic flex items-center justify-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Your previous comments will be updated
                </p>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 rounded-lg animate-shake">
                        <p className="text-red-700 text-sm font-medium flex items-center gap-2" role="alert">
                            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Submitting...
                            </>
                        ) : (
                            "Submit"
                        )}
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes fade-in {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95); 
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1); 
                    }
                }
                
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
                    20%, 40%, 60%, 80% { transform: translateX(3px); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
                
                .animate-shake {
                    animation: shake 0.5s ease-in-out;
                }
            `}</style>
        </div>
    );
};