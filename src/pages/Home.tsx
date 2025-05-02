import React, { useState, useEffect } from 'react';
import HomeInput from '../components/HomeInput.tsx';
import CategoryCard from '../components/CategoryCardHome.tsx';
import MapCard from '../components/MapCardHome.tsx';
import HomePageLayout from '../layouts/HomePageLayout.tsx';
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { fetchRestaurants } from "../utils/RestaurantApi.ts";
import { useNavigate } from "react-router-dom";



interface HomeProps {
    buscarLocales: string;
}

interface SavedRestaurant {
    id: string;
    name: string;
    image: string | null;
}

const categoriesPopulares = ["Pizza", "Sushi", "Burgers", "Tacos", "Desserts"];
const categoriesFavoritos = ["Fav1", "Fav2", "Fav3", "Fav4", "Fav5"];

const HomeForm: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<HomeProps>({
        buscarLocales: '',
    });

    const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]); // ✅

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const data = await fetchRestaurants();
                setSavedRestaurants(data);
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };

        loadRestaurants();
    }, []); // ✅ load once on mount

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log(formData);
    };

    const searchForm = (
        <form onSubmit={handleSubmit}>
            <HomeInput
                label="Buscar Locales"
                name="buscarLocales"
                type="text"
                value={formData.buscarLocales}
                onChange={handleChange}
            />
        </form>
    );

    const popularCategories = (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {categoriesPopulares.map((category) => (
                <CategoryCard
                    key={category}
                    title={category}
                    onClick={() => console.log(`Clicked on ${category}`)}
                />
            ))}
        </div>
    );

    const favoriteCategories = (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {categoriesFavoritos.map((category) => (
                <CategoryCard
                    key={category}
                    title={category}
                    onClick={() => console.log(`Clicked on ${category}`)}
                />
            ))}
        </div>
    );

    const mapCard = (
        <MapCard
            key="map"
            title="Map"
            onClick={() => console.log("Clicked on map")}
        />
    );

    const savedRestaurantCards = savedRestaurants.length > 0 && (
         <div className="mt-10">
             <h2 className="text-xl font-bold mb-4">Nuevos Restaurantes</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
                 {savedRestaurants.map((restaurant, index) => (
                     <CategoryCard
                         key={index}
                         title={restaurant.name}
                         imageUrl={restaurant.image ?? undefined}
                         onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                     />
                 ))}
             </div>
         </div>
     );

    return (
        <HomeLayout>
            <HomePageLayout
                searchForm={searchForm}
                popularCategories={popularCategories}
                mapCard={mapCard}
                favoriteCategories={
                    <>
                        {favoriteCategories}
                        { {savedRestaurantCards} }
                    </>
                }
            />
        </HomeLayout>
    );
};

export default HomeForm;
