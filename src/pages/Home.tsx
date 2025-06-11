import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from "react-router-dom";
import HomePageLayout from '../layouts/HomePageLayout'; // Assuming this wraps the content
import HomeLayout from "../layouts/HomeHeaderLayout.tsx"; // Assuming this is the main header
import { fetchPublicRestaurants, fetchUserFavoritesForHome, fetchCategories } from '../utils/Api.ts';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid"; // Added MagnifyingGlassIcon
import { useAuth } from '../hooks/useAuth.tsx';
import { ArrowRight, UtensilsCrossed, Star } from "lucide-react";
import UserLocationView from "../components/UserLocationView.tsx"; // Added UtensilsCrossed, Star icons

type Restaurant = {
    id: string;
    name: string;
    imageUrl?: string;
    categories: string[]; // Add categories to restaurant type
    rating?: number; // Add rating
};

// Placeholder image URL for restaurants without an image
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/300x200/E5E7EB/6B7280?text=No+Image";


const Home: React.FC = () => {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const { userData } = useAuth();

    useEffect(() => {
        (async () => {
            try {
                const publicData = await fetchPublicRestaurants();
                const fetchedCategories = await fetchCategories();

                const categoryMap = new Map<string, string[]>();
                fetchedCategories.forEach(cat => {
                    if (!categoryMap.has(cat.restaurantId)) categoryMap.set(cat.restaurantId, []);
                    categoryMap.get(cat.restaurantId)!.push(cat.name);
                });

                const enrichedRestaurants = publicData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    imageUrl: r.imageUrl,
                    categories: categoryMap.get(r.id) || [], // Ensure categories are loaded
                    rating: r.averageRating // Assuming averageRating is available
                }));


                setRestaurants(enrichedRestaurants);
                setCategories(fetchedCategories);

                if (userData?.id) {
                    const favoriteIds = await fetchUserFavoritesForHome(userData.id);
                    const favorites = enrichedRestaurants.filter(r => favoriteIds.includes(r.id));
                    setFavoriteRestaurants(favorites);
                }
            } catch (error) {
                console.error("Error fetching data for homepage:", error);
            }
        })();
    }, [userData]);


    const uniqueCategories = categories.filter(
        (cat, index, self) =>
            index === self.findIndex(c => c.name.toLowerCase() === cat.name.toLowerCase())
    );

    const heroContent = (
        <div className="py-16 text-center"> {/* Added vertical padding */}
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tightest text-gray-900 tracking-tightest mb-4">
                Encuentra tu próximo restaurante favorito 🍽️
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
                Busca entre cientos de opciones locales y reserva tu mesa en segundos.
            </p>
        </div>
    );

    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/restaurants?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const sectionMap = (
        <div className="bg-gradient-to-br from-gray-100 to-white rounded-3xl shadow-xl p-8 mb-16 text-center"> {/* Enhanced container */}
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
                <UtensilsCrossed className="w-8 h-8 text-blue-600" /> {/* Icon for map section */}
                Explora Restaurantes Cerca de Ti
            </h2>
            <UserLocationView /> {/* Assuming this component displays the map */}
        </div>
    );

    const searchForm = (
        <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl mx-auto mt-8 relative" // Added relative for icon positioning
        >
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar restaurantes..."
                className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-3 focus:ring-blue-400 text-lg pl-12 transition-all duration-200" // Larger, rounded, better focus, padding for icon
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" /> {/* Search icon */}
        </form>
    );

    const RestaurantCard = ({ id, name, imageUrl, categories, rating }: Restaurant) => (
        <div
            key={id}
            onClick={() => navigate(`/restaurant/${id}/layout`)}
            // Reverted dimensions to min-w-[300px] max-w-[300px]
            className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-start rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden group"
        >
            {imageUrl ? (
                // Reverted image height to h-48
                <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                    <img
                        src={imageUrl.startsWith("data:") ? imageUrl : `data:image/jpeg;base64,${imageUrl}`}
                        alt={name}
                        className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105" // Image zoom on hover
                        loading="lazy"
                        onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE_URL; }} // Fallback for image
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /> {/* Darker gradient */}
                </div>
            ) : (
                // Reverted "No Image" placeholder height to h-48
                <div className="rounded-t-2xl bg-gray-100 h-48 flex items-center justify-center text-gray-400 text-sm italic select-none">
                    No Image
                </div>
            )}
            {/* Reverted padding to p-5 */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-2 truncate text-gray-900">{name}</h3> {/* Larger name, darker text */}
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {categories.slice(0, 3).map((cat, index) => ( // Show max 3 categories
                            <span key={index} className="flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                <UtensilsCrossed className="w-3 h-3 mr-1" /> {cat} {/* Icon for categories */}
                            </span>
                        ))}
                    </div>
                )}
                {rating !== undefined && (
                    <p className="text-md text-gray-700 mb-3 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" /> {rating.toFixed(1)} <span className="text-gray-500 ml-1">Calificación</span>
                    </p>
                )}
                <p className="text-gray-700 text-base flex-grow leading-relaxed"> {/* Slightly larger description */}
                    Disfruta de una experiencia gastronómica única y deliciosa en {name}.
                </p>
                <div className="mt-4 text-right">
                    <span className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                        Ver detalles <ArrowRight className="w-4 h-4 ml-2" />
                    </span>
                </div>
            </div>
        </div>
    );


    const scrollRef = useRef<HTMLDivElement | null>(null);
    let touchStartX = 0;

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const dx = e.touches[0].clientX - touchStartX;
        if (Math.abs(dx) > 10) e.preventDefault();
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const touchEndX = e.changedTouches[0].clientX;
        const dx = touchEndX - touchStartX;
        const container = scrollRef.current;

        if (!container) return;

        if (dx > 50) {
            container.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
        } else if (dx < -50) {
            container.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
        }
    };


    const section1 = (
        <>
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800">Todos los Restaurantes</h2>
                <div
                    onClick={() => navigate("/restaurants")}
                    className="w-fit px-5 py-2.5 bg-blue-600 text-white shadow-md hover:shadow-lg rounded-full border border-blue-600 cursor-pointer transition-all duration-300 flex items-center gap-2 group text-lg font-semibold"
                >
                    Ver Todos
                    <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-gray-100/90 transition-all duration-200 border border-gray-200"
                >
                    <ChevronLeftIcon className="w-7 h-7 text-gray-700" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-gray-100/90 transition-all duration-200 border border-gray-200"
                >
                    <ChevronRightIcon className="w-7 h-7 text-gray-700" />
                </button>

                {/* Scrollable Grid */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 py-4" // Increased padding
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {restaurants.map(r => (
                        <RestaurantCard key={r.id} {...r} />
                    ))}
                </div>
            </div>
        </>
    );

    const sectionFavorites = favoriteRestaurants.length > 0 && (
        <>
            <h2 className="text-3xl font-bold mb-8 mt-16 text-gray-800">Tus Restaurantes Favoritos</h2> {/* Stronger heading */}
            <div className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 py-4"> {/* Consistent spacing */}
                {favoriteRestaurants.map(r => (
                    <RestaurantCard key={r.id} {...r} />
                ))}
            </div>
        </>
    );

    const section2 = (
        <>
            <h2 className="text-3xl font-bold mb-8 mt-16 text-gray-800">Explora por Categoría</h2> {/* Stronger heading */}
            <div className="flex flex-wrap gap-4 justify-center"> {/* Increased gap, centered flex-wrap */}
                {uniqueCategories.map(({ id, name }) => (
                    <span
                        key={id}
                        onClick={() => navigate(`/restaurants?category=${encodeURIComponent(name)}`)}
                        className="flex items-center px-6 py-3 bg-blue-50 text-blue-800 rounded-full text-lg font-semibold cursor-pointer hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md" // Larger, bolder, more prominent
                    >
                        <UtensilsCrossed className="w-5 h-5 mr-2" /> {/* Category icon */}
                        {name}
                    </span>
                ))}
            </div>
        </>
    );

    const footer = (
        <p className="text-center text-gray-600 text-sm py-8 mt-20 border-t border-gray-200">
            © {new Date().getFullYear()} DineDash. Todos los derechos reservados.
        </p>
    );

    return (
        <HomeLayout>
            <HomePageLayout
                heroContent={heroContent}
                searchForm={searchForm}
                section1={section1}
                section2={section2}
                sectionFavorites={sectionFavorites}
                sectionMap={sectionMap}
                footer={footer}
            />
        </HomeLayout>
    );
};

export default Home;
