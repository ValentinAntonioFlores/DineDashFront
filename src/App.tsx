import { BrowserRouter, Routes, Route } from 'react-router-dom';

import './App.css';
import './index.css';

import Home from './pages/Home.tsx';
import RestaurantSignUp from './pages/RestaurantSignUp.tsx';
import SignUpForm from "./pages/UserSignUp.tsx";
import SignUpUserRestaurantLayout from "./layouts/SignUpUserRestaurantLayout.tsx";
import SignInForm from "./pages/SignIn.tsx";
import RestaurantHome from "./pages/RestaurantHome.tsx";
import UserConfiguration from "./pages/UserConfiguration.tsx";
import RestaurantHomes from "./pages/RestaurantHome.tsx";
import RestaurantDashboard from "./RestaurantLayout/RestaurantView.tsx";
import TableManagement from "./RestaurantLayout/TableManagement.tsx";
import UserTableSelection from "./RestaurantLayout/UserTableSelection.tsx";
import RestaurantConfig from "./pages/RestaurantConfig.tsx";


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
                <Route path="/conf" element={<UserConfiguration />} />
                <Route path="/restaurant" element={<RestaurantHomes/>} />
                <Route path="restaurantss" element={<RestaurantDashboard />} />
                <Route path="/tables" element={<TableManagement />} />
                <Route path="/userTable" element={<UserTableSelection />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
