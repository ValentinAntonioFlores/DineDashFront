import { useState, useEffect } from 'react';
import { apiUpdateUser } from '../utils/Api';

interface UserData {
    id: string;
    name: string;
    email: string;
}

export const useAuth = () => {
    const [userData, setUserData] = useState<UserData | null>(null);

    // Load user data from localStorage when the component mounts
    useEffect(() => {
        const savedUserData = localStorage.getItem('userInfo');
        if (savedUserData) {
            const parsed = JSON.parse(savedUserData);

            console.log('Parsed userInfo:', parsed); // 👈 Add this
            console.log('User ID:', parsed.id || parsed.idUsuario); // 👈 Ad


            setUserData({
                id: parsed.id, // ✅ Handles both keys
                name: parsed.firstName + ' ' + parsed.lastName,
                email: parsed.email,
            });
        }
    }, []);

    const updateUser = async (updatedData: Partial<UserData> & { password?: string }) => {
        try {
            if (!userData) {
                return { success: false, error: 'User is not logged in.' };
            }

            // Split name into first and last name
            const [firstname, apellido] = updatedData.name?.split(' ') || ['', ''];

            // Prepare the payload with the correct mappings for the backend
            const payload: any = {
                nombre: firstname,  // Map 'firstname' to 'nombre'
                apellido,           // Map 'lastname' to 'apellido'
                email: userData.email, // Include email in the payload
            };

            // If the password is provided, include it in the payload
            if (updatedData.password) {
                payload.contraseña = updatedData.password; // Map 'password' to 'contraseña'
            }

            // Call the API to update user data
            const updateResult = await apiUpdateUser(userData.id, payload); // Use UUID (userData.id)

            // If the update is successful, update localStorage and state
            if (updateResult) {
                // Update localStorage with the new user info
                const updatedUser = {
                    ...userData,
                    name: `${firstname} ${apellido}`,
                };

                localStorage.setItem('userInfo', JSON.stringify({
                    id: userData.id, // Save UUID here
                    firstName: firstname,
                    lastName: apellido,
                    email: userData.email,
                }));

                // Update state with the new user data
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
    };

    return { userData, updateUser, signOut };
};
