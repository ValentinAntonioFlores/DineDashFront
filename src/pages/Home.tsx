import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import HomePageLayout from '../layouts/HomePageLayout';
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { fetchPublicRestaurants, fetchUserFavoritesForHome, fetchCategories } from '../utils/Api.ts';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { useAuth } from '../hooks/useAuth.tsx';
import { ArrowRight } from "lucide-react";
import UserLocationView from "../components/UserLocationView.tsx";


const Home: React.FC = () => {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<
        { id: string; name: string; imageUrl?: string }[]
    >([]);

    const [favoriteRestaurants, setFavoriteRestaurants] = useState<
        { id: string; name: string; imageUrl?: string }[]
    >([]);

    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    const { userData } = useAuth();


    useEffect(() => {
        (async () => {
            try {
                const publicData = await fetchPublicRestaurants();
                setRestaurants(
                    publicData.map(r => ({
                        id: r.id,
                        name: r.name,
                        imageUrl: r.imageUrl,
                    }))
                );

                const fetchedCategories = await fetchCategories();
                setCategories(fetchedCategories);

                if (!userData?.id) return;

                const favoriteIds = await fetchUserFavoritesForHome(userData.id);
                const favorites = publicData.filter(r => favoriteIds.includes(r.id));
                setFavoriteRestaurants(
                    favorites.map(r => ({
                        id: r.id,
                        name: r.name,
                        imageUrl: r.imageUrl,
                    }))
                );
            } catch (error) {
                console.error("Error fetching restaurants, favorites or categories:", error);
            }
        })();
    }, [userData]);


    const uniqueCategories = categories.filter(
        (cat, index, self) =>
            index === self.findIndex(c => c.name.toLowerCase() === cat.name.toLowerCase())
    );

    const heroContent = (
        <>
            <h1 className="text-4xl sm:text-5xl font-bold leading-tight">
                Encuentra tu próximo restaurante favorito 🍽️
            </h1>
            <p className="text-lg text-gray-600 max-w-xl mx-auto">
                Busca entre cientos de opciones locales y reserva tu mesa en segundos.
            </p>

        </>
    );

    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/restaurants?query=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const sectionMap = (
        <div>
            <UserLocationView />
        </div>
    );

    const searchForm = (
        <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl mx-auto mt-6"
        >
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar restaurantes..."
                className="w-full px-5 py-3 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </form>

    );


    // --- swipe logic ---
    const scrollRef = useRef<HTMLDivElement | null>(null);
    let touchStartX = 0;

    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        // prevent unwanted vertical scrolling during swipe
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
            <div
                onClick={() => navigate("/restaurants")}
                className="w-fit px-6 py-4 bg-white shadow-md hover:shadow-lg rounded-2xl border border-gray-200 cursor-pointer transition-all duration-300 flex items-center gap-3 group"
            >
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-primary">
                    Todos los Restaurantes
                </h2>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-primary transition-transform group-hover:translate-x-1" />
            </div>
            <div className="relative">
                {/* Left Arrow */}
                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
                >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
                </button>

                {/* Right Arrow */}
                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-md rounded-full p-2 hover:bg-gray-100"
                >
                    <ChevronRightIcon className="w-6 h-6 text-gray-700" />
                </button>

                {/* Scrollable Grid */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-6 scrollbar-hide snap-x snap-mandatory scroll-smooth px-1"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {restaurants.map(({ id, name, imageUrl }) => (
                        <div
                            key={id}
                            onClick={() => navigate(`/restaurant/${id}/layout`)}
                            className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-start rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-xl transform hover:scale-[1.03] transition-all cursor-pointer flex flex-col overflow-hidden"
                        >
                            {imageUrl ? (
                                <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                                    <img
                                        src={imageUrl.startsWith("data:") ? imageUrl : `data:image/jpeg;base64,${imageUrl}`}
                                        alt={name}
                                        className="object-cover w-full h-full transition-opacity duration-500 ease-in-out opacity-90 hover:opacity-100"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
                                </div>
                            ) : (
                                <div className="rounded-t-xl bg-gray-100 h-48 flex items-center justify-center text-gray-400 select-none">
                                    No Image
                                </div>
                            )}
                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="text-xl font-semibold mb-1 truncate">{name}</h3>
                                <div className="flex flex-wrap gap-2 mb-3">
                <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-1 rounded-full select-none">
                  Popular
                </span>
                                    <span className="text-xs font-medium bg-green-100 text-green-700 px-2 py-1 rounded-full select-none">
                  Cerca de ti
                </span>
                                </div>
                                <p className="text-gray-600 text-sm flex-grow">
                                    Disfruta de una experiencia gastronómica única y deliciosa.
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
    const sectionFavorites = favoriteRestaurants.length > 0 && (
        <>
            <h2 className="text-2xl font-semibold mb-6 mt-12"> Favorite Restaurants </h2>
            <div className="flex overflow-x-auto space-x-6 scrollbar-hide snap-x snap-mandatory scroll-smooth px-1">
                {favoriteRestaurants.map(({ id, name, imageUrl }) => (
                    <div
                        key={id}
                        onClick={() => navigate(`/restaurant/${id}/layout`)}
                        className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-start rounded-xl bg-white border border-gray-200 shadow-md hover:shadow-xl transform hover:scale-[1.03] transition-all cursor-pointer flex flex-col overflow-hidden"
                    >
                        {imageUrl ? (
                            <div className="relative w-full h-48 overflow-hidden rounded-t-xl">
                                <img
                                    src={imageUrl.startsWith("data:") ? imageUrl : `data:image/jpeg;base64,${imageUrl}`}
                                    alt={name}
                                    className="object-cover w-full h-full transition-opacity duration-500 ease-in-out opacity-90 hover:opacity-100"
                                    loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50" />
                            </div>
                        ) : (
                            <div className="rounded-t-xl bg-gray-100 h-48 flex items-center justify-center text-gray-400 select-none">
                                No Image
                            </div>
                        )}
                        <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-xl font-semibold mb-1 truncate">{name}</h3>
                            <p className="text-gray-600 text-sm flex-grow">
                                Disfruta de una experiencia gastronómica única y deliciosa.
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );




    const section2 = (
        <>
            <h2 className="text-2xl font-semibold mb-4">Explora por categoría</h2>
            <div className="flex flex-wrap gap-3">
                {uniqueCategories.map(({ id, name }) => (
                    <span
                        key={id}
                        onClick={() => navigate(`/restaurants?category=${encodeURIComponent(name)}`)}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200 transition"
                    >
                {name}
            </span>
                ))}
            </div>
        </>
    );


    const footer = (
        <p>© {new Date().getFullYear()} TuApp. Todos los derechos reservados.</p>
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
