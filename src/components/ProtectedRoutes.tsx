import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute: React.FC = () => {
    const isAuthenticated = !!localStorage.getItem('authToken'); // Verifica si hay un token en localStorage

    return isAuthenticated ? <Outlet /> : <Navigate to="/signup" />; // Redirige si no está autenticado
};

export default ProtectedRoute;