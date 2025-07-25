import React, { useState, ChangeEvent, useEffect } from "react";
import {
    CreateRestaurantCategory, AddProductByRestaurant, fetchProductsByRestaurant, updateProductById,
    deleteProductById } from "../utils/RestaurantApi.ts";
import { Toaster, toast } from 'sonner';
import { useConfirm } from "../components/ConfirmDialog.tsx";

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
    const [newImageUrl, setNewImageUrl] = useState<string>("");
    const [imageFile, setImageFile] = useState<File | null>(null);

    // Edit mode state
    const [editId, setEditId] = useState<string | null>(null);

    // Common for both Add and Edit
    const resetForm = () => {
        setNewName("");
        setNewDescription("");
        setNewPrice("");
        setNewCategory(categories[0]);
        setNewImageUrl("");
        setImageFile(null);
        setEditId(null);
        setShowAddForm(false);
    };

    const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);

            // Create preview URL
            const previewUrl = URL.createObjectURL(file);
            setNewImageUrl(previewUrl);
        }
    };

    const convertFileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                resolve(reader.result as string);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const addPlate = async () => {
        if (!newName.trim()) {
            toast.error("Name is required.");
            return;
        }
        if (!newDescription.trim()) {
            toast.error("Description is required.");
            return;
        }
        if (!newPrice.trim() || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
            toast.error("Please enter a valid positive number for the price.");
            return;
        }
        if (!newCategory) {
            toast.error("Category is required.");
            return;
        }



        const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
        if (!restaurantId) {
            toast.error("Restaurant ID not found.");
            return;
        }

        try {
            // Create category first
            await CreateRestaurantCategory({
                name: newCategory,
                restaurantId: restaurantId
            });

            // Convert image to base64 if file exists
            let imageBase64 = "";
            if (imageFile) {
                imageBase64 = await convertFileToBase64(imageFile);
            }

            const createdProduct = await AddProductByRestaurant({
                name: newName.trim(),
                description: newDescription.trim(),
                price: Number(newPrice),
                image: imageBase64,
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
                    imageUrl: createdProduct.image
                }
            ]);

            resetForm();
        } catch (error) {
            console.error("Error adding plate:", error);
            toast.error("Something went wrong while adding the plate.");
        }
    };

    const startEditPlate = (plate: Plate) => {
        setEditId(plate.id);
        setNewName(plate.name);
        setNewDescription(plate.description);
        setNewPrice(plate.price.toString());
        setNewCategory(plate.category);
        setNewImageUrl(plate.imageUrl);
        setImageFile(null); // Reset file input for edit mode
        setShowAddForm(true);
    };

    const saveEditPlate = async () => {
        if (!editId) return;

        if (!newName.trim()) {
            toast.error("Name is required.");
            return;
        }
        if (!newDescription.trim()) {
            toast.error("Description is required.");
            return;
        }
        if (!newPrice.trim() || isNaN(Number(newPrice)) || Number(newPrice) <= 0) {
            toast.error("Please enter a valid positive number for the price.");
            return;
        }
        if (!newCategory) {
            toast.error("Category is required.");
            return;
        }


        const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
        if (!restaurantId) {
            toast.error("Restaurant ID not found.");
            return;
        }

        try {
            // Create category first
            await CreateRestaurantCategory({
                name: newCategory,
                restaurantId: restaurantId
            });

            // Convert image to base64 if new file exists, otherwise keep existing image
            let imageBase64 = newImageUrl;
            if (imageFile) {
                imageBase64 = await convertFileToBase64(imageFile);
            }

            const updatedProduct = await updateProductById(editId, {
                name: newName.trim(),
                description: newDescription.trim(),
                price: Number(newPrice),
                image: imageBase64,
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
                            imageUrl: updatedProduct.image
                        }
                        : plate
                )
            );

            resetForm();
        } catch (error) {
            console.error("Error updating plate:", error);
            toast.error("Something went wrong while updating the plate.");
        }
    };

    const confirm = useConfirm();

    const deletePlate = async (id: string) => {
        const confirmed = await confirm("Are you sure you want to delete this plate?");
        if (!confirmed) return;

        try {
            await deleteProductById(id);
            setPlates((prev) => prev.filter((plate) => plate.id !== id));
            toast.success("Plate deleted successfully.");
        } catch (error) {
            console.error("Error deleting plate:", error);
            toast.error("Failed to delete plate.");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            const restaurantId = JSON.parse(localStorage.getItem("userInfo") || "{}")?.id;
            if (!restaurantId) {
                toast.error("Restaurant ID not found.");
                return;
            }

            try {
                const products = await fetchProductsByRestaurant(restaurantId);
                setPlates(products);
            } catch (error) {
                console.error("Error fetching products:", error);
            }
        };

        fetchProducts();
    }, []);

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

            {categories.map((category) => {
                const platesInCategory = plates.filter((p) => p.category === category);
                if (platesInCategory.length === 0) return null;

                return (
                    <div key={category} className="mb-10">
                        <h3 className="text-2xl font-serif italic mb-4 border-l-4 border-black pl-3">
                            {category}
                        </h3>

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
                                            <img src={plate.imageUrl} alt={plate.name} className="object-cover w-full h-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-gray-400 text-xs italic">
                                                No Image
                                            </div>
                                        )}
                                    </div>

                                    {/* Delete & Edit buttons */}
                                    <div className="ml-4 flex flex-col space-y-2">
                                        <button
                                            onClick={() => startEditPlate(plate)}
                                            className="bg-yellow-400 text-black font-serif italic px-4 py-1 rounded hover:bg-yellow-500 transition"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deletePlate(plate.id)}
                                            className="bg-red-600 text-white font-serif italic px-4 py-1 rounded hover:bg-red-700 transition"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <hr className="border-t border-black border-opacity-30 mt-8" />
                    </div>
                );
            })}

            {/* Add / Edit Plate Section */}
            {showAddForm ? (
                <div className="bg-white rounded-lg shadow-md p-6 mb-12 mt-6 border border-black">
                    <h3 className="text-xl font-serif italic mb-4">{editId ? "Edit Plate" : "Add New Plate"}</h3>

                    <input
                        type="text"
                        placeholder="Name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="block w-full border border-black rounded mb-3 p-2 font-serif italic"
                    />

                    <textarea
                        placeholder="Description"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        className="block w-full border border-black rounded mb-3 p-2 font-serif italic"
                        rows={3}
                    />

                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Price"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        className="block w-full border border-black rounded mb-3 p-2 font-serif italic"
                    />

                    <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="block w-full border border-black rounded mb-3 p-2 font-serif italic"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <div className="mb-4">
                        <label className="block text-sm font-serif italic mb-2">
                            Image
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full border border-black rounded p-2"
                        />
                    </div>

                    {newImageUrl && (
                        <div className="mb-4">
                            <p className="text-sm font-serif italic mb-2">Preview:</p>
                            <div className="w-32 h-32 border border-black rounded overflow-hidden">
                                <img src={newImageUrl} alt="Preview" className="object-cover w-full h-full" />
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3">
                        <button
                            onClick={editId ? saveEditPlate : addPlate}
                            className="bg-black text-white px-6 py-2 rounded font-serif italic hover:bg-gray-800 transition"
                        >
                            {editId ? "Save Changes" : "Add Plate"}
                        </button>
                        <button
                            onClick={resetForm}
                            className="bg-gray-300 text-black px-6 py-2 rounded font-serif italic hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => setShowAddForm(true)}
                    className="bg-black text-white px-6 py-3 rounded font-serif italic hover:bg-gray-800 transition"
                >
                    Add New Plate
                </button>
            )}
        </div>
    );
};

export default Menu;