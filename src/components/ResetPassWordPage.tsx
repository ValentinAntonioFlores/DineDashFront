import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

const ResetPasswordPage: React.FC = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'loading' | 'form' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const [token, setToken] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    useEffect(() => {
        // Extract token and userId from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const tokenParam = urlParams.get('token');
        const userIdParam = urlParams.get('userId');

        if (!tokenParam || !userIdParam) {
            setStep('error');
            setErrorMessage('Enlace de recuperación inválido o expirado');
            return;
        }

        setToken(tokenParam);
        setUserId(userIdParam);
        setStep('form');
    }, []);

    const validatePassword = (password: string): string[] => {
        const errors: string[] = [];

        if (password.length < 6) {
            errors.push('La contraseña debe tener al menos 6 caracteres');
        }

        return errors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validations
        if (!newPassword.trim()) {
            setErrorMessage('Por favor ingresa una nueva contraseña');
            return;
        }

        if (!confirmPassword.trim()) {
            setErrorMessage('Por favor confirma tu contraseña');
            return;
        }

        if (newPassword !== confirmPassword) {
            setErrorMessage('Las contraseñas no coinciden');
            return;
        }

        const passwordErrors = validatePassword(newPassword);
        if (passwordErrors.length > 0) {
            setErrorMessage(passwordErrors[0]);
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const response = await fetch(`http://localhost:8000/clientUsers/reset-password?userId=${userId}&token=${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    newPassword,
                    confirmPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error al actualizar la contraseña');
            }

            setStep('success');
        } catch (error: any) {
            setErrorMessage(error.message || 'Error al actualizar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoToLogin = () => {
        window.location.href = '/signin'; // or navigate to your login page
    };

    if (step === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="flex items-center gap-3">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-gray-600">Validando enlace...</span>
                </div>
            </div>
        );
    }

    if (step === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Enlace Inválido</h2>
                    <p className="text-gray-600 mb-6">{errorMessage}</p>
                    <button
                        onClick={handleGoToLogin}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Volver al Inicio de Sesión
                    </button>
                </div>
            </div>
        );
    }

    if (step === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Contraseña Actualizada!</h2>
                    <p className="text-gray-600 mb-6">
                        Tu contraseña ha sido actualizada exitosamente. Ya puedes iniciar sesión con tu nueva contraseña.
                    </p>
                    <button
                        onClick={handleGoToLogin}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                        Iniciar Sesión
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 text-center">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                        <Lock className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Nueva Contraseña</h2>
                    <p className="text-gray-600 mt-2">Ingresa tu nueva contraseña para continuar</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* New Password */}
                    <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Nueva Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="newPassword"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Ingresa tu nueva contraseña"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirmar Contraseña
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirma tu nueva contraseña"
                                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {errorMessage && (
                        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{errorMessage}</p>
                        </div>
                    )}

                    {/* Password Requirements */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm font-medium text-blue-900 mb-1">Requisitos de contraseña:</p>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${newPassword.length >= 6 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Mínimo 6 caracteres
                            </li>
                            <li className="flex items-center gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${newPassword === confirmPassword && newPassword.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                Las contraseñas deben coincidir
                            </li>
                        </ul>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Actualizando Contraseña...
                            </>
                        ) : (
                            'Actualizar Contraseña'
                        )}
                    </button>

                    {/* Back to Login */}
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleGoToLogin}
                            className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
                            disabled={isLoading}
                        >
                            Volver al inicio de sesión
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;