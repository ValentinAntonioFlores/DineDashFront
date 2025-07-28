import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        // Leemos los parámetros que nos envía el backend desde la URL
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const targetPath = params.get("targetPath"); // Leemos la ruta de destino que el backend decidió

        if (token) {
            // 1. Guardamos el token en localStorage con el nombre que acordamos: 'authToken'
            localStorage.setItem("authToken", token);

            // 2. Redirigimos al usuario a la ruta que el backend nos indicó.
            //    Si por alguna razón el targetPath no viniera, lo mandamos a una ruta segura por defecto.
            navigate(targetPath || "/home");

        } else {
            // Si no hay token en la URL, algo salió mal en el backend.
            // Redirigimos a la página de login con un mensaje de error.
            navigate("/signin?error=OAuthTokenMissing");
        }
    }, [navigate, location]);

    // Muestra un mensaje de carga mientras se procesa la redirección
    return <div>Procesando inicio de sesión...</div>;
};

export default OAuth2RedirectHandler;