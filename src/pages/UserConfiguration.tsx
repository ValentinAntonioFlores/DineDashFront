import { useAuth } from "../hooks/useAuth";
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { UserConfigurationLayout } from "../layouts/UserConfigurationLayout.tsx";
import { useState, useEffect } from "react";

const UserConfiguration: React.FC = () => {
    const { userData, updateUser, signOut } = useAuth(); // Destructure signOut from useAuth
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        if (!userData) return;

        setFormData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            message: '',
            password: '',
            confirmPassword: '',
        });
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async (updatedData: typeof formData) => {
        let passwordToSend: string | undefined = undefined;

        if (updatedData.password || updatedData.confirmPassword) {
            if (updatedData.password !== updatedData.confirmPassword) {
                alert("Passwords do not match.");
                return;
            }
            if (updatedData.password.length < 6) {
                alert("Password must be at least 6 characters long.");
                return;
            }
            passwordToSend = updatedData.password;
        }

        const dataToSend = {
            firstName: updatedData.firstName,
            lastName: updatedData.lastName,
            email: updatedData.email,
            ...(passwordToSend && { password: passwordToSend }),
        };

        try {
            const result = await updateUser(dataToSend);
            if (result.success) {
                alert("User updated successfully!");
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: '',
                }));
            } else {
                alert("Failed to update user.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    const handleSignOut = () => {
        signOut();
        localStorage.removeItem("userInfo");
        alert("You have logged out successfully.");
        // Optionally, redirect the user to a public page like the login page
    };

    return (
        <HomeLayout>
            <UserConfigurationLayout
                formData={formData}
                onChange={handleChange}
                onSave={handleSave}
                userId={userData?.id || ''}
                // PASS THE SIGN OUT HANDLER HERE
                onSignOut={handleSignOut}
            />
            {/* The standalone Sign Out Button is removed from here */}
        </HomeLayout>
    );
};

export default UserConfiguration;
