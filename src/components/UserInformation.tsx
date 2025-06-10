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

    if (loading) return <p style={{ textAlign: "center", padding: "1.5rem", fontSize: "0.9rem" }}>Loading users with reservations...</p>;
    if (error) return <p style={{ color: "red", textAlign: "center", padding: "1.5rem", fontSize: "0.9rem" }}>{error}</p>;
    if (users.length === 0) return <p style={{ textAlign: "center", padding: "1.5rem", fontSize: "0.9rem" }}>No users with past reservations found.</p>;

    return (
        <div style={{ padding: "1rem", background: "#fff", borderRadius: "8px", boxShadow: "0 3px 10px rgba(0, 0, 0, 0.06)", marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#333", borderBottom: "1px solid #eee", paddingBottom: "0.8rem" }}>Select a Guest to Review</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {users.map(user => (
                    <li key={user.id} style={{ marginBottom: "0.8rem", border: "1px solid #eee", borderRadius: "6px", padding: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fdfdfd" }}>
                        <span style={{ fontWeight: 500, fontSize: "1rem", color: "#444" }}>{user.firstName} {user.lastName}</span>
                        <button
                            onClick={() => onSelectUser(user.id)}
                            style={{
                                padding: "0.5rem 1.2rem",
                                fontSize: "0.9rem",
                                backgroundColor: "#007bff",
                                color: "#fff",
                                border: "none",
                                borderRadius: "20px",
                                cursor: "pointer",
                                transition: "background-color 0.3s ease, transform 0.2s ease",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.15)"
                            }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0056b3")}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#007bff")}
                            onMouseDown={e => (e.currentTarget.style.transform = "translateY(1px)")}
                            onMouseUp={e => (e.currentTarget.style.transform = "translateY(0)")}
                        >
                            Leave Review
                        </button>
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
            border: "1px solid #e0e0e0",
            borderRadius: "10px",
            maxWidth: 500,
            margin: "0 auto",
            backgroundColor: "#ffffff",
            boxShadow: "0 5px 15px rgba(0, 0, 0, 0.06)"
        }}>
            <h2 style={{ fontSize: "1.4rem", marginBottom: "0.8rem", color: "#333", textAlign: "center" }}>Submit a Review</h2>
            <p style={{ marginBottom: "1.2rem", color: "#666", textAlign: "center", lineHeight: "1.4", fontSize: "0.9rem" }}>
                Help other restaurants know if this guest is reliable by marking whether they showed up for their reservation.
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                {/* Showed up button */}
                <button
                    onClick={() => setIsPositive(true)}
                    style={{
                        flex: 1,
                        padding: "1rem",
                        backgroundColor: isPositive ? "#28a745" : "#f0f0f0",
                        color: isPositive ? "#fff" : "#333",
                        border: isPositive ? "1px solid #28a745" : "1px solid #ccc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease-in-out",
                        boxShadow: isPositive ? "0 3px 6px rgba(40, 167, 69, 0.25)" : "0 1px 3px rgba(0,0,0,0.1)",
                        transform: isPositive ? "translateY(-1px)" : "translateY(0)",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        outline: "none",
                        position: "relative",
                        top: 0
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15) inset";
                        e.currentTarget.style.transform = "translateY(0.5px)";
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.boxShadow = isPositive ? "0 3px 6px rgba(40, 167, 69, 0.25)" : "0 1px 3px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = isPositive ? "translateY(-1px)" : "translateY(0)";
                    }}
                >
                    Showed up
                </button>

                {/* Didn't show up button */}
                <button
                    onClick={() => setIsPositive(false)}
                    style={{
                        flex: 1,
                        padding: "1rem",
                        backgroundColor: !isPositive ? "#dc3545" : "#f0f0f0",
                        color: !isPositive ? "#fff" : "#333",
                        border: !isPositive ? "1px solid #dc3545" : "1px solid #ccc",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "1rem",
                        fontWeight: 600,
                        transition: "all 0.2s ease-in-out",
                        boxShadow: !isPositive ? "0 3px 6px rgba(220, 53, 69, 0.25)" : "0 1px 3px rgba(0,0,0,0.1)",
                        transform: !isPositive ? "translateY(-1px)" : "translateY(0)",
                        WebkitAppearance: "none",
                        MozAppearance: "none",
                        appearance: "none",
                        outline: "none",
                        position: "relative",
                        top: 0
                    }}
                    onMouseDown={(e) => {
                        e.currentTarget.style.boxShadow = "0 1px 2px rgba(0,0,0,0.15) inset";
                        e.currentTarget.style.transform = "translateY(0.5px)";
                    }}
                    onMouseUp={(e) => {
                        e.currentTarget.style.boxShadow = !isPositive ? "0 3px 6px rgba(220, 53, 69, 0.25)" : "0 1px 3px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = !isPositive ? "translateY(-1px)" : "translateY(0)";
                    }}
                >
                    Didn't show up
                </button>
            </div>

            <button
                onClick={handleSubmitReview}
                disabled={submitting}
                style={{
                    width: "100%",
                    padding: "0.7rem 1.2rem",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "1rem",
                    fontWeight: 600,
                    transition: "background-color 0.3s ease, transform 0.2s ease",
                    boxShadow: "0 2px 6px rgba(0, 123, 255, 0.25)",
                    opacity: submitting ? 0.7 : 1,
                    transform: submitting ? "scale(0.98)" : "scale(1)"
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#0056b3")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#007bff")}
                onMouseDown={e => (e.currentTarget.style.transform = "translateY(0.5px)")}
                onMouseUp={e => (e.currentTarget.style.transform = "translateY(0)")}
            >
                {submitting ? "Submitting..." : "Submit Review"}
            </button>

            {reviewError && (
                <p style={{ color: "#dc3545", marginTop: "1rem", textAlign: "center", backgroundColor: "#f8d7da", border: "1px solid #f5c6cb", borderRadius: "6px", padding: "0.8rem", fontSize: "0.9rem" }}>
                    {reviewError}
                </p>
            )}

            {reviewResponse && (
                <div style={{
                    marginTop: "1.5rem",
                    padding: "1.2rem",
                    backgroundColor: "#d4edda",
                    color: "#155724",
                    border: "1px solid #c3e6cb",
                    borderRadius: "8px",
                    textAlign: "center",
                    boxShadow: "0 1px 6px rgba(212, 237, 218, 0.4)"
                }}>
                    <p style={{ fontWeight: 600, fontSize: "1.1rem", marginBottom: "0.4rem" }}>Review submitted successfully!</p>
                    <p style={{ fontSize: "0.9rem" }}>Status: <strong style={{ color: reviewResponse.isPositive ? "#28a745" : "#dc3545" }}>{reviewResponse.isPositive ? "Showed up" : "Didn't show up"}</strong></p>
                    <p style={{ fontSize: "0.8rem", color: "#333" }}>Submitted on: {new Date(reviewResponse.createdAt).toLocaleString()}</p>
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
        <div style={{ maxWidth: 600, margin: "2rem auto", padding: "1rem", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", backgroundColor: "#f8f9fa", borderRadius: "12px", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.08)" }}>
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