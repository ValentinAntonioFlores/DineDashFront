import React from 'react';

interface SignUpInputProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

const AuthInput: React.FC<SignUpInputProps> = ({
                                                   label,
                                                   name,
                                                   type = 'text',
                                                   value,
                                                   onChange,
                                                   placeholder,
                                               }) => {
    return (
        <div className="mb-4">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full px-4 py-2 bg-gray-100 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-400"
            />
        </div>
    );
};

export default AuthInput;
