import React, { useState, useEffect } from 'react';
import HomeInput from '../components/HomeInput';
import CategoryCard from '../components/CategoryCardHome';
import MapCard from '../components/MapCardHome';
import HomePageLayout from '../layouts/HomePageLayout';
import HomeLayout from '../layouts/HomeHeaderLayout';
import { useNavigate } from 'react-router-dom';
import { fetchPublicRestaurants } from '../utils/Api';

interface HomeProps {
    buscarLocales: string;
}

interface SavedRestaurant {
    id: string;
    name: string;
    imageUrl: string;
}

const HomeForm: React.FC = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState<HomeProps>({ buscarLocales: '' });
    const [savedRestaurants, setSavedRestaurants] = useState<SavedRestaurant[]>([]);

    useEffect(() => {
        const loadRestaurants = async () => {
            try {
                const data = await fetchPublicRestaurants();
                console.log("Fetched restaurant data:", data); // Inspect this!

                if (Array.isArray(data)) {
                    setSavedRestaurants(data);
                } else if (data && Array.isArray(data.restaurants)) {
                    setSavedRestaurants(data.restaurants);
                } else {
                    console.error("Unexpected data shape:", data);
                    setSavedRestaurants([]);
                }
            } catch (error) {
                console.error("Failed to fetch restaurants:", error);
            }
        };

        loadRestaurants();
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
            {/* TODO: Dynamically fetch categories if needed */}
            {['Pizza', 'Sushi', 'Burgers', 'Tacos', 'Desserts'].map(category => (
                <CategoryCard key={category} title={category} onClick={() => console.log(category)} />
            ))}
        </div>
    );

    const mapCard = (
        <MapCard key="map" title="Map" onClick={() => console.log('Clicked on map')} />
    );

    const favoriteCategories =
        savedRestaurants.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-10">
                {savedRestaurants.map(r => (
                    <CategoryCard
                        key={r.id}
                        title={r.name}
                        imageUrl={r.imageUrl}
                        onClick={() => navigate(`/restaurant/${r.id}/layout`)}
                    />
                ))}
            </div>
        ) : (
            <p>No hay restaurantes favoritos para mostrar.</p>
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
