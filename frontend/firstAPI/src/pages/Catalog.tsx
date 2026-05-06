import ProductCard from '../components/ProductCard'
import { useState, useEffect } from 'react'
import type { Product } from '../types/Product'
import { getProducts } from '../api/productApi'
import { useAuth } from '../hooks/useAuth'
import ProductModal from '../components/ProductModal'

function Catalog(){
    const [products, setProducts] = useState<Product[]>([])
    const [availableCategories, setAvaiableCategories] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setModalOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product>()
    const {user} = useAuth();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    async function fetchCategories(){
        try{
            const res = await fetch(`http://localhost:3000/api/products/categories`);
            const data = await res.json();
            setAvaiableCategories(data);
        } catch(err){
            console.error('failed to load categories', err)
        }
    }

    async function fetchProducts() {
        const queryParams = new URLSearchParams({
            search,
            minPrice,
            maxPrice,
            category
        }).toString();
        const res = await fetch(`http://localhost:3000/api/products?${queryParams}`);
        const data = await res.json();
        setProducts(data);
    }

    async function handleDeleteProduct(id: number){
        try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: "DELETE",
            headers:  {"Authorization": `Bearer ${localStorage.getItem('token')}`}
        });
        if (!response.ok) throw new Error("Failed to delete product")

        setProducts(prev => prev.filter(p=> p.id !==id))
        } catch (error) {
        console.error("Error: ", error)
        }
    }

    const handleCreateProduct = () => {
        setSelectedProduct(undefined);
        setModalOpen(true);
    };

    const handleEditProduct = (product: Product) =>{
        setSelectedProduct(product);
        setModalOpen(true);
    }


    useEffect(()=> {
        fetchCategories()
        const delayDebounceFn = setTimeout(()=>{
            fetchProducts()
        }, 500);
        return () => clearTimeout(delayDebounceFn)
    }, [search, minPrice, maxPrice, category])



    return (
        <div className="catalog-page">
            <h1 className="catalog-title">Catalog</h1>
            
            <div className="catalog-container">
                {/* Секция фильтров */}
                <div className="filters-bar">
                    <div className="filter-group">
                        <select 
                            value={category} 
                            onChange={(e) => setCategory(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">All categories</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                </option>
                            ))}
                        </select>
                        {category && (
                            <button className="btn-reset" onClick={() => setCategory('')}>
                                Reset
                            </button>
                        )}
                    </div>

                    <div className="search-group">
                        <input 
                            type="text"
                            placeholder='Search by name...'
                            value={search}
                            onChange={(e)=> setSearch(e.target.value)}
                            className="filter-input search-input"
                        />
                        <div className="price-inputs">
                            <input 
                                type="number"
                                placeholder='From'
                                value={minPrice}
                                onChange={(e)=> setMinPrice(e.target.value)}
                                className="filter-input price-input"
                            />
                            <input 
                                type="number"
                                placeholder='To'
                                value={maxPrice}
                                onChange={(e)=> setMaxPrice(e.target.value)}
                                className="filter-input price-input"
                            />
                        </div>
                    </div>
                </div>

                {/* Сетка товаров */}
                <div className="products-grid">
                    {products?.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product}
                            onDelete={handleDeleteProduct}
                            onEdit={() => handleEditProduct(product)}
                        />
                    ))}     
                </div>
            </div>
            
            {user?.role === 'admin' && (
                <button className='btn-create-fixed' onClick={handleCreateProduct}>
                    <span>+</span> New Product
                </button>
            )}

            <ProductModal 
                isOpen={isModalOpen} 
                onClose={() => setModalOpen(false)}
                product={selectedProduct}
                onRefresh={fetchProducts}
            />
        </div>
    );
}

export default Catalog