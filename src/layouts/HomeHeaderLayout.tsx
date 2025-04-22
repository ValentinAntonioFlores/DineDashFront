import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
};

export default function HomeLayout({ children }: Props) {
    return (
        <div className="w-full min-h-screen bg-gray-100">
            {/* Header */}
            <div className="w-full bg-white shadow-md h-20 flex items-center justify-between px-6 relative">
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
                    <span className="text-gray-700 font-medium">Valen</span>
                    <div className="w-10 h-10 rounded-full bg-gray-300 overflow-hidden border-2 border-gray-400">
                        <img
                            src="https://i.pravatar.cc/150?u=valen"
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            </div>

            {/* Page content */}
            <main className="px-6 py-4">{children}</main>
        </div>
    );
}
