import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import './index.css';

import Home from './pages/Home.tsx';
import RestaurantSignUp from './pages/RestaurantSignUp.tsx';
import SignUpForm from "./pages/UserSignUp.tsx";
import SignUpUserRestaurantLayout from "./layouts/SignUpUserRestaurantLayout.tsx";
import SignInForm from "./pages/SignIn.tsx";
import RestaurantDashboard from "./RestaurantLayout/RestaurantView.tsx";
import RestaurantHome from "./pages/RestaurantHome.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/Usersignup" element={<SignUpForm />} />
                <Route path="/signin" element={<SignInForm />} />
                <Route path="/restaurant-signup" element={<RestaurantSignUp />} />
                <Route path="/SignUp" element={<SignUpUserRestaurantLayout/>}/>
                <Route path="/restaurantHome" element={<RestaurantHome />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;
