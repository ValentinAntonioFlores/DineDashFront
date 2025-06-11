import React from 'react';

type EditableFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    disabled?: boolean;
    type?: string; // NEW: Added type prop for input (e.g., "text", "password")
};

export const EditableField: React.FC<EditableFieldProps> = ({
                                                                label,
                                                                name,
                                                                value,
                                                                onChange,
                                                                isEditing,
                                                                disabled = false,
                                                                type = "text" // Default to "text" if not provided
                                                            }) => {
    // Determine input classes based on editing state
    const inputClasses = `
        w-full 
        block 
        py-3 px-4 
        rounded-lg 
        shadow-sm 
        text-base 
        transition-all 
        duration-200
        ${
        isEditing && !disabled
            ? 'border border-gray-300 bg-white focus:ring-2 focus:ring-blue-400 focus:border-blue-500 text-gray-800 placeholder-gray-400'
            : 'border border-gray-200 bg-gray-100 text-gray-700 cursor-default select-text' // Read-only styling
    }
        ${disabled ? 'opacity-70 cursor-not-allowed' : ''}
    `;

    return (
        <div className="w-full mb-4"> {/* Added mb-4 for vertical spacing between fields */}
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1"> {/* Stronger label */}
                {label}
            </label>
            <input
                type={type} // Pass the type prop here
                id={name} // Use id for label htmlFor association
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={!isEditing || disabled}
                className={inputClasses}
                // Only show placeholder when editing and value is empty
                placeholder={isEditing && !value ? `Enter ${label.toLowerCase()}...` : undefined}
            />
        </div>
    );
};
