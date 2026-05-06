import React, {useState, useEffect} from "react";
import type {Product} from "../types/Product";

type ProductModalProps = {
    isOpen: boolean;
    onClose: () => void;
    product? : Product
    onRefresh: () => void
}

export default function ProductModal({isOpen, onClose, product, onRefresh}: ProductModalProps){
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [fullDescription, setFullDescription] = useState("")
    const [category, setCategory] = useState("")
    const [previews, setPreviews] = useState<string[]>([])
    const [existingImages, setExistingImages] = useState<{ id: number; image_url: string }[]>([])
    const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])

    useEffect(()=>{
        if(product){
            setTitle(product.title);
            setDescription(product.description);
            setPrice(product.price);
            setFullDescription(product.full_description || "");
            setCategory(product.category || "other");
            // Для существующих картинок показываем их URL с бэкенда
            if (product.images) {
                setPreviews(product.images.map(img => `http://localhost:3000${img.image_url}`));
            }
            setExistingImages(product.images || []);
            setDeletedImageIds([]);
            setPreviews([]);
            setImages([]);
        } else {
            setTitle("")
            setDescription("")
            setPrice(0)
            setCategory("")
            setFullDescription("")
            setImages([])
            setPreviews([])
            setExistingImages([]);
            setDeletedImageIds([]);
        }
    }, [product, isOpen])


    const handleDeleteExistingImage = (id: number) => {
        setDeletedImageIds(prev => [...prev, id]);
        setExistingImages(prev => prev.filter(img => img.id !== id));
    }

    const handleRemoveNew = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    }

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        setImages(files);
        const filePreviews = files.map(file => URL.createObjectURL(file));
        setPreviews(filePreviews);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");

        try {
            const method = product ? "PUT" : "POST";
            const url = product 
                ? `http://localhost:3000/api/products/${product.id}` 
                : "http://localhost:3000/api/products";
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    title,
                    description,
                    price,
                    full_description: fullDescription,
                    category
                })
            });
            if (product && deletedImageIds.length > 0) {
                await Promise.all(deletedImageIds.map(id => 
                    fetch(`http://localhost:3000/api/products/images/${id}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }})
                ));
            }

            if(!response.ok) throw new Error("Failed to save product");

            const savedProduct = await response.json();
            const productId = product ? product.id : savedProduct.id;

            if(images.length > 0){
                const formData = new FormData();
                images.forEach(file => formData.append("images", file));

                await fetch(`http://localhost:3000/api/products/${productId}/images`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });
            }

            onRefresh();
            onClose();
        } catch (error) {
            console.error("Error: ", error);
            alert("Failed to save product");
        } finally {setLoading(false)}
    };

    if (!isOpen) return null

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content admin-modal" onClick={e => e.stopPropagation()}>
                <button className="close-x" onClick={onClose}>&times;</button>
                <h2>{product ? 'Edit Product' : 'Create Product'}</h2>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-main">
                        <div className="upload-section">
                            <label className="file-label">
                                <span>+ Add More Photos</span>
                                <input type="file" multiple onChange={handleFilesChange} hidden />
                            </label>

                            <div className="preview-grid">
                                {/* Сначала рендерим уже имеющиеся в базе фото */}
                                {existingImages.map((img) => (
                                    <div key={img.id} className="preview-item">
                                        <img src={`http://localhost:3000${img.image_url}`} alt="existing" />
                                        <button type="button" className="remove-badge" onClick={() => handleDeleteExistingImage(img.id)}>&times;</button>
                                        <span className="status-badge stored">Saved</span>
                                    </div>
                                ))}

                                {/* Затем рендерим те, что юзер только что выбрал */}
                                {previews.map((p, idx) => (
                                    <div key={idx} className="preview-item">
                                        <img src={p} alt="new preview" />
                                        <button type="button" className="remove-badge" onClick={() => handleRemoveNew(idx)}>&times;</button>
                                        <span className="status-badge new">New</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="inputs-section">
                            <label>Title</label>
                            <input value={title} onChange={e => setTitle(e.target.value)} required />
                            
                            <div className="row">
                                <div>
                                    <label>Price (₽)</label>
                                    <input type="number" value={price} onChange={e => setPrice(Number(e.target.value))} required />
                                </div>
                                <div>
                                    <label>Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value)}>
                                        <option value="electronics">Electronics</option>
                                        <option value="clothing">Clothing</option>
                                        <option value="home">Home</option>
                                        <option value="books">Books</option>
                                        <option value="sports">Sports</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <label>Short Description</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} required />
                            
                            <label>Full Description</label>
                            <textarea value={fullDescription} onChange={e => setFullDescription(e.target.value)} rows={4} required />
                        </div>
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel" disabled={loading}>Cancel</button>
                        <button type="submit" className="btn-save" disabled={loading}>
                            {loading ? 'Saving...' : product ? 'Update' : 'Create'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}