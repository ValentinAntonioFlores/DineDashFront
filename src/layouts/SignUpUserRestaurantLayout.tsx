import React from 'react';
import { useNavigate } from 'react-router-dom';

interface SignUpLayoutProps {
    children: React.ReactNode;
}


// eslint-disable-next-line no-empty-pattern
const SignUpLayout: React.FC<SignUpLayoutProps> = ({}) => {
    const navigate = useNavigate();

    const handleUserSignUp = () => {
        navigate("/Usersignup"); // Navigate to user sign-up page
    };

    const handleRestaurantSignUp = () => {
        navigate("/restaurant-signup"); // Navigate to restaurant sign-up page
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="w-[800px] h-[500px] bg-gradient-to-r from-pink-700 to-red-500 text-white p-10 flex flex-col items-center justify-center rounded-3xl">
                    <h2 className="max-w-xl text-2xl font-semibold flex items-center -translate-y-[50px]">Welcome to DineDash!</h2>
                    <p className="mb-6 text-center font-semibold max-w-xs">
                        Please choose if you would like to create your account as an User or a Restaurant.
                    </p>
                    <button
                        onClick={handleUserSignUp}
                        className="mb-6 border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-red-500 transition"
                    >
                        User Account
                    </button>
                    <button
                        onClick={handleRestaurantSignUp}
                        className="border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-red-500 transition"
                    >
                        Restaurant Account
                    </button>

                </div>
        </div>
    );
};
/* Faltan modificar algunas cosas
Quiero que esten User Account o Restaurant Account uno debajo del otro o estan lado a lado ?
Agregar Logo
Welcome to DineDash! Quiero que tenga un mayor witdh ? 
 */
export default SignUpLayout;
