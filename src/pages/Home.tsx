// Updated Home.tsx component with fixed backup email popup logic
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from "react-router-dom";
import HomePageLayout from '../layouts/HomePageLayout';
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { fetchPublicRestaurants, fetchUserFavoritesForHome, fetchCategories, updateBackupEmail, getBackupEmail } from '../utils/Api.ts';
import { ChevronLeftIcon, ChevronRightIcon, MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { useAuth } from '../hooks/useAuth.tsx';
import { ArrowRight, UtensilsCrossed, Star } from "lucide-react";
import UserLocationView from "../components/UserLocationView.tsx";
import BackupEmailPopup from "../components/BackUpEmailPopUP.tsx";

type Restaurant = {
    id: string;
    name: string;
    imageUrl?: string;
    categories: string[];
    rating?: number;
};

type Category = {
    id: string;
    name: string;
    restaurantId: string;
};

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/300x200/E5E7EB/6B7280?text=No+Image";

const Home: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [favoriteRestaurants, setFavoriteRestaurants] = useState<Restaurant[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showBackupEmailPopup, setShowBackupEmailPopup] = useState(false);
    const [backupEmailData, setBackupEmailData] = useState<{backupEmail?: string, isVerified?: boolean} | null>(null);
    const [isLoadingBackupEmail, setIsLoadingBackupEmail] = useState(false);

    // Get auth data at component level
    const { userData, updateUser, signOut } = useAuth();

    // Function to refresh backup email data
    const refreshBackupEmailData = async (userId: string, force: boolean = false) => {
        // Prevent multiple simultaneous requests
        if (isLoadingBackupEmail && !force) {
            console.log('Already loading backup email data, skipping...');
            return;
        }

        try {
            setIsLoadingBackupEmail(true);
            const token = getAuthToken();
            if (!token) {
                console.log('No token available for refreshing backup email data');
                return;
            }

            console.log('Refreshing backup email data for user:', userId, force ? '(forced)' : '');
            const result = await getBackupEmail(userId, token);
            console.log('Refreshed backup email data:', result);

            // Ensure we have the correct structure
            const emailData = {
                backupEmail: result.backupEmail || result.backUpEmail || null, // Handle both field names
                isVerified: result.isVerified || false
            };

            setBackupEmailData(emailData);

            // If email is now verified, immediately hide popup
            if (emailData.backupEmail && emailData.isVerified) {
                console.log('Email is verified, hiding popup');
                setShowBackupEmailPopup(false);
            }

        } catch (error) {
            console.error('Error refreshing backup email data:', error);
            // Set empty state on error
            setBackupEmailData({ backupEmail: null, isVerified: false });
        } finally {
            setIsLoadingBackupEmail(false);
        }
    };

    // Handle email verification success from URL params
    useEffect(() => {
        const emailVerified = searchParams.get('emailVerified');
        const userId = searchParams.get('userId');

        if (emailVerified === 'true' && userId && userData?.id === userId) {
            console.log('Email verification success detected from URL');

            // Show success message
            alert('🎉 Your backup email has been verified successfully!');

            // Force refresh the backup email data with a slight delay
            setTimeout(() => {
                refreshBackupEmailData(userData.id, true);
            }, 500);

            // Clear URL params
            navigate('/', { replace: true });

        } else if (emailVerified === 'false') {
            const error = searchParams.get('error');
            let errorMessage = 'Email verification failed.';

            switch (error) {
                case 'tokenExpired':
                    errorMessage = 'Verification link has expired. Please request a new one.';
                    break;
                case 'invalidToken':
                    errorMessage = 'Invalid verification link. Please check your email for the correct link.';
                    break;
                case 'userNotFound':
                    errorMessage = 'User not found. Please try logging in again.';
                    break;
                case 'serverError':
                    errorMessage = 'Server error during verification. Please try again later.';
                    break;
            }

            alert('❌ ' + errorMessage);
            navigate('/', { replace: true });
        }
    }, [searchParams, userData, navigate]);

    // Initial data load
    useEffect(() => {
        (async () => {
            try {
                const publicData = await fetchPublicRestaurants();
                const fetchedCategories: Category[] = await fetchCategories();

                const categoryMap = new Map<string, string[]>();
                fetchedCategories.forEach(cat => {
                    if (!categoryMap.has(cat.restaurantId)) categoryMap.set(cat.restaurantId, []);
                    categoryMap.get(cat.restaurantId)!.push(cat.name);
                });

                const enrichedRestaurants = publicData.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    imageUrl: r.imageUrl,
                    categories: categoryMap.get(r.id) || [],
                    rating: r.averageRating
                }));

                setRestaurants(enrichedRestaurants);
                setCategories(fetchedCategories);

                if (userData?.id) {
                    const favoriteIds = await fetchUserFavoritesForHome(userData.id);
                    const favorites = enrichedRestaurants.filter(r => favoriteIds.includes(r.id));
                    setFavoriteRestaurants(favorites);

                    // Fetch backup email data
                    await refreshBackupEmailData(userData.id);
                }
            } catch (error) {
                console.error("Error fetching data for homepage:", error);
            }
        })();
    }, [userData]);

    // FIXED: Enhanced logic for showing backup email popup
    useEffect(() => {
        // Don't show popup while loading or if no user data
        if (!userData?.id || isLoadingBackupEmail || backupEmailData === null) {
            console.log('Not showing popup:', {
                hasUser: !!userData?.id,
                isLoading: isLoadingBackupEmail,
                dataIsNull: backupEmailData === null
            });
            return;
        }

        console.log('Checking popup conditions:', {
            userData: userData,
            backupEmailData: backupEmailData,
            hasBackupEmail: !!backupEmailData.backupEmail,
            isVerified: backupEmailData.isVerified
        });

        // Show popup if:
        // 1. User doesn't have backup email at all, OR
        // 2. User has backup email but it's not verified
        const shouldShowPopup = !backupEmailData.backupEmail ||
            (backupEmailData.backupEmail && !backupEmailData.isVerified);

        console.log('Should show popup:', shouldShowPopup);
        setShowBackupEmailPopup(shouldShowPopup);

    }, [userData, backupEmailData, isLoadingBackupEmail]);

    // Enhanced token retrieval utility
    const getAuthToken = (): string | null => {
        console.log("=== COMPREHENSIVE TOKEN SEARCH ===");

        // Strategy 1: Common localStorage keys
        const commonKeys = ['token', 'authToken', 'jwt', 'accessToken', 'auth_token', 'bearerToken'];
        for (const key of commonKeys) {
            const token = localStorage.getItem(key);
            if (token) {
                console.log(`✅ Found token in localStorage["${key}"]`);
                return token;
            }
        }

        // Strategy 2: SessionStorage
        for (const key of commonKeys) {
            const token = sessionStorage.getItem(key);
            if (token) {
                console.log(`✅ Found token in sessionStorage["${key}"]`);
                return token;
            }
        }

        // Strategy 3: Check userData object
        if (userData) {
            const userDataWithToken = userData as any;
            if (userDataWithToken.token) {
                console.log(`✅ Found token in userData.token`);
                return userDataWithToken.token;
            }
            if (userDataWithToken.authToken) {
                console.log(`✅ Found token in userData.authToken`);
                return userDataWithToken.authToken;
            }
        }

        // Strategy 4: Scan all localStorage for JWT-like strings
        try {
            console.log("Scanning all localStorage items for JWT patterns...");
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key);
                    if (value && value.startsWith('eyJ') && value.split('.').length === 3) {
                        console.log(`✅ Found JWT-like token in localStorage["${key}"]`);
                        return value;
                    }
                }
            }
        } catch (e) {
            console.log("Error scanning localStorage:", e);
        }

        // Strategy 5: User-specific keys
        if (userData?.id) {
            const userKeys = [
                `token_${userData.id}`,
                `user_${userData.id}_token`,
                `auth_${userData.id}`
            ];
            for (const key of userKeys) {
                const token = localStorage.getItem(key) || sessionStorage.getItem(key);
                if (token) {
                    console.log(`✅ Found user-specific token: ${key}`);
                    return token;
                }
            }
        }

        console.log("❌ No token found in any location");
        return null;
    };

    // Fixed handleBackupEmailSubmit
    const handleBackupEmailSubmit = async (email: string) => {
        try {
            console.log("=== BACKUP EMAIL SUBMIT ===");
            console.log("Email:", email);
            console.log("User ID:", userData?.id);

            const token = getAuthToken();
            if (!token) {
                console.error("❌ NO TOKEN FOUND");
                throw new Error("Authentication token not found. Please log in again.");
            }

            if (!userData?.id) {
                console.error("❌ NO USER ID FOUND");
                throw new Error("User information not available");
            }

            console.log("=== MAKING API CALL ===");
            const result = await updateBackupEmail(userData.id, email, token);
            console.log("✅ API call successful:", result);

            // Update local backup email data immediately
            setBackupEmailData({
                backupEmail: email,
                isVerified: false // Will be false until user clicks verification link
            });

            // Show success message
            alert(
                `✅ Backup email updated successfully!\n\n` +
                `We've sent a verification link to ${email}. ` +
                `Please check your inbox and click the link to verify your backup email.\n\n` +
                `You can continue using the app, but remember to verify your email for full security.`
            );

            // Keep popup open since email is unverified - it will auto-close when verified
            // setShowBackupEmailPopup(false); // Remove this line

        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error("❌ Backup email update error:", error);
            alert(`Failed to update backup email: ${errorMessage}`);
        }
    };

    // Handler for closing popup
    const handleClosePopup = () => {
        if (backupEmailData?.backupEmail && !backupEmailData.isVerified) {
            // User has unverified email - just remind them
            const shouldClose = window.confirm(
                "Your backup email is set but not yet verified. " +
                "Please check your email and click the verification link. " +
                "You can continue using the app for now.\n\n" +
                "Continue without verifying now?"
            );
            if (shouldClose) {
                setShowBackupEmailPopup(false);
            }
        } else {
            // User has no backup email - show stronger warning
            const shouldClose = window.confirm(
                "Are you sure you want to skip adding a backup email? " +
                "This email will be used for account recovery and important notifications.\n\n" +
                "Continue without backup email?"
            );
            if (shouldClose) {
                setShowBackupEmailPopup(false);
            }
        }
    };

    // Rest of your component code remains the same...
    // [Include all the other functions and JSX as they were]

    // Generate unique categories for display
    const uniqueCategories = categories.filter(
        (cat, index, self) =>
            index === self.findIndex(c => c.name.toLowerCase() === cat.name.toLowerCase())
    ).map(cat => ({ id: cat.id, name: cat.name }));

    const heroContent = (
        <div className="py-16 text-center">
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
        <div className="bg-gradient-to-br from-gray-100 to-white rounded-3xl shadow-xl p-8 mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center justify-center gap-2">
                <UtensilsCrossed className="w-8 h-8 text-blue-600" />
                Explora Restaurantes Cerca de Ti
            </h2>
            <UserLocationView />
        </div>
    );

    const searchForm = (
        <form
            onSubmit={handleSearchSubmit}
            className="w-full max-w-xl mx-auto mt-8 relative"
        >
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar restaurantes..."
                className="w-full px-6 py-4 rounded-full border border-gray-300 shadow-md focus:outline-none focus:ring-3 focus:ring-blue-400 text-lg pl-12 transition-all duration-200"
            />
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
        </form>
    );

    const RestaurantCard = ({ id, name, imageUrl, categories, rating }: Restaurant) => (
        <div
            key={id}
            onClick={() => navigate(`/restaurant/${id}/layout`)}
            className="min-w-[300px] max-w-[300px] flex-shrink-0 snap-start rounded-2xl bg-white border border-gray-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden group"
        >
            {imageUrl ? (
                <div className="relative w-full h-48 overflow-hidden rounded-t-2xl">
                    <img
                        src={imageUrl.startsWith("data:") ? imageUrl : `data:image/jpeg;base64,${imageUrl}`}
                        alt={name}
                        className="object-cover w-full h-full transition-transform duration-500 ease-in-out group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE_URL; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>
            ) : (
                <div className="rounded-t-2xl bg-gray-100 h-48 flex items-center justify-center text-gray-400 text-sm italic select-none">
                    No Image
                </div>
            )}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="text-2xl font-bold mb-2 truncate text-gray-900">{name}</h3>
                {categories.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {categories.slice(0, 3).map((cat, index) => (
                            <span key={index} className="flex items-center bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200">
                                <UtensilsCrossed className="w-3 h-3 mr-1" /> {cat}
                            </span>
                        ))}
                    </div>
                )}
                {rating !== undefined && (
                    <p className="text-md text-gray-700 mb-3 flex items-center">
                        <Star className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" /> {rating.toFixed(1)} <span className="text-gray-500 ml-1">Calificación</span>
                    </p>
                )}
                <p className="text-gray-700 text-base flex-grow leading-relaxed">
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
                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: -container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-gray-100/90 transition-all duration-200 border border-gray-200"
                >
                    <ChevronLeftIcon className="w-7 h-7 text-gray-700" />
                </button>

                <button
                    onClick={() => {
                        const container = scrollRef.current;
                        container?.scrollBy({ left: container.offsetWidth, behavior: "smooth" });
                    }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/80 backdrop-blur-sm shadow-lg rounded-full p-3 hover:bg-gray-100/90 transition-all duration-200 border border-gray-200"
                >
                    <ChevronRightIcon className="w-7 h-7 text-gray-700" />
                </button>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 py-4"
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
            <h2 className="text-3xl font-bold mb-8 mt-16 text-gray-800">Tus Restaurantes Favoritos</h2>
            <div className="flex overflow-x-auto space-x-8 scrollbar-hide snap-x snap-mandatory scroll-smooth px-2 py-4">
                {favoriteRestaurants.map(r => (
                    <RestaurantCard key={r.id} {...r} />
                ))}
            </div>
        </>
    );

    const section2 = (
        <>
            <h2 className="text-3xl font-bold mb-8 mt-16 text-gray-800">Explora por Categoría</h2>
            <div className="flex flex-wrap gap-4 justify-center">
                {uniqueCategories.map(({ id, name }) => (
                    <span
                        key={id}
                        onClick={() => navigate(`/restaurants?category=${encodeURIComponent(name)}`)}
                        className="flex items-center px-6 py-3 bg-blue-50 text-blue-800 rounded-full text-lg font-semibold cursor-pointer hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                        <UtensilsCrossed className="w-5 h-5 mr-2" />
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
            {/* Enhanced backup email popup with proper state management */}
            {showBackupEmailPopup && !isLoadingBackupEmail && (
                <BackupEmailPopup
                    isOpen={showBackupEmailPopup}
                    onClose={handleClosePopup}
                    onSubmit={handleBackupEmailSubmit}
                    currentBackupEmail={backupEmailData?.backupEmail}
                    isVerified={backupEmailData?.isVerified || false}
                />
            )}
        </HomeLayout>
    );
};

export default Home;