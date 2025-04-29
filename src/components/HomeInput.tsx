import React from 'react';

interface SignUpInputProps {
    label: string;
    name: string;
    type?: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
}

// @ts-ignore
const SignUpInput: React.FC<SignUpInputProps> = ({
                                                     label,
                                                     name,
                                                     type = 'text',
                                                     value,
                                                     onChange,
                                                     placeholder,
                                                 }) => {
}

export default SignUpInput;
