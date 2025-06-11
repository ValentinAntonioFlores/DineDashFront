import React, { useState, ChangeEvent, useEffect } from "react";
import {
    CreateRestaurantCategory,
    AddProductByRestaurant,
    fetchProductsByRestaurant,
    updateProductById,
    deleteProductById
} from "../utils/RestaurantApi.ts";

// Define a placeholder image URL for plates without an image
const PLACEHOLDER_IMAGE_URL = "https://placehold.co/120x120/E5E7EB/6B7280?text=No+Image";

type Plate = {
    id: string;
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

    // Add form state
    const [newName, setNewName] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [newPrice, setNewPrice] = useState("");
    const [newCategory, setNewCategory] = useState(categories[0]);
    const [newImageUrl, setNewImageUrl] = useState<string | null>(null);

    // Edit mode state
    const [editId, setEditId] = useState<string | null>(null);

    // Common for both Add and Edit
    const resetForm = () => {
        setNewName("");
        setNewDescription("");
        setNewPrice("");
        setNewCategory(categories[0]);
        setNewImageUrl(null);
        setEditId(null);
        setShowAddForm(false);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader(); // Use FileReader for base64
            reader.onloadend = () => {
                setNewImageUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addPlate = async () => {
        if (!newName.trim() || !newPrice.trim() || isNaN(Number(newPrice))) {
            alert("Please enter a valid name and price.");
            return;
        }

        const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
        if (!restaurantId) {
            alert("Restaurant ID not found.");
            return;
        }

        try {
            await CreateRestaurantCategory({
                name: newCategory,
                restaurantId: restaurantId
            });

            const createdProduct = await AddProductByRestaurant({
                name: newName.trim(),
                description: newDescription.trim(),
                price: Number(newPrice),
                image: newImageUrl || "", // Send base64 image
                category: newCategory,
                restaurantUser: {
                    idRestaurante: restaurantId
                }
            });

            setPlates((prev) => [
                ...prev,
                {
                    id: createdProduct.id!,
                    name: createdProduct.name,
                    description: createdProduct.description,
                    price: createdProduct.price,
                    category: createdProduct.category,
                    imageUrl: createdProduct.image // Ensure this is base64
                }
            ]);

            resetForm();
        } catch (error) {
            console.error("Error adding plate:", error);
            alert("Something went wrong while adding the plate.");
        }
    };

    const startEditPlate = (plate: Plate) => {
        setEditId(plate.id);
        setNewName(plate.name);
        setNewDescription(plate.description);
        setNewPrice(plate.price.toString());
        setNewCategory(plate.category);
        setNewImageUrl(plate.imageUrl); // Load existing base64 image
        setShowAddForm(true);
    };

    const saveEditPlate = async () => {
        if (!editId) return;

        if (!newName.trim() || !newPrice.trim() || isNaN(Number(newPrice))) {
            alert("Please enter a valid name and price.");
            return;
        }

        const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
        if (!restaurantId) {
            alert("Restaurant ID not found.");
            return;
        }

        try {
            await CreateRestaurantCategory({
                name: newCategory,
                restaurantId: restaurantId
            });

            const updatedProduct = await updateProductById(editId, {
                name: newName.trim(),
                description: newDescription.trim(),
                price: Number(newPrice),
                image: newImageUrl || "", // Send base64 image
                category: newCategory,
                restaurantUser: {
                    idRestaurante: restaurantId
                }
            });

            setPlates((prev) =>
                prev.map((plate) =>
                    plate.id === editId
                        ? {
                            ...plate,
                            name: updatedProduct.name,
                            description: updatedProduct.description,
                            price: updatedProduct.price,
                            category: updatedProduct.category,
                            imageUrl: updatedProduct.image // Ensure this is base64
                        }
                        : plate
                )
            );

            resetForm();
        } catch (error) {
            console.error("Error updating plate:", error);
            alert("Something went wrong while updating the plate.");
        }
    };

    const deletePlate = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this plate?")) return;

        try {
            await deleteProductById(id);
            setPlates((prev) => prev.filter((plate) => plate.id !== id));
        } catch (error) {
            console.error("Error deleting plate:", error);
            alert("Failed to delete plate.");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
            if (!restaurantId) {
                alert("Restaurant ID not found.");
                return;
            }

            try {
                const products = await fetchProductsByRestaurant(restaurantId);
                const transformed = products.map((p) => ({
                    ...p,
                    imageUrl: p.image, // Correctly map 'image' from backend to 'imageUrl'
                }));
                setPlates(transformed);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div
            className="max-w-4xl mx-auto p-12 rounded-3xl shadow-2xl space-y-16" // Increased padding, rounded, shadow, and spacing
            style={{ backgroundColor: "#FDFDFD", fontFamily: "'Inter', sans-serif", color: "#222831" }} // Lighter background, refined text color
        >
            {/* Elegant Floral Accent */}
            <div className="mb-10 flex justify-center"> {/* Increased margin-bottom */}
                <svg
                    width="200" // Even larger
                    height="35" // Even larger
                    viewBox="0 0 180 30"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                    className="text-gray-600 opacity-70" // Slightly softer color, more transparent
                >
                    <path
                        d="M2 15C10 0 25 25 45 15C65 5 80 28 90 15C100 2 115 25 135 15C155 5 170 25 178 15"
                        stroke="currentColor"
                        strokeWidth="2.5" // Slightly thicker
                        strokeLinecap="round"
                    />
                </svg>
            </div>

            <h2 className="text-6xl font-extrabold text-center tracking-tight mb-12 text-gray-900 leading-tight" // Even larger, tighter tracking, better line-height
                style={{ fontFamily: "'Playfair Display', serif" }}
            >
                Our Exquisite Menu
            </h2>

            {categories.map((category) => {
                const platesInCategory = plates.filter((p) => p.category === category);
                // Only hide if no plates AND not in edit mode (so you can add to an empty category)
                if (platesInCategory.length === 0 && editId === null) return null;

                return (
                    <div key={category} className="mb-16"> {/* More bottom margin */}
                        <h3 className="text-4xl font-bold mb-8 text-gray-800 border-b-2 border-gray-400 pb-3 flex items-center justify-between group cursor-pointer hover:border-blue-300 transition-all duration-300" // Larger, bolder, interactive heading
                            style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                            <span>{category}</span>
                            {/* Animated arrow icon */}
                            <svg
                                className="w-6 h-6 text-gray-500 ml-3 transition-transform duration-300 group-hover:translate-x-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                            </svg>
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"> {/* More columns for larger screens, increased gap */}
                            {platesInCategory.map((plate) => (
                                <div
                                    key={plate.id}
                                    className="flex flex-col items-center bg-white border border-gray-200 rounded-2xl p-8 shadow-xl transition-all duration-300 hover:shadow-2xl hover:border-blue-300 transform hover:-translate-y-1" // Enhanced card styling, hover effect
                                >
                                    <div className="w-40 h-40 flex-shrink-0 rounded-xl overflow-hidden border-2 border-gray-200 shadow-lg mb-6"> {/* Larger image container */}
                                        {plate.imageUrl ? (
                                            <img
                                                src={plate.imageUrl}
                                                alt={plate.name}
                                                className="object-cover w-full h-full transform transition-transform duration-300 hover:scale-105" // Image hover effect
                                                onError={(e) => {
                                                    e.currentTarget.src = PLACEHOLDER_IMAGE_URL;
                                                }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-500 text-sm italic bg-gray-50 rounded-xl"> {/* Softer "No Image" placeholder */}
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center mb-6"> {/* Centered text, increased margin */}
                                        <h4 className="text-3xl font-bold text-gray-900 mb-2 leading-snug" style={{ fontFamily: "'Playfair Display', serif" }}>{plate.name}</h4> {/* Larger, bolder, better line-height */}
                                        <p className="text-base text-gray-600 mb-3 leading-relaxed">{plate.description}</p> {/* Larger description */}
                                        <p className="text-3xl font-extrabold text-blue-700 mt-4">${plate.price.toFixed(2)}</p> {/* Even larger, bolder price */}
                                    </div>

                                    {/* Delete & Edit buttons */}
                                    <div className="flex flex-col space-y-4 w-full px-4"> {/* Full width, more space */}
                                        <button
                                            onClick={() => startEditPlate(plate)}
                                            className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg flex items-center justify-center text-lg" // Larger, bolder, rounded buttons
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.38-2.828-2.829z" />
                                            </svg>
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deletePlate(plate.id)}
                                            className="bg-red-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-red-700 transition-all duration-300 shadow-lg flex items-center justify-center text-lg" // Larger, bolder, rounded buttons
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="border-t-2 border-gray-300 border-opacity-70 mt-16" /> {/* More margin below HR */}
                    </div>
                );
            })}

            {/* Add / Edit Plate Section */}
            {showAddForm ? (
                <div className="bg-white rounded-3xl shadow-xl p-10 mb-12 mt-12 border border-gray-300"> {/* Even larger padding, rounded, shadow */}
                    <h3 className="text-4xl font-bold mb-8 text-gray-800" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {editId ? "Edit Plate Details" : "Add a New Dish"} {/* More descriptive titles */}
                    </h3>

                    <input
                        type="text"
                        placeholder="Plate Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="block w-full border border-gray-300 rounded-xl mb-6 p-4 text-gray-700 placeholder-gray-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 text-lg" // Larger padding, bolder focus
                    />

                    <textarea
                        placeholder="Delicious Description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="block w-full border border-gray-300 rounded-xl mb-6 p-4 text-gray-700 placeholder-gray-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 text-lg"
                        rows={5} // More rows
                    />

                    <input
                        type="number"
                        step="0.01"
                        placeholder="Price (e.g., 15.99)"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="block w-full border border-gray-300 rounded-xl mb-6 p-4 text-gray-700 placeholder-gray-400 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 text-lg"
                    />

                    <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="block w-full border border-gray-300 rounded-xl mb-6 p-4 text-gray-700 focus:ring-4 focus:ring-blue-200 focus:border-blue-400 transition-all duration-300 bg-white text-lg appearance-none" // Larger text, custom arrow
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    {/* Image upload for form */}
                    <div className="mb-8"> {/* Increased margin */}
                        <label htmlFor="file-upload" className="block text-base font-medium text-gray-700 mb-3"> {/* Larger label */}
                            Upload Plate Image
                        </label>
                        <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-base text-gray-600
                                       file:mr-4 file:py-3 file:px-6
                                       file:rounded-xl file:border-0
                                       file:text-base file:font-semibold
                                       file:bg-blue-100 file:text-blue-800
                                       hover:file:bg-blue-200 transition-all duration-300" // Larger, more styled file input
                        />
                    </div>

                    {newImageUrl && (
                        <div className="mb-8 w-48 h-48 border-4 border-gray-300 rounded-xl overflow-hidden shadow-md flex items-center justify-center"> {/* Even larger preview */}
                            <img src={newImageUrl} alt="Preview" className="object-cover w-full h-full" />
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mt-10"> {/* More spacing */}
                        <button
                            onClick={editId ? saveEditPlate : addPlate}
                            className="bg-green-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-green-700 transition-all duration-300 shadow-xl flex-1 text-xl" // Larger, bolder, more prominent
                        >
                            {editId ? "Save Changes" : "Add Dish"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="bg-gray-300 text-gray-800 px-10 py-4 rounded-xl font-semibold hover:bg-gray-400 transition-all duration-300 shadow-md flex-1 text-xl" // Larger, softer, more prominent
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-blue-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all duration-300 shadow-xl text-2xl mt-16" // Largest, most prominent "Add" button
                >
                    + Add New Dish
                </button>
            )}
        </div>
    );
};

export default Menu;
