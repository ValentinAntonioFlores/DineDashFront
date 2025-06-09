import React, { useEffect, useState } from "react";
import { fetchPublicRestaurants, fetchCategories} from "../utils/Api";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeHeaderLayout";

type Restaurant = {
    id: string;
    name: string;
    imageUrl?: string;
    categories: string[];    // changed from category?: string to categories: string[]
    rating?: number;
};

const AllRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minRating, setMinRating] = useState(0);

    const navigate = useNavigate();

    const [categories, setCategories] = useState<{ id: string; name: string; restaurantId: string }[]>([]);

    useEffect(() => {
        Promise.all([fetchPublicRestaurants(), fetchCategories()])
            .then(async ([restaurantsData, categoriesData]) => {
                // Create a category map: restaurantId => category names
                const categoryMap = new Map<string, string[]>();
                categoriesData.forEach(cat => {
                    if (!categoryMap.has(cat.restaurantId)) {
                        categoryMap.set(cat.restaurantId, []);
                    }
                    categoryMap.get(cat.restaurantId)!.push(cat.name);
                });

                // Fetch ratings in parallel
                const enriched = restaurantsData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    imageUrl: r.imageUrl,
                    categories: categoryMap.get(r.id) || ["Categoría desconocida"],
                    rating: r.averageRating,  // directly from backend now!
                }));


                setRestaurants(enriched);
                setFilteredRestaurants(enriched);
                setCategories(categoriesData);
            })
            .catch((err) => {
                console.error("Error fetching data:", err);
            });
    }, []);


    useEffect(() => {
        let filtered = restaurants;

        if (searchTerm.trim()) {
            filtered = filtered.filter((r) =>
                r.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter((r) => r.categories.includes(selectedCategory));
        }

        if (minRating > 0) {
            filtered = filtered.filter((r) => (r.rating ?? 0) >= minRating);
        }

        setFilteredRestaurants(filtered);
    }, [searchTerm, selectedCategory, minRating, restaurants]);

    // Get unique category names for dropdown
    const categoryNames = Array.from(new Set(categories.map((cat) => cat.name)));

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMinRating(0);
    };

    return (
        <HomeLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex gap-8">
                {/* Sidebar Filters on the LEFT */}
                <aside className="w-72 bg-white p-6 rounded-2xl shadow-md sticky top-20 self-start">
                    <h3 className="text-xl font-semibold mb-4">Filtros</h3>

                    <div className="mb-6">
                        <label htmlFor="search" className="block text-gray-700 font-medium mb-1">
                            Buscar por nombre
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Ej. La Trattoria"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="mb-6">
                        <label htmlFor="category" className="block text-gray-700 font-medium mb-1">
                            Categoría
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Todas</option>
                            {categoryNames.map((catName) => (
                                <option key={catName} value={catName}>
                                    {catName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-6">
                        <label htmlFor="rating" className="block text-gray-700 font-medium mb-1">
                            Calificación mínima
                        </label>
                        <select
                            id="rating"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={0}>Cualquiera</option>
                            {[1, 2, 3, 4, 5].map((r) => (
                                <option key={r} value={r}>
                                    {r} ⭐ o más
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        onClick={clearFilters}
                        className="w-full bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition"
                    >
                        Limpiar filtros
                    </button>
                </aside>

                {/* Restaurant List on the RIGHT */}
                <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-6 text-gray-900">
                        Todos los Restaurantes
                    </h1>

                    {filteredRestaurants.length === 0 ? (
                        <div className="text-center text-gray-500 mt-32 text-lg">
                            😕 No hay restaurantes que coincidan con los filtros.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6">
                            {filteredRestaurants.map(({ id, name, imageUrl, categories, rating }) => (
                                <div
                                    key={id}
                                    onClick={() => navigate(`/restaurant/${id}/layout`)}
                                    className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white rounded-2xl shadow hover:shadow-md transition cursor-pointer"
                                >
                                    {imageUrl ? (
                                        <img
                                            src={
                                                imageUrl.startsWith("data:")
                                                    ? imageUrl
                                                    : `data:image/jpeg;base64,${imageUrl}`
                                            }
                                            alt={name}
                                            className="w-full md:w-48 h-40 object-cover rounded-xl"
                                        />
                                    ) : (
                                        <div className="w-full md:w-48 h-40 bg-gray-200 flex items-center justify-center rounded-xl text-sm text-gray-500">
                                            Sin imagen
                                        </div>
                                    )}

                                    <div className="flex-1">
                                        <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {categories.join(", ") || "Categoría desconocida"}
                                        </p>
                                        <p className="text-sm text-gray-400 mt-1">
                                            ⭐ {rating?.toFixed(1) ?? "N/A"} · 120 reseñas
                                        </p>
                                        <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                                            Vive una experiencia gastronómica inolvidable con platos únicos,
                                            ambiente acogedor y atención de primera.
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </HomeLayout>
    );
};

export default AllRestaurantsPage;
