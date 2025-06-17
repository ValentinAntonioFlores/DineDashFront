import React, { useEffect, useState } from "react";
import { fetchEmailNotificationsPreference, updateEmailNotificationsPreference,} from "../utils/RestaurantApi";

type Props = {
    restaurantId: string;
};

const RestaurantEmailNotificationToggle: React.FC<Props> = ({ restaurantId }) => {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPreference = async () => {
            setLoading(true);
            try {
                const preference = await fetchEmailNotificationsPreference(restaurantId);
                setEnabled(preference);
            } catch (err) {
                setError("Failed to load email notification setting.");
            } finally {
                setLoading(false);
            }
        };

        fetchPreference();
    }, [restaurantId]);

    const togglePreference = async () => {
        if (enabled === null) return;

        setLoading(true);
        setError(null);

        try {
            await updateEmailNotificationsPreference(restaurantId, !enabled);
            setEnabled(!enabled);
        } catch (err) {
            setError("Failed to update email notification setting.");
        } finally {
            setLoading(false);
        }
    };

    if (enabled === null && loading) {
        return (
            <div className="flex justify-center items-center py-8">
                <svg
                    className="animate-spin h-8 w-8 text-blue-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    ></circle>
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                    ></path>
                </svg>
            </div>
        );
    }

    return (
        <div className="max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Restaurant Email Notifications</h3>

            {error && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md">
                    {error}
                </div>
            )}

            <div className="flex items-center space-x-4">
        <span
            className={`font-medium ${enabled ? "text-green-600" : "text-red-600"}`}
        >
          {enabled ? "Activated" : "Deactivated"}
        </span>

                <button
                    onClick={togglePreference}
                    disabled={loading}
                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
            ${enabled ? "bg-green-500" : "bg-gray-300"}
            ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
                    aria-pressed={enabled}
                    aria-label="Toggle restaurant email notifications"
                >
          <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform
              ${enabled ? "translate-x-6" : "translate-x-1"}`}
          ></span>
                </button>

                {loading && (
                    <svg
                        className="animate-spin h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8z"
                        ></path>
                    </svg>
                )}
            </div>
        </div>
    );
};

export default RestaurantEmailNotificationToggle;
