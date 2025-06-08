import React, { useEffect, useState } from "react";
import { fetchRestaurantReservations } from "../utils/RestaurantApi.ts";
import { getUserById, createRestaurantToClientReview, ReviewDTO } from "../utils/Api.ts";

interface User {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface Reservation {
    id: string;
    userId: string;
}

interface UsersFromReservationsProps {
    restaurantId: string;
    onSelectUser: (userId: string) => void;
}

const UsersFromReservations: React.FC<UsersFromReservationsProps> = ({ restaurantId, onSelectUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            setError(null);
            try {
                const reservations: Reservation[] = await fetchRestaurantReservations(restaurantId);
                const uniqueUserIds = Array.from(new Set(reservations.map(r => r.userId)));
                const usersFetched = await Promise.all(
                    uniqueUserIds.map(id => getUserById(id).catch(() => null))
                );
                const validUsers = usersFetched.filter((u): u is User => u !== null);
                setUsers(validUsers);
            } catch (e: any) {
                setError(e.message || "Unable to load users. Please try again.");
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [restaurantId]);

    if (loading) return <p>Loading users with reservations...</p>;
    if (error) return <p style={{ color: "red" }}>{error}</p>;
    if (users.length === 0) return <p>No users with past reservations found.</p>;

    return (
        <div style={{ padding: "1rem", background: "#fff", borderRadius: "8px", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Select a Guest to Review</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {users.map(user => (
                    <li key={user.id} style={{ marginBottom: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ fontWeight: 500 }}>{user.firstName} {user.lastName}</span>
                            <button
                                onClick={() => onSelectUser(user.id)}
                                style={{
                                    padding: "0.5rem 1rem",
                                    fontSize: "0.95rem",
                                    backgroundColor: "#28a745",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    transition: "background-color 0.2s"
                                }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#218838")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#28a745")}
                            >
                                Leave Review
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface UserReviewComponentProps {
    userId: string;
    restaurantId: string;
}

const UserReviewComponent: React.FC<UserReviewComponentProps> = ({ userId, restaurantId }) => {
    const [isPositive, setIsPositive] = useState(true);
    const [reviewResponse, setReviewResponse] = useState<ReviewDTO | null>(null);
    const [reviewError, setReviewError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmitReview = async () => {
        setSubmitting(true);
        setReviewError(null);
        setReviewResponse(null);
        try {
            const review = await createRestaurantToClientReview(userId, restaurantId, isPositive);
            setReviewResponse(review);
        } catch (error: any) {
            setReviewError(error.message || "Something went wrong while submitting.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={{
            padding: "1.5rem",
            border: "1px solid #ccc",
            borderRadius: "8px",
            maxWidth: 600,
            backgroundColor: "#f9f9f9",
            boxShadow: "0 2px 6px rgba(0, 0, 0, 0.05)"
        }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.5rem" }}>Submit a Review</h2>
            <p style={{ marginBottom: "1rem", color: "#555" }}>
                Help other restaurants know if this guest is reliable.
            </p>

            <div style={{ marginBottom: "1rem" }}>
                <label style={{ marginRight: "1.5rem" }}>
                    <input
                        type="radio"
                        name="review"
                        checked={isPositive}
                        onChange={() => setIsPositive(true)}
                    />{" "}
                    Showed up
                </label>
                <label>
                    <input
                        type="radio"
                        name="review"
                        checked={!isPositive}
                        onChange={() => setIsPositive(false)}
                    />{" "}
                    Didn't show up
                </label>
            </div>

            <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{
                    padding: "0.6rem 1.2rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                }}
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {reviewError && (
                <p style={{ color: "red", marginTop: "1rem" }}>{reviewError}</p>
            )}

            {reviewResponse && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1rem",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    border: "1px solid #c3e6cb",
                    borderRadius: "6px"
                }}>
                    <p><strong>Review submitted successfully!</strong></p>
                    <p>Status: {reviewResponse.isPositive ? "Showed up" : "Didn't show up"}</p>
                    <p>Submitted on: {new Date(reviewResponse.createdAt).toLocaleString()}</p>
                </div>
            )}
        </div>
    );
};

interface ParentComponentProps {
    restaurantId: string;
}

const ParentComponent: React.FC<ParentComponentProps> = ({ restaurantId }) => {
    const [selectedUserId, setSelectedUserId] = useState<string>("");

    return (
        <div style={{ maxWidth: 700, margin: "2rem auto", padding: "1rem" }}>
            <UsersFromReservations
                restaurantId={restaurantId}
                onSelectUser={setSelectedUserId}
            />

            {selectedUserId && (
                <UserReviewComponent
                    userId={selectedUserId}
                    restaurantId={restaurantId}
                />
            )}
        </div>
    );
};

export { UserReviewComponent, UsersFromReservations, ParentComponent };
