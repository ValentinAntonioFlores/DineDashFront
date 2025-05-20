// src/pages/RestaurantCardLayout.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import GridLayout from '../components/GridLayout.tsx';
import { fetchPublicRestaurants } from "../utils/Api.ts";
import HomeLayout from './HomeHeaderLayout.tsx';
// DTO interfaces
interface TableDTO {
    id: string;
    capacity: number;
    positionX: number;
    positionY: number;
    available: boolean;
}

interface PublicRestaurantDTO {
    id: string;
    name: string;
    imageUrl: string;
    layout: TableDTO[];
}

const RestaurantCardLayout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [restaurant, setRestaurant] = useState<PublicRestaurantDTO | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const buildGrid = (
        tables: TableDTO[]
    ): { isTable: boolean; seats: number; reserved: boolean }[][] => {
        const ROWS = 10;
        const COLS = 10;

        const grid = Array.from({ length: ROWS }, () =>
            Array.from({ length: COLS }, () => ({
                isTable: false,
                seats: 0,
                reserved: false,
            }))
        );

        tables.forEach(t => {
            if (t.positionY >= 0 && t.positionY < ROWS &&
                t.positionX >= 0 && t.positionX < COLS) {
                grid[t.positionX][t.positionY] = {
                    isTable: true,
                    seats: t.capacity,
                    reserved: !t.available,
                };
            }
        });

        return grid;
    };

    useEffect(() => {
        if (!id) return;
        (async () => {
            try {
                const all = await fetchPublicRestaurants();
                const found = all.find(r => r.id === id);
                if (!found) throw new Error('Restaurant not found');
                setRestaurant(found);
            } catch (e: any) {
                console.error(e);
                setError(e.message || 'Unable to load restaurant');
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <HomeLayout><p className="p-6">Loading…</p></HomeLayout>;
    if (error) return <HomeLayout><p className="p-6 text-red-600">Error: {error}</p></HomeLayout>;
    if (!restaurant) return <HomeLayout><p className="p-6">No data found.</p></HomeLayout>;

    const gridData = buildGrid(restaurant.layout);

    return (
        <HomeLayout>
            <div className="space-y-4">
                <button
                    onClick={() => navigate(-1)}
                    className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                    ← Back
                </button>

                <h1 className="text-2xl font-bold">{restaurant.name}</h1>

                <h2 className="text-xl font-semibold mt-6">Choose your desired table:</h2>

                <GridLayout
                    grid={gridData}
                    readOnly={true}
                />
            </div>
        </HomeLayout>
    );
};

export default RestaurantCardLayout;
