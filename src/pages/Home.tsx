import React, {useState, useEffect, useRef} from 'react';
import { useNavigate } from "react-router-dom";
import HomePageLayout from '../layouts/HomePageLayout';
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { fetchPublicRestaurants } from '../utils/Api.ts';
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

const Home: React.FC = () => {
    const navigate = useNavigate();

    const [restaurants, setRestaurants] = useState<
        { id: string; name: string; imageUrl?: string }[]
    >([]);

    useEffect(() => {
        (async () => {
            try {
                const data = await fetchPublicRestaurants();
                setRestaurants(
                    data.map(r => ({
                        id: r.id,
                        name: r.name,
                        imageUrl: r.imageUrl,
                    }))
                );
            } catch (error) {
                console.error("Failed to fetch public restaurants:", error);
            }
        })();
    }, []);

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

    const searchForm = (
        <form className="w-full max-w-xl mx-auto mt-6">
            <input
                type="text"
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
            <h2 className="text-2xl font-semibold mb-6">Recomendaciones para ti</h2>
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





    const section2 = (
        <>
            <h2 className="text-2xl font-semibold">Explora por categoría</h2>
            <div className="flex flex-wrap gap-4">
                {['Pizza', 'Sushi', 'Vegano', 'Parrilla'].map(cat => (
                    <span
                        key={cat}
                        className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm cursor-pointer hover:bg-blue-200"
                    >
                        {cat}
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
                footer={footer}
            />
        </HomeLayout>
    );
};

export default Home;
