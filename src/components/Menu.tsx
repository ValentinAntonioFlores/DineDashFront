import React, { useState, ChangeEvent } from "react";

type Plate = {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
};

const categories = ["Pasta", "Pizza", "Drinks", "Salads", "Desserts"];

const Menu: React.FC = () => {
    const [plates, setPlates] = useState<Plate[]>([]);
    const [showAddForm, setShowAddForm] = useState(false);

    // Form state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newCategory, setNewCategory] = useState(categories[0]);
    const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const imageUrl = URL.createObjectURL(file);
            setNewImageUrl(imageUrl);
        }
    };

    const addPlate = () => {
        if (!newName.trim() || !newPrice.trim() || isNaN(Number(newPrice))) {
            alert("Please enter a valid name and price.");
            return;
        }
        const newPlate: Plate = {
            id: Date.now(),
            name: newName.trim(),
            description: newDescription.trim(),
            price: Number(newPrice),
            category: newCategory,
            imageUrl: newImageUrl || "",
        };
        setPlates((prev) => [...prev, newPlate]);

        setNewName("");
        setNewDescription("");
        setNewPrice("");
        setNewCategory(categories[0]);
        setNewImageUrl(null);
        setShowAddForm(false);
    };

    return (
        <div
            className="max-w-4xl mx-auto p-8 rounded-lg shadow-lg"
            style={{ backgroundColor: "#fef7ec", fontFamily: "'Georgia', serif", color: "#000000" }}
        >
            {/* Floral accent top */}
            <div className="mb-6 flex justify-center">
                <svg
                    width="120"
                    height="24"
                    viewBox="0 0 120 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                >
                    <path
                        d="M2 12C8 0 18 18 30 12C42 6 52 20 60 12C68 4 78 18 90 12C102 6 112 18 118 12"
                        stroke="#000000"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <h2 className="text-3xl font-serif italic mb-8 text-left">Menu</h2>

            {/* Categories and Plates */}
            {categories.map((category) => {
                const platesInCategory = plates.filter((p) => p.category === category);
                if (platesInCategory.length === 0) return null;

                return (
                    <div key={category} className="mb-10">
                        {/* Category Title */}
                        <h3 className="text-2xl font-serif italic mb-4 border-l-4 border-black pl-3">
                            {category}
                        </h3>

                        {/* Plates */}
                        <div className="space-y-6">
                            {platesInCategory.map((plate) => (
                                <div
                                    key={plate.id}
                                    className="flex items-center justify-between bg-white border border-black rounded-lg p-5 shadow-sm"
                                >
                                    <div className="flex-1 pr-4">
                                        <h4 className="text-xl font-serif italic mb-1">{plate.name}</h4>
                                        <p className="text-sm italic font-serif text-gray-700 mb-1">{plate.description}</p>
                                        <p className="mt-3 font-semibold font-serif italic">${plate.price.toFixed(2)}</p>
                                    </div>
                                    <div className="w-28 h-28 flex-shrink-0 rounded overflow-hidden border border-black shadow-md">
                                        {plate.imageUrl ? (
                                            <img
                                                src={plate.imageUrl}
                                                alt={plate.name}
                                                className="object-cover w-full h-full"
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Thin separator line */}
                        <hr className="border-t border-black border-opacity-30 mt-8" />
                    </div>
                );
            })}

            {/* Add Plate Section */}
            <div className="mt-8 border-t border-black pt-6">
                {!showAddForm && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="bg-black text-white font-serif italic px-6 py-2 rounded hover:bg-[#fef7ec] hover:text-black transition"
                    >
                        + Add Plate
                    </button>
                )}

                {showAddForm && (
                    <div className="space-y-5 mt-6">
                        <div>
                            <label className="block font-serif italic mb-1">Name</label>
                            <input
                                type="text"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 italic font-serif"
                                placeholder="Plate name"
                            />
                        </div>

                        <div>
                            <label className="block font-serif italic mb-1">Category</label>
                            <select
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 italic font-serif"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>
                                        {cat}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block font-serif italic mb-1">Description</label>
                            <textarea
                                value={newDescription}
                                onChange={(e) => setNewDescription(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 italic font-serif"
                                placeholder="Short description"
                                rows={2}
                            />
                        </div>

                        <div>
                            <label className="block font-serif italic mb-1">Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                                className="w-full border border-black rounded px-3 py-2 italic font-serif"
                                placeholder="e.g. 12.99"
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="flex flex-col items-center">
                            <label
                                htmlFor="image-upload"
                                className="relative w-64 h-64 cursor-pointer group rounded-xl overflow-hidden shadow-lg border-2 border-dashed border-black hover:border-black transition"
                            >
                                {!newImageUrl ? (
                                    <div className="absolute inset-0 bg-white flex flex-col items-center justify-center text-black group-hover:bg-gray-100 transition-all italic font-serif">
                                        <span className="text-lg font-medium">Upload Image</span>
                                        <span className="text-4xl">📷</span>
                                    </div>
                                ) : (
                                    <img
                                        src={newImageUrl}
                                        alt="Plate"
                                        className="w-full h-full object-cover transition group-hover:opacity-75"
                                    />
                                )}
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 italic font-serif">
                                    <span className="text-sm font-medium">Change Image</span>
                                </div>
                            </label>
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                        </div>

                        <div className="flex space-x-4">
                            <button
                                onClick={addPlate}
                                className="bg-black text-white font-serif italic px-6 py-2 rounded hover:bg-[#fef7ec] hover:text-black transition"
                            >
                                Save Plate
                            </button>
                            <button
                                onClick={() => setShowAddForm(false)}
                                className="bg-gray-300 font-serif italic px-6 py-2 rounded hover:bg-gray-400 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Menu;
