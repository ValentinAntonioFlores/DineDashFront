import React from 'react';

interface Review {
    comment: string;
    firstName: string;
    lastName: string;
    starRating: number; // number between 1 and 5
}

interface StickyReviewsProps {
    reviews: Review[];
}

export default function StickyReviews({ reviews }: StickyReviewsProps) {
    const getRatingColor = (rating: number) => {
        if (rating >= 4) return 'text-emerald-600';
        if (rating >= 3) return 'text-amber-600';
        return 'text-red-500';
    };

    const getRatingBadgeColor = (rating: number) => {
        if (rating >= 4) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        if (rating >= 3) return 'bg-amber-50 text-amber-700 border-amber-200';
        return 'bg-red-50 text-red-700 border-red-200';
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    return (
        <div className="mt-6 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-white">Customer Reviews</h3>
                        <p className="text-indigo-100 text-sm">
                            {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Reviews Container */}
            <div className="max-h-80 overflow-y-auto p-6 space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review, i) => (
                        <div key={i} className="group bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:border-indigo-200">
                            {/* Header with avatar and rating */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                                        {getInitials(review.firstName, review.lastName)}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 text-base">
                                            {review.firstName} {review.lastName}
                                        </p>
                                        {/* Star rating */}
                                        <div className="flex items-center gap-1 mt-1">
                                            {[...Array(5)].map((_, idx) => (
                                                <svg
                                                    key={idx}
                                                    className={`w-4 h-4 transition-colors duration-200 ${
                                                        idx < review.starRating ? 'text-amber-400' : 'text-gray-300'
                                                    }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                >
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.563-.955L10 0l2.947 5.955 6.563.955-4.755 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                {/* Rating badge */}
                                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getRatingBadgeColor(review.starRating)}`}>
                                    {review.starRating}/5
                                </div>
                            </div>

                            {/* Comment */}
                            <div className="relative">
                                <svg className="absolute -top-1 -left-1 w-6 h-6 text-gray-200" fill="currentColor" viewBox="0 0 32 32">
                                    <path d="M10 8c-3.314 0-6 2.686-6 6s2.686 6 6 6h4l6 4v-4c3.314 0 6-2.686 6-6s-2.686-6-6-6H10z"/>
                                </svg>
                                <blockquote className="text-gray-700 leading-relaxed pl-6 italic">
                                    "{review.comment}"
                                </blockquote>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-gray-500 font-medium">No customer reviews yet</p>
                        <p className="text-gray-400 text-sm mt-1">Be the first to share your experience!</p>
                    </div>
                )}
            </div>

            {/* Scroll indicator */}
            {reviews.length > 3 && (
                <div className="bg-gradient-to-t from-gray-50 to-transparent h-6 -mt-6 relative z-10 flex items-end justify-center pb-2">
                    <div className="w-8 h-1 bg-gray-300 rounded-full animate-pulse"></div>
                </div>
            )}
        </div>
    );
}