import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoutes = () => {
    const authToken = localStorage.getItem('authToken'); // Retrieve token from localStorage

    return (
        authToken ? <Outlet /> : <Navigate to="/signup-layout" replace />
    );
};

export default PrivateRoutes;