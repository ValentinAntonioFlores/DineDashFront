import { useAuth } from "../hooks/useAuth";
import HomeLayout from "../layouts/HomeHeaderLayout.tsx";
import { UserConfigurationLayout } from "../layouts/UserConfigurationLayout.tsx";
import { useState, useEffect } from "react";

const UserConfiguration: React.FC = () => {
    const { userData, updateUser } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
        password: '',
        confirmPassword: '',
    });

    useEffect(() => {
        console.log("User Data:", userData);
        if (!userData) return;

        setFormData({
            name: userData.name,
            email: userData.email,
            message: '',
            password: '',
            confirmPassword: '',
        });
    }, [userData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (updatedData: typeof formData) => {
        console.log("Password:", updatedData.password);

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
            name: updatedData.name,
            email: updatedData.email,
            ...(passwordToSend && { password: passwordToSend }),
        };

        try {
            const result = await updateUser(dataToSend);
            if (result.success) {
                console.log("User updated successfully!");
                alert("User updated successfully!");
                setFormData(updatedData); // Update the state after a successful save
            } else {
                alert("Failed to update user.");
            }
        } catch (error) {
            console.error("Error updating user:", error);
            alert("Failed to update user.");
        }
    };

    return (
        <HomeLayout>
            <UserConfigurationLayout
                formData={formData}
                onChange={handleChange}
                onSave={handleSave}
            />
        </HomeLayout>
    );
};

export default UserConfiguration;
