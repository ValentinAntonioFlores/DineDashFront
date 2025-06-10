// components/ClientReviewSummary.tsx
import React, { useEffect, useState } from 'react';
import { fetchRestaurantReviewsForClient, ReviewDTO} from "../utils/RestaurantApi.ts";


interface ClientReviewSummaryProps {
    clientId: string;
}

const ClientReviewSummary: React.FC<ClientReviewSummaryProps> = ({ clientId }) => {
    const [positiveCount, setPositiveCount] = useState<number>(0);
    const [totalReviews, setTotalReviews] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadReviewSummary = async () => {
            if (!clientId) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const reviews: ReviewDTO[] = await fetchRestaurantReviewsForClient(clientId);

                const positive = reviews.filter(review => review.isPositive).length;
                const total = reviews.length;

                setPositiveCount(positive);
                setTotalReviews(total);
            } catch (err: any) {
                console.error("Failed to fetch client reviews for summary:", err);
                setError("Failed to load review summary.");
            } finally {
                setLoading(false);
            }
        };

        loadReviewSummary();
    }, [clientId]); // Re-run effect if clientId changes

    if (loading) {
        return <span className="text-gray-500 text-sm">Loading reviews...</span>;
    }

    if (error) {
        return <span className="text-red-500 text-sm">{error}</span>;
    }

    // Display the count if there are reviews, otherwise indicate no reviews
    return (
        <span className="text-gray-700 text-sm font-semibold">
            {totalReviews > 0 ? `${positiveCount} / ${totalReviews}` : "No reviews"}
        </span>
    );
};

export default ClientReviewSummary;