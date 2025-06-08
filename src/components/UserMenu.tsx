import React, { useEffect, useState } from "react";
import { fetchProductsByRestaurant } from "../utils/RestaurantApi.ts";

type Plate = {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
};

const categories = ["Pasta", "Pizza", "Drinks", "Salads", "Desserts"];

type UserMenuProps = {
    restaurantId: string;
};

const UserMenu: React.FC<UserMenuProps> = ({ restaurantId }) => {
    const [plates, setPlates] = useState<Plate[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!restaurantId) return;

        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
            try {
                const products = await fetchProductsByRestaurant(restaurantId);
                const transformed = products.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    description: p.description,
                    price: p.price,
                    category: p.category,
                    imageUrl: p.image || p.imageUrl || "",
                }));
                setPlates(transformed);
            } catch (error) {
                console.error("Error fetching products:", error);
                setError("Failed to load the menu.");
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [restaurantId]);

    if (loading) {
        return (
            <p className="text-center text-gray-600 italic mt-16 text-lg">Loading menu...</p>
        );
    }

    if (error) {
        return (
            <p className="text-center text-red-600 font-semibold mt-16 text-lg">{error}</p>
        );
    }

    return (
        <div
            className="min-h-screen py-12 px-4"
            style={{ backgroundColor: "#f4f5f7", fontFamily: "'Georgia', serif", color: "#333333" }}
        >
            <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-10">
                <h2 className="text-4xl font-serif italic mb-12 text-left text-amber-700 tracking-wide">
                    Menu
                </h2>

                {categories.map((category) => {
                    const platesInCategory = plates.filter((p) => p.category === category);
                    if (platesInCategory.length === 0) return null;

                    return (
                        <section key={category} className="mb-14">
                            <h3 className="text-3xl font-serif italic mb-7 border-l-6 border-amber-600 pl-4 text-amber-700 tracking-wide">
                                {category}
                            </h3>

                            <div className="space-y-8">
                                {platesInCategory.map((plate) => (
                                    <article
                                        key={plate.id}
                                        className="flex items-center justify-between bg-gray-50 border border-gray-300 rounded-xl p-6 shadow-sm transition-shadow duration-300 hover:shadow-md"
                                    >
                                        <div className="flex-1 pr-8">
                                            <h4 className="text-2xl font-serif italic mb-2 text-gray-800">{plate.name}</h4>
                                            <p className="text-base italic font-serif text-gray-600 mb-3 leading-relaxed">
                                                {plate.description}
                                            </p>
                                            <p className="font-semibold font-serif italic text-amber-700 text-lg">
                                                ${plate.price.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="w-32 h-32 flex-shrink-0 rounded-2xl overflow-hidden border border-gray-300 shadow-md bg-white">
                                            {plate.imageUrl ? (
                                                <img
                                                    src={plate.imageUrl}
                                                    alt={plate.name}
                                                    className="object-cover w-full h-full rounded-2xl"
                                                />
                                            ) : (
                                                <div className="flex items-center justify-center h-full text-gray-400 text-sm italic">
                                                    No Image
                                                </div>
                                            )}
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <hr className="border-t border-gray-300 mt-12" />
                        </section>
                    );
                })}
            </div>
        </div>
    );
};

export default UserMenu