import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// JWT decoding utility function
const decodeJWT = (token: string) => {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

const OAuth2RedirectHandler = () => {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        console.log('OAuth2RedirectHandler: Processing redirect...');

        // Read parameters sent by the backend from the URL
        const params = new URLSearchParams(location.search);
        const token = params.get("token");
        const userTypeFromUrl = params.get("userType");

        // Also check sessionStorage for backup
        const userTypeFromSession = sessionStorage.getItem('pendingOAuthUserType');

        // Clean up session storage
        if (userTypeFromSession) {
            sessionStorage.removeItem('pendingOAuthUserType');
        }

        console.log('OAuth2RedirectHandler: Found parameters:', {
            token: token ? `${token.substring(0, 20)}...` : null,
            userTypeFromUrl,
            userTypeFromSession
        });

        // Determine user type (prefer URL parameter, fallback to session)
        const userType = userTypeFromUrl || userTypeFromSession;

        if (token && userType) {
            try {
                console.log(`OAuth2RedirectHandler: Processing ${userType} authentication...`);

                // 1. Store the token in localStorage
                localStorage.setItem("authToken", token);

                // 2. Decode JWT to extract user information
                const decodedToken = decodeJWT(token);
                console.log('OAuth2RedirectHandler: Decoded token:', decodedToken);

                if (decodedToken) {
                    // 3. Create user info object with all necessary fields
                    const userInfo = {
                        id: decodedToken.userId, // This matches what your backend puts in the JWT
                        firstName: decodedToken.userName?.split(' ')[0] || '', // Extract first name
                        lastName: decodedToken.userName?.split(' ').slice(1).join(' ') || '', // Extract last name
                        email: decodedToken.sub || decodedToken.email, // JWT subject is usually the email
                        userType: decodedToken.userType || userType
                    };

                    console.log('OAuth2RedirectHandler: Created user info:', userInfo);
                    localStorage.setItem("userInfo", JSON.stringify(userInfo));

                    // 4. Redirect based on user type
                    if (userType === 'restaurant') {
                        console.log('OAuth2RedirectHandler: Redirecting to restaurant home');
                        navigate("/restaurantHome", { replace: true });
                    } else {
                        console.log('OAuth2RedirectHandler: Redirecting to client home');
                        navigate("/home", { replace: true });
                    }



                } else {
                    throw new Error('Failed to decode JWT token');
                }

            } catch (error) {
                console.error("OAuth2RedirectHandler: Error processing token:", error);
                navigate("/signin?error=TokenProcessingError", { replace: true });
            }

        } else {
            // If token or userType is missing, redirect to signin with error
            console.error("OAuth2RedirectHandler: Missing required parameters:", {
                hasToken: !!token,
                userType,
                searchParams: location.search
            });
            navigate("/signin?error=OAuthError", { replace: true });
        }
    }, [navigate, location]);

    // Show loading message while processing the redirect
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            fontSize: '18px',
            gap: '16px'
        }}>
            <div>🔄 Procesando inicio de sesión...</div>
            <div style={{ fontSize: '14px', color: '#666' }}>
                Por favor espera mientras completamos tu autenticación
            </div>
        </div>
    );
};

export default OAuth2RedirectHandler;