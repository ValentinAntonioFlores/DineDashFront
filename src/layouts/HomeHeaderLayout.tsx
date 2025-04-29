import { ReactNode, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom'; // Import Link component

type Props = {
    children: ReactNode;
};

export default function HomeLayout({ children }: Props) {
    const [firstName, setFirstName] = useState<string | null>(null);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const navigate = useNavigate(); // Initialize the navigate function

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        console.log("Retrieved user info:", userInfo);  // Debugging line

        if (userInfo) {
            const parsedUserInfo = JSON.parse(userInfo);
            console.log("Parsed user info:", parsedUserInfo);  // Debugging line

            setFirstName(parsedUserInfo.firstName);  // Assuming 'firstName' is a property in the user info
            setAvatarUrl(parsedUserInfo.avatarUrl || 'https://i.pravatar.cc/150?u=valen');  // Fallback avatar if none is provided
        }
    }, []);

    // Function to navigate back to the home page
    const goHome = () => {
        navigate('/'); // Navigates to the home page
    };

    return (
        <div className="w-full min-h-screen bg-gray-100">
            {/* Header */}
            <div className="w-full bg-white shadow-md h-20 flex items-center justify-between px-6 relative">
                {/* Home button (House icon) */}
                <button
                    onClick={goHome}
                    className="absolute left-6 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-gray-100 hover:bg-gray-200">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="black" // Change stroke color to black
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-6 h-6">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path>
                        <path d="M9 22V12h6v10"></path>
                    </svg>
                </button>

                {/* Search bar centered in the layout */}
                <div className="absolute left-1/2 transform -translate-x-1/2">
                    <input
                        type="text"
                        placeholder="Buscar Locales"
                        className="px-4 py-2 bg-gray-100 rounded w-[400px]"
                    />
                </div>

                {/* Avatar on the right */}
                <div className="flex items-center ml-auto space-x-4">
                    <span className="text-gray-700 font-medium">{firstName || 'user'}</span>
                    {/* Wrap avatar image in Link to redirect to /conf */}
                    <Link to="/conf">
                        <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-gray-400 cursor-pointer">
                            <img
                                src={avatarUrl || 'https://i.pravatar.cc/150?u=valen'} // Use the avatar URL from localStorage
                                alt="Profile"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Page content */}
            <main className="px-6 py-4">{children}</main>
        </div>
    );
}
