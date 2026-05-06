import React, { useState } from "react";
import type { Product } from "../types/Product";



type AddProductFormProps = {
    onProductAdded: (product: Product) => void
}

function AddProductForm({onProductAdded}: AddProductFormProps){
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState(0)
    const [loading, setLoading] = useState(false)
    const [images, setImages] = useState<File[]>([])
    const [fullDescription, setFullDescription] = useState("")
    const [category, setCategory] = useState("")



    async function handleFilesCreate(e: React.ChangeEvent<HTMLInputElement>){
        if (!e.target.files) return 
        setImages(Array.from(e.target.files))
    }

    async function handleSubmit(e: React.FormEvent){
        e.preventDefault()
        setLoading(true)

        try{
            const response = await fetch("http://localhost:3000/api/products", {
                method: "POST",
                headers: { "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                 },
                
                body: JSON.stringify({
                    title, 
                    description, 
                    price: Number(price), 
                    full_description: fullDescription, 
                    category})
            });


            if(!response.ok) throw new Error("Failed to create product")

            const newProduct: Product = await response.json()

            if (images.length>0) {
                const formData = new FormData()
                images.forEach(file => formData.append('images', file))
                
                await fetch(`http://localhost:3000/api/products/${newProduct.id}/images`,{
                    method: 'POST',
                    headers: {"Authorization": `Bearer ${localStorage.getItem('token')}`},
                    body: formData
                })
            }
            onProductAdded(newProduct)
            setTitle("")
            setDescription("")
            setPrice(0)
            setCategory('')
            setFullDescription('')
            setImages([])
        } catch (error) {
            console.error("Error: ", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{marginTop: "20px"}}>
            <h2>Create product</h2>
            <input 
                type="file" 
                multiple
                onChange={handleFilesCreate}
            />
            <div>
                <label>Title:</label>
                <input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Description:</label>
                <input 
                    value={description} 
                    onChange={e => setDescription(e.target.value)}
                    required
                />
            </div>

            <div>
                <label>Price:</label>
                <input 
                    type="number"
                    value={price} 
                    onChange={e => setPrice(Number(e.target.value))}
                    required
                />
            </div>
            <div>
                <label>Full description:</label>
                <textarea 
                    value={fullDescription}
                    onChange={e => setFullDescription(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Category:</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option value="electronics">Electronics</option>
                    <option value="clothing">Clothing</option>
                    <option value="home">Home</option>
                    <option value="books">Books</option>
                    <option value="sports">Sports</option>
                    <option value="other">Other</option>
                </select>
            </div>
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
            </button>
        </form>
    )
}

export default AddProductForm