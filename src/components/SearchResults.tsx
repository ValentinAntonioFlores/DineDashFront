import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchPublicRestaurants } from "../utils/Api";
import HomeLayout from "../layouts/HomeHeaderLayout";
const useQuery = () => new URLSearchParams(useLocation().search);

const SearchResults: React.FC = () => {
    const query = useQuery().get("query")?.toLowerCase() || "";
    const [restaurants, setRestaurants] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const allRestaurants = await fetchPublicRestaurants();
            const filtered = allRestaurants.filter((r) =>
                r.name.toLowerCase().includes(query)
            );
            setRestaurants(filtered);
        })();
    }, [query]);

    return (
        <HomeLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">
                    Resultados para: <span className="text-blue-600">"{query}"</span>
                </h1>

                {restaurants.length === 0 ? (
                    <div className="text-center mt-32 text-gray-500 text-lg">
                        😕 No se encontraron restaurantes que coincidan con tu búsqueda.
                    </div>
                ) : (
                    <div className="flex flex-col gap-6">
                        {restaurants.map(({ id, name, imageUrl }) => (
                            <div
                                key={id}
                                onClick={() => navigate(`/restaurant/${id}/layout`)}
                                className="flex flex-col md:flex-row gap-4 items-start p-4 bg-white rounded-2xl shadow hover:shadow-md transition cursor-pointer"
                            >
                                {/* Restaurant Image */}
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

                                {/* Restaurant Details */}
                                <div className="flex-1">
                                    <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Cocina: Internacional
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        ⭐ 4.5 · 120 reseñas
                                    </p>
                                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">
                                        Descubre una experiencia gastronómica única con platos artesanales
                                        preparados por chefs expertos. Ambiente acogedor y excelente
                                        servicio.
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

export default SearchResults;
