import type { Product } from "../types/Product"
import React, { useState } from "react"
import { useAuth } from "../hooks/useAuth"
import { useBasket } from "../context/BasketContext"
import { Link } from "react-router-dom"

type ProductCardProps = {
    product: Product
    onDelete: (id: number) => void
    onEdit: () => void // Теперь это просто триггер для открытия модалки в Catalog
}

function ProductCard({ product, onDelete, onEdit }: ProductCardProps) {
    const [currentImage, setCurrentImage] = useState(0)
    const { user } = useAuth();
    const [isAdding, setIsAdding] = useState(false)
    const { refreshBasket } = useBasket();

    async function handleAddToBasket() {
        const token = localStorage.getItem('token')
        if (!token) {
            alert('Please login to add to basket')
            return
        }
        setIsAdding(true)
        try {
            const response = await fetch(`http://localhost:3000/api/basket`, {
                method: "POST",
                headers: {
                    "content-type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ productId: product.id })
            });
            if (!response.ok) throw new Error("Failed to add to basket")
            
            await refreshBasket()
            alert("Product added to basket")
        } catch (error) {
            console.error("Error: ", error)
            alert("Failed to add to basket")
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <div className="product-wrapper">
            <div className="product-card">
                <Link to={`/product/${product.id}`} className="image-link">
                    <div className="image-container">
                        {product.images?.length > 0 ? (
                            <img
                                src={`http://localhost:3000${product.images[0].image_url}`}
                                alt={product.title}
                                className="single-product-img"
                            />
                        ) : (
                            <div className="no-image">No Image</div>
                        )}
                    </div>
                </Link>

                <div className="content">
                    <span className="category">{product.category || 'other'}</span>
                    <h3 className="title">{product.title}</h3>

                    <div className="rating">
                        {'★'.repeat(Math.round(product.rating || 0))}
                        {'☆'.repeat(5 - Math.round(product.rating || 0))}
                        <span>({product.rating || 0})</span>
                    </div>

                    <p className="description">{product.description}</p>
                    <p className="price">{product.price.toLocaleString()} ₽</p>
                </div>

                <button className="add-btn" onClick={handleAddToBasket} disabled={isAdding}>
                    {isAdding ? "Adding..." : "Add to basket"}
                </button>

                {user?.role === 'admin' && (
                    <div className="admin-actions">
                        <button className="edit-btn" onClick={onEdit}>Edit</button>
                        <button className="delete-btn" onClick={() => onDelete(product.id)}>Delete</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProductCard;