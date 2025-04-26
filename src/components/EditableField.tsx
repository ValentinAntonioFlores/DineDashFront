type EditableFieldProps = {
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isEditing: boolean;
};

export const EditableField: React.FC<EditableFieldProps> = ({ label, name, value, onChange, isEditing }) => {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={name} className="font-medium text-gray-700">
                {label}
            </label>
            {isEditing ? (
                <input
                    type="text"
                    id={name}
                    name={name}
                    value={value}
                    onChange={onChange}
                    className="border border-gray-300 p-2 rounded"
                />
            ) : (
                <p className="text-gray-600">{value}</p>
            )}
        </div>
    );
};
