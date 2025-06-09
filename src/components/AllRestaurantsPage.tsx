import React, { useEffect, useState } from "react";
import { fetchPublicRestaurants, fetchCategories } from "../utils/Api";
import { useNavigate } from "react-router-dom";
import HomeLayout from "../layouts/HomeHeaderLayout";
import { useLocation } from "react-router-dom";


type Restaurant = {
    id: string;
    name: string;
    imageUrl?: string;
    categories: string[];
    rating?: number;
};

const AllRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minRating, setMinRating] = useState(0);
    const location = useLocation();

    const navigate = useNavigate();
    const [categories, setCategories] = useState<{ id: string; name: string; restaurantId: string }[]>([]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryParam = params.get("query") || "";
        const categoryParam = params.get("category") || "";

        setSearchTerm(queryParam);
        setSelectedCategory(categoryParam);
    }, [location.search]);



    useEffect(() => {
        Promise.all([fetchPublicRestaurants(), fetchCategories()])
            .then(async ([restaurantsData, categoriesData]) => {
                const categoryMap = new Map<string, string[]>();
                categoriesData.forEach(cat => {
                    if (!categoryMap.has(cat.restaurantId)) categoryMap.set(cat.restaurantId, []);
                    categoryMap.get(cat.restaurantId)!.push(cat.name);
                });

                const enriched = restaurantsData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    imageUrl: r.imageUrl,
                    categories: categoryMap.get(r.id) || ["Categoría desconocida"],
                    rating: r.averageRating,
                }));

                setRestaurants(enriched);
                setFilteredRestaurants(enriched);
                setCategories(categoriesData);
            })
            .catch((err) => console.error("Error fetching data:", err));
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

    const categoryNames = Array.from(new Set(categories.map((cat) => cat.name)));

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMinRating(0);
    };



    return (
        <HomeLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

                {/* Modern Filter Bar */}
                <div className="bg-white rounded-3xl shadow-md p-6 mb-8 flex flex-wrap gap-6 items-end">
                    <div className="flex flex-col">
                        <label htmlFor="search" className="text-sm font-medium text-gray-700 mb-1">
                            🔍 Buscar por nombre
                        </label>
                        <input
                            id="search"
                            type="text"
                            placeholder="Ej. La Trattoria"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="border border-gray-300 rounded-xl px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="category" className="text-sm font-medium text-gray-700 mb-1">
                            🏷️ Categoría
                        </label>
                        <select
                            id="category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="border border-gray-300 rounded-xl px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                        >
                            <option value="">Todas</option>
                            {categoryNames.map((catName) => (
                                <option key={catName} value={catName}>
                                    {catName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="rating" className="text-sm font-medium text-gray-700 mb-1">
                            ⭐ Calificación mínima
                        </label>
                        <select
                            id="rating"
                            value={minRating}
                            onChange={(e) => setMinRating(Number(e.target.value))}
                            className="border border-gray-300 rounded-xl px-4 py-2 w-56 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
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
                        className="bg-red-500 text-white px-5 py-2 rounded-xl hover:bg-red-600 transition-all mt-6"
                    >
                        Limpiar filtros
                    </button>
                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">🍽️ Todos los Restaurantes</h1>

                {/* Resultados */}
                {filteredRestaurants.length === 0 ? (
                    <div className="text-center text-gray-500 mt-32 text-lg">
                        😕 No hay restaurantes que coincidan con los filtros.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredRestaurants.map(({ id, name, imageUrl, categories, rating }) => (
                            <div
                                key={id}
                                onClick={() => navigate(`/restaurant/${id}/layout`)}
                                className="bg-white rounded-3xl shadow hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
                            >
                                {imageUrl ? (
                                    <img
                                        src={
                                            imageUrl.startsWith("data:")
                                                ? imageUrl
                                                : `data:image/jpeg;base64,${imageUrl}`
                                        }
                                        alt={name}
                                        className="w-full h-48 object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                                        Sin imagen
                                    </div>
                                )}
                                <div className="p-4">
                                    <h2 className="text-lg font-semibold text-gray-800">{name}</h2>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {categories.map((cat) => (
                                            <span key={cat} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                        {cat}
                      </span>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        ⭐ {rating?.toFixed(1) ?? "N/A"} • Experiencia gastronómica única
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default AllRestaurantsPage;
