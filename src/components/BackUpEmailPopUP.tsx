// Enhanced BackupEmailPopup.tsx
import React, { useState } from 'react';
import { AlertCircle, Mail, Shield, CheckCircle } from 'lucide-react';

interface BackupEmailPopupProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (email: string) => Promise<void>;
    currentBackupEmail?: string;
    isVerified?: boolean;
}

export default function BackupEmailPopup({
                                             isOpen,
                                             onClose,
                                             onSubmit,
                                             currentBackupEmail,
                                             isVerified
                                         }: BackupEmailPopupProps) {
    const [email, setEmail] = useState(currentBackupEmail || '');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Determine the mode based on current state
    const isUpdating = Boolean(currentBackupEmail);
    const needsVerification = currentBackupEmail && !isVerified;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;

        setIsLoading(true);
        setError('');

        try {
            await onSubmit(email.trim());
            // Success handling is done in parent component
            // Parent will close popup and show success message
        } catch (error: any) {
            setError(error.message || 'Failed to update backup email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        if (!isLoading) {
            setEmail(currentBackupEmail || '');
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    // Determine popup title and message based on state
    const getPopupContent = () => {
        if (needsVerification) {
            return {
                title: 'Verify Your Backup Email',
                subtitle: `Your backup email "${currentBackupEmail}" needs verification.`,
                description: 'Update your backup email or re-verify the current one to ensure account security.',
                buttonText: email === currentBackupEmail ? 'Resend Verification' : 'Update & Verify Email'
            };
        } else if (isUpdating) {
            return {
                title: 'Update Backup Email',
                subtitle: 'Change your backup email address',
                description: 'This email will be used for account recovery and important notifications.',
                buttonText: 'Update Backup Email'
            };
        } else {
            return {
                title: 'Add Backup Email',
                subtitle: 'Secure your account with a backup email',
                description: 'We\'ll send you important notifications and account recovery information to this email.',
                buttonText: 'Add Backup Email'
            };
        }
    };

    const content = getPopupContent();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                        {needsVerification ? (
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                        ) : (
                            <Mail className="w-6 h-6 text-blue-500" />
                        )}
                        <h2 className="text-xl font-bold text-gray-900">{content.title}</h2>
                    </div>
                    <p className="text-sm text-gray-600">{content.subtitle}</p>
                </div>

                {/* Body */}
                <div className="p-6">
                    {/* Current status indicator */}
                    {currentBackupEmail && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 ${
                            isVerified
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                        }`}>
                            {isVerified ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <AlertCircle className="w-4 h-4" />
                            )}
                            <span className="text-sm font-medium">
                                Current: {currentBackupEmail}
                                {isVerified ? ' (Verified)' : ' (Needs Verification)'}
                            </span>
                        </div>
                    )}

                    <p className="text-sm text-gray-700 mb-4">{content.description}</p>

                    <form onSubmit={handleSubmit}>
                        <label htmlFor="backup-email" className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Email Address
                        </label>
                        <input
                            id="backup-email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            placeholder="Enter your backup email"
                            required
                            disabled={isLoading}
                        />

                        {/* Security notice */}
                        <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg mb-4">
                            <Shield className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Security Notice</p>
                                <p>A verification link will be sent to this email. You must click the link to complete the setup.</p>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-sm mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="flex-1 px-4 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={isLoading}
                            >
                                {isUpdating ? 'Cancel' : 'Skip for Now'}
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                disabled={isLoading || !email.trim()}
                            >
                                {isLoading && (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                )}
                                {isLoading ? 'Processing...' : content.buttonText}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Additional info */}
                <div className="px-6 pb-6">
                    <div className="text-xs text-gray-500 space-y-1">
                        <p>• Verification links expire in 24 hours</p>
                        <p>• You can change your backup email anytime in settings</p>
                        <p>• This email will only be used for security purposes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}