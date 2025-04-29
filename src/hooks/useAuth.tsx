import { useState, useEffect } from 'react';
import { apiUpdateUser } from '../utils/Api';
import { useNavigate } from 'react-router-dom'; // <-- import useNavigate



interface UserData {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export const useAuth = () => {
    const [userData, setUserData] = useState<UserData | null>(null);
    const navigate = useNavigate(); // <-- Use navigate hook here

    // Load user data from localStorage when the component mounts
    useEffect(() => {
        const savedUserData = localStorage.getItem('userInfo');
        if (savedUserData) {
            const parsed = JSON.parse(savedUserData);

            console.log('Parsed userInfo:', parsed); // 👈 Add this
            console.log('User ID:', parsed.id || parsed.idUsuario); // 👈 Ad


            setUserData({
                id: parsed.id,
                firstName: parsed.firstName,
                lastName: parsed.lastName,
                email: parsed.email,
            });
        }
    }, []);

    const updateUser = async (updatedData: Partial<UserData> & { password?: string }) => {
        try {
            if (!userData) {
                return { success: false, error: 'User is not logged in.' };
            }

            const payload: any = {
                firstName: updatedData.firstName || userData.firstName,
                lastName: updatedData.lastName || userData.lastName,
                email: updatedData.email || userData.email,
            };

            if (updatedData.password) {
                payload.password = updatedData.password;
            }

            const updateResult = await apiUpdateUser(userData.id, payload);

            if (updateResult) {
                const updatedUser: UserData = {
                    ...userData,
                    firstName: payload.firstName,
                    lastName: payload.lastName,
                    email: payload.email,
                };

                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                setUserData(updatedUser);

                return { success: true };
            } else {
                return { success: false, error: 'Failed to update user.' };
            }
        } catch (error) {
            console.error('Error updating user:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unexpected error',
            };
        }
    };



    const signOut = () => {
        localStorage.removeItem('userInfo');
        setUserData(null);
        navigate("/signup")
    };

    return { userData, updateUser, signOut };
};
