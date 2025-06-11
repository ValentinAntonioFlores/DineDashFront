import React, { useEffect, useState } from "react";
import { fetchPublicRestaurants, fetchCategories } from "../utils/Api";
import { useNavigate, useLocation } from "react-router-dom";
import HomeLayout from "../layouts/HomeHeaderLayout";

type Restaurant = {
    id: string;
    name: string;
    imageUrl?: string;
    categories: string[];
    rating?: number;
};

// --- NEW CONSTANT: Items per page ---
const RESTAURANTS_PER_PAGE = 9; // Display 9 restaurants per page (e.g., a 3x3 grid)
// --- END NEW CONSTANT ---

const AllRestaurantsPage: React.FC = () => {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [minRating, setMinRating] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();
    const [categories, setCategories] = useState<{ id: string; name: string; restaurantId: string }[]>([]);

    // --- NEW STATE FOR PAGINATION ---
    const [currentPage, setCurrentPage] = useState<number>(1);
    // --- END NEW STATE ---

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const queryParam = params.get("query") || "";
        const categoryParam = params.get("category") || "";

        setSearchTerm(queryParam);
        setSelectedCategory(categoryParam);
        setCurrentPage(1); // Reset to first page when URL params change
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
                setCategories(categoriesData); // Set categories state here
            })
            .catch((err) => console.error("Error fetching data:", err));
    }, []);

    useEffect(() => {
        let filtered = restaurants; // Start with all restaurants

        if (searchTerm.trim()) {
            filtered = filtered.filter((r) =>
                r.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            // --- FIX: Make category filtering case-insensitive ---
            const lowerCaseSelectedCategory = selectedCategory.toLowerCase();
            filtered = filtered.filter((r) =>
                r.categories.map(cat => cat.toLowerCase()).includes(lowerCaseSelectedCategory)
            );
            // --- END FIX ---
        }

        if (minRating > 0) {
            filtered = filtered.filter((r) => (r.rating ?? 0) >= minRating);
        }

        setFilteredRestaurants(filtered);
        setCurrentPage(1); // Reset to first page whenever filters change
    }, [searchTerm, selectedCategory, minRating, restaurants]); // Dependencies are correct

    const categoryNames = Array.from(new Set(categories.map((cat) => cat.name)));

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("");
        setMinRating(0);
        setCurrentPage(1); // Reset page on clear filters
    };

    // --- PAGINATION LOGIC ---
    const indexOfLastRestaurant = currentPage * RESTAURANTS_PER_PAGE;
    const indexOfFirstRestaurant = indexOfLastRestaurant - RESTAURANTS_PER_PAGE;
    const currentRestaurants = filteredRestaurants.slice(indexOfFirstRestaurant, indexOfLastRestaurant);

    const totalPages = Math.ceil(filteredRestaurants.length / RESTAURANTS_PER_PAGE);

    const paginate = (pageNumber: number) => {
        if (pageNumber > 0 && pageNumber <= totalPages) {
            setCurrentPage(pageNumber);
            window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top on page change
        }
    };
    // --- END PAGINATION LOGIC ---

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
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {currentRestaurants.map(({ id, name, imageUrl, categories, rating }) => (
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

                        {/* --- NEW: Pagination Controls --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center mt-12 space-x-2">
                                <button
                                    onClick={() => paginate(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                                ${currentPage === 1 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    Previous
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => paginate(pageNumber)}
                                        className={`px-4 py-2 rounded-lg transition-all duration-200
                                                    ${currentPage === pageNumber ? 'bg-blue-700 text-white font-bold' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'}`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}

                                <button
                                    onClick={() => paginate(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className={`px-4 py-2 rounded-lg transition-all duration-200
                                                ${currentPage === totalPages ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {/* --- END NEW: Pagination Controls --- */}
                    </>
                )}
            </div>
        </HomeLayout>
    );
};

export default AllRestaurantsPage;
