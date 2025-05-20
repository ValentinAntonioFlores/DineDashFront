// src/layouts/HomePageLayout.tsx
import React from 'react';
import { ReactNode } from 'react';


interface HomePageLayoutProps {
    searchForm: ReactNode;
    popularCategories: ReactNode;
    mapCard: ReactNode;
    favoriteCategories: ReactNode;
}

const HomePageLayout: React.FC<HomePageLayoutProps> = ({
                                                           searchForm,
                                                           popularCategories,
                                                           mapCard,
                                                           favoriteCategories,
                                                       }) => {
    return (

        <div className="px-6 py-4">
            {/* Search Form */}
            {searchForm}

            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold -translate-x-[1px]">Categorías populares</h2>
                <h2 className="text-2xl font-semibold -translate-x-[449px]">Map</h2>
            </div>

            {/* Category Cards and Map Card side by side */}
            <div className="flex flex-wrap gap-10">
                <div className="max-w-[60%]">{popularCategories}</div>
                {mapCard}
            </div>

            <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-semibold -translate-x-[1px]">Restaurantes Favoritos</h2>
            </div>

            <div className="flex flex-wrap gap-10">
                <div className="max-w-[60%]">{favoriteCategories}</div>
            </div>
        </div>
    );
};

export default HomePageLayout;
