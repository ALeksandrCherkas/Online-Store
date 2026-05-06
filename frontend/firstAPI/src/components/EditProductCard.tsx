import type { Product } from "../types/Product";
import { useState } from "react";

type EditProductFromProps = {
    onProductEdit: (product: Product) => void
}

function EditProductForm({onProductEdit}: EditProductFromProps){
        const [title, setTitle] = useState("")
        const [description, setDescription] = useState("")
        const [price, setPrice] = useState(0)
        const [loading, setLoading] = useState(false)


        return (
        <div>
            <h2>Edit product</h2>
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
            <button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
            </button>
        </div>
    )
}


export default EditProductForm