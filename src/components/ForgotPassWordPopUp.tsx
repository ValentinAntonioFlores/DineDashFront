import React, { useState } from 'react';
import { X, Mail, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';

interface ForgotPasswordPopupProps {
    isOpen: boolean;
    onClose: () => void;
}

const ForgotPasswordPopup: React.FC<ForgotPasswordPopupProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState<'input' | 'success' | 'error'>('input');
    const [errorMessage, setErrorMessage] = useState('');
    const [backupEmail, setBackupEmail] = useState('');

    // Updated API call with better error handling
    const sendPasswordReset = async (userEmail: string) => {
        try {
            console.log('Sending password reset request for:', userEmail);

            const response = await fetch(`http://localhost:8000/clientUsers/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: userEmail }),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Get the response text first to see what we're actually receiving
            const responseText = await response.text();
            console.log('Raw response text:', responseText);

            // Check if the response is actually JSON
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Parsed JSON result:', result);
            } catch (jsonError) {
                console.error('JSON parsing error:', jsonError);
                console.error('Response was not JSON:', responseText);
                throw new Error(`Server returned invalid JSON response: ${responseText.substring(0, 100)}...`);
            }

            // Check if the request was successful
            if (!response.ok) {
                throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return result;
        } catch (error) {
            console.error('Password reset error:', error);
            throw error;
        }
    };

    const handleSubmit = async () => {
        if (!email.trim()) {
            setErrorMessage('Por favor ingresa tu email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setErrorMessage('Por favor ingresa un email válido');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const result = await sendPasswordReset(email);

            // Assuming the API returns the masked backup email
            setBackupEmail(result.backupEmail || 'tu email de respaldo');
            setStep('success');
        } catch (error: any) {
            setStep('error');

            // Handle different error types
            if (error.message.includes('not found') || error.message.includes('No se encontró')) {
                setErrorMessage('No se encontró una cuenta con este email');
            } else if (error.message.includes('no backup email') || error.message.includes('email de respaldo')) {
                setErrorMessage('Esta cuenta no tiene un email de respaldo configurado. Por favor contacta a soporte.');
            } else if (error.message.includes('not verified') || error.message.includes('no está verificado')) {
                setErrorMessage('El email de respaldo no está verificado. Por favor verifica tu email de respaldo primero.');
            } else if (error.message.includes('invalid JSON')) {
                setErrorMessage('Error de comunicación con el servidor. Por favor intenta más tarde.');
            } else {
                setErrorMessage(error.message || 'Error al enviar el email de recuperación');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setEmail('');
        setStep('input');
        setErrorMessage('');
        setBackupEmail('');
        onClose();
    };

    const handleBackToInput = () => {
        setStep('input');
        setErrorMessage('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && step === 'input' && !isLoading) {
            handleSubmit();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto transform transition-all">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        {step === 'error' && (
                            <button
                                onClick={handleBackToInput}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                        )}
                        <h2 className="text-xl font-bold text-gray-900">
                            {step === 'input' && 'Recuperar Contraseña'}
                            {step === 'success' && '¡Email Enviado!'}
                            {step === 'error' && 'Error'}
                        </h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Input Step */}
                    {step === 'input' && (
                        <>
                            <div className="mb-6 text-center">
                                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                    <Mail className="w-8 h-8 text-blue-600" />
                                </div>
                                <p className="text-gray-600 leading-relaxed">
                                    Ingresa tu email principal y te enviaremos un enlace de recuperación a tu email de respaldo configurado.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        Email Principal
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="ejemplo@email.com"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        disabled={isLoading}
                                    />
                                </div>

                                {errorMessage && (
                                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                        <p className="text-sm text-red-700">{errorMessage}</p>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                        disabled={isLoading}
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={isLoading}
                                        className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Enviando...
                                            </>
                                        ) : (
                                            'Enviar Email'
                                        )}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Success Step */}
                    {step === 'success' && (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                ¡Email de Recuperación Enviado!
                            </h3>
                            <div className="space-y-3 text-sm text-gray-600 mb-6">
                                <p>
                                    Hemos enviado un enlace de recuperación a:
                                </p>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="font-medium text-blue-800">
                                        📧 {backupEmail}
                                    </p>
                                </div>
                                <div className="text-left space-y-2">
                                    <p className="font-medium">Instrucciones:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        <li>Revisa tu bandeja de entrada y spam</li>
                                        <li>Haz click en el enlace (válido por 30 minutos)</li>
                                        <li>Ingresa tu nueva contraseña</li>
                                    </ul>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Entendido
                            </button>
                        </div>
                    )}

                    {/* Error Step */}
                    {step === 'error' && (
                        <div className="text-center">
                            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <AlertCircle className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No se pudo enviar el email
                            </h3>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-red-700 text-left">
                                    {errorMessage}
                                </p>
                            </div>

                            {errorMessage.includes('email de respaldo') && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h4 className="font-medium text-blue-900 mb-2">💡 Solución:</h4>
                                    <div className="text-sm text-blue-800 text-left space-y-1">
                                        <p>1. Inicia sesión en tu cuenta</p>
                                        <p>2. Configura tu email de respaldo</p>
                                        <p>3. Verifica el email de respaldo</p>
                                        <p>4. Intenta recuperar tu contraseña nuevamente</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={handleBackToInput}
                                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Intentar Otra Vez
                                </button>
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPopup;