import React, { createContext, useContext, useState } from 'react';

interface UserContextProps {
    role: 'restaurant' | 'user';
    setRole: React.Dispatch<React.SetStateAction<'restaurant' | 'user'>>;
}

const UserContext = createContext<UserContextProps | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
};

export const UserProvider: React.FC = ({ children }) => {
    const [role, setRole] = useState<'restaurant' | 'user'>('user');

    return (
        <UserContext.Provider value={{ role, setRole }}>
            {children}
        </UserContext.Provider>
    );
};
