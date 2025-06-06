import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import NotificationBell from '../components/NotificationsBell';

type Props = {
    children: ReactNode;
};

export default function HomeLayout({ children }: Props) {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate();

    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
    const userId = userInfo?.id || '';

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');

        if (userInfo) {
            const parsed = JSON.parse(userInfo);
            setFirstName(parsed.firstName || 'Usuario');
            setAvatarUrl(parsed.avatarUrl || 'https://i.pravatar.cc/150?u=valen');
        }
    }, []);

    const goHome = () => {
        navigate('/');
    };

    return (
        <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900">
            {/* Header */}
            <header className="w-full bg-white shadow-sm border-b py-4 px-6 md:px-12 flex items-center justify-between sticky top-0 z-50">
                {/* Left: Logo */}
                <div className="flex items-center space-x-3 cursor-pointer" onClick={goHome}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path d="M9 22V12h6v10" />
                    </svg>
                    <span className="text-2xl font-bold text-gray-800">DineDash</span>
                </div>

                {/* Center: Search */}
                <div className="hidden md:block w-1/3">
                    <input
                        type="text"
                        placeholder="Buscar restaurantes..."
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                </div>

                {/* Right: Notifications + Avatar */}
                <div className="flex items-center gap-4">
                    <NotificationBell userId={userId} />
                    <span className="hidden sm:inline-block font-medium text-gray-700">{firstName || 'user'}</span>
                    <Link to="/userConfiguration">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-300">
                            <img
                                src={avatarUrl || 'https://i.pravatar.cc/150?u=valen'}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>
            </header>

            {/* Page Content */}
            <main className="px-6 sm:px-8 md:px-16 py-10">{children}</main>
        </div>
    );
}
