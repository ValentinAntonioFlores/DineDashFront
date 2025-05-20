import React, { useState, useEffect } from 'react';
import HomeInput from '../components/HomeInput.tsx';
import CategoryCard from '../components/CategoryCardHome.tsx';
import MapCard from '../components/MapCardHome.tsx';
import HomePageLayout from '../layouts/HomePageLayout.tsx';
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { useNavigate } from "react-router-dom";
import {fetchPublicRestaurants} from "../utils/Api.ts";



interface HomeProps {
    buscarLocales: string;
}

interface SavedRestaurant {
    id: string;
    name: string;
    imageUrl: string;
}

const categoriesPopulares = ["Pizza", "Sushi", "Burgers", "Tacos", "Desserts"];

const HomeForm: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<HomeProps>({ buscarLocales: '' });
    const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);

    useEffect(() => {
        (async () => {
            try {
                // fetchPublicRestaurants returns PublicRestaurantDTO[]
                const data = await fetchPublicRestaurants();
                // map it directly into your component state
                setSavedRestaurants(data.map(r => ({
                    id: r.id,
                    name: r.name,
                    imageUrl: r.imageUrl
                })));
            } catch (error) {
                console.error("Failed to fetch public restaurants:", error);
            }
        })();
    }, []);

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

    const favoriteCategories = savedRestaurants.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
            {savedRestaurants.map(r => (
                <CategoryCard
                    key={r.id}
                    title={r.name}
                    imageUrl={r.imageUrl}
                    // navigate to the layout page route
                    onClick={() => navigate(`/restaurant/${r.id}/layout`)}
                />
            ))}
        </div>
    ) : (
        <p>No hay restaurantes favoritos para mostrar.</p>
    );


    const mapCard = (
        <MapCard
            key="map"
            title="Map"
            onClick={() => console.log("Clicked on map")}
        />
    );

    return (
        <HomeLayout>
            <HomePageLayout
                searchForm={searchForm}
                popularCategories={popularCategories}
                mapCard={mapCard}
                favoriteCategories={favoriteCategories}
            />
        </HomeLayout>
    );
};

export default HomeForm;