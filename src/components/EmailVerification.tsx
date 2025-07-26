// EmailVerification.tsx - New component for handling email verification
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Mail, Loader2, RefreshCw } from 'lucide-react';
import { verifyBackupEmail, resendVerificationEmail } from '../utils/Api';

type VerificationState = 'loading' | 'success' | 'error' | 'expired' | 'invalid';

const EmailVerification: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [state, setState] = useState<VerificationState>('loading');
    const [message, setMessage] = useState('');
    const [isResending, setIsResending] = useState(false);

    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    useEffect(() => {
        if (!userId || !token) {
            setState('invalid');
            setMessage('Invalid verification link. Please check your email for the correct link.');
            return;
        }

        verifyEmail();
    }, [userId, token]);

    const verifyEmail = async () => {
        try {
            setState('loading');
            const result = await verifyBackupEmail(userId!, token!);
            setState('success');
            setMessage(result || 'Your backup email has been verified successfully!');
        } catch (error: any) {
            console.error('Verification error:', error);

            if (error.message.includes('expired')) {
                setState('expired');
                setMessage('Your verification link has expired. Please request a new one.');
            } else if (error.message.includes('Invalid')) {
                setState('invalid');
                setMessage('Invalid verification token. Please check your email for the correct link.');
            } else {
                setState('error');
                setMessage(error.message || 'Verification failed. Please try again.');
            }
        }
    };

    const handleResendVerification = async () => {
        try {
            setIsResending(true);
            const authToken = localStorage.getItem('token');
            if (!authToken) {
                throw new Error('Please log in to resend verification email');
            }

            await resendVerificationEmail(userId!, authToken);
            alert('Verification email sent! Please check your inbox.');
        } catch (error: any) {
            alert(`Failed to resend verification email: ${error.message}`);
        } finally {
            setIsResending(false);
        }
    };

    const handleGoHome = () => {
        navigate('/');
    };

    const handleGoToLogin = () => {
        navigate('/login');
    };

    const getStatusIcon = () => {
        switch (state) {
            case 'loading':
                return <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />;
            case 'success':
                return <CheckCircle className="w-16 h-16 text-green-500" />;
            case 'error':
            case 'expired':
            case 'invalid':
                return <XCircle className="w-16 h-16 text-red-500" />;
            default:
                return <Mail className="w-16 h-16 text-gray-400" />;
        }
    };

    const getStatusTitle = () => {
        switch (state) {
            case 'loading':
                return 'Verifying Your Email...';
            case 'success':
                return 'Email Verified Successfully!';
            case 'expired':
                return 'Verification Link Expired';
            case 'invalid':
                return 'Invalid Verification Link';
            case 'error':
                return 'Verification Failed';
            default:
                return 'Email Verification';
        }
    };

    const getStatusColor = () => {
        switch (state) {
            case 'success':
                return 'text-green-600';
            case 'error':
            case 'expired':
            case 'invalid':
                return 'text-red-600';
            case 'loading':
                return 'text-blue-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main verification card */}
                <div className="bg-white rounded-xl shadow-xl p-8 text-center">
                    {/* Status Icon */}
                    <div className="flex justify-center mb-6">
                        {getStatusIcon()}
                    </div>

                    {/* Status Title */}
                    <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
                        {getStatusTitle()}
                    </h1>

                    {/* Status Message */}
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                        {state === 'success' && (
                            <button
                                onClick={handleGoHome}
                                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                            >
                                Continue to Dashboard
                            </button>
                        )}

                        {(state === 'expired' || state === 'error') && userId && (
                            <button
                                onClick={handleResendVerification}
                                disabled={isResending}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isResending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-4 h-4" />
                                        Resend Verification Email
                                    </>
                                )}
                            </button>
                        )}

                        {state === 'invalid' && (
                            <button
                                onClick={handleGoToLogin}
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                Go to Login
                            </button>
                        )}

                        {/* Always show home button as secondary action */}
                        {state !== 'success' && (
                            <button
                                onClick={handleGoHome}
                                className="w-full bg-gray-200 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                            >
                                Return to Home
                            </button>
                        )}
                    </div>
                </div>

                {/* Additional info */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                        Need help? Contact our support team
                    </p>
                </div>
            </div>
        </div>
    );
};

export default EmailVerification;