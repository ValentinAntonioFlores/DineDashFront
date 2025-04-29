type EditableFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    isEditing: boolean;
    disabled?: boolean;
};

export const EditableField: React.FC<EditableFieldProps> = ({
                                                                label,
                                                                name,
                                                                value,
                                                                onChange,
                                                                isEditing,
                                                                disabled = false
                                                            }) => {
    return (
        <div className="w-full">
            <label htmlFor={name} className="block text-sm text-gray-700">{label}</label>
            <input
                type="text"
                name={name}
                value={value || ""}
                onChange={onChange}
                disabled={!isEditing || disabled}
                className="w-full border p-2 rounded mt-2"
            />
        </div>
    );
};
