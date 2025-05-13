import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Home from './pages/Home.tsx';
import RestaurantSignUp from './pages/RestaurantSignUp.tsx';
import SignUpForm from './pages/UserSignUp.tsx';
import SignInForm from './pages/SignIn.tsx';
import RestaurantSignIn from './pages/RestaurantSignIn.tsx';
import RestaurantHome from './pages/RestaurantHome.tsx';
import UserConfiguration from './pages/UserConfiguration.tsx';
import ProtectedRoutes from './components/ProtectedRoutes.tsx';
import SignUpLayout from './layouts/SignUpUserRestaurantLayout.tsx';

function App() {
    const isAuthenticated = !!localStorage.getItem('authToken'); // Check if user is authenticated
    console.log('User authentication status:', isAuthenticated, localStorage.getItem('authToken')); // Log the authentication status
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Navigate to="/signup" />} />
                <Route path="/signup" element={<SignUpLayout />} />
                <Route path="/Usersignup" element={<SignUpForm />} />
                <Route path="/signin" element={<SignInForm />} />
                <Route path="/restaurant-signup" element={<RestaurantSignUp />} />
                <Route path="/RestaurantSignIn" element={<RestaurantSignIn />} />

                {/* Protected Routes */}
                <Route
                    element={isAuthenticated ? <ProtectedRoutes /> : <Navigate to="/signup" />}
                >
                    <Route path="/home" element={<Home />} />
                    <Route path="/restaurantHome" element={<RestaurantHome />} />
                    <Route path="/userConfiguration" element={<UserConfiguration/>} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;