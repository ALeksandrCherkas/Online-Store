import React, {use, useEffect, useState} from "react";
import type { Product } from '../types/Product';
import { useBasket } from "../context/BasketContext";
import { useNavigate } from "react-router-dom";


interface BasketItem extends Product {
    quantity: number
    basket_item_id: number
}

const Basket = () => {
    const [items, setItems] = useState<BasketItem[]>([])
    const [loading, setLoading] = useState(true)
    const {refreshBasket} = useBasket();
    const navigate = useNavigate();
    
    const fetchBasket = async () => {
        const token = localStorage.getItem('token')
        try{
            const response = await fetch(`http://localhost:3000/api/basket`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            const data = await response.json()
            setItems(data)
            } catch (error) {
            console.error("Error: ", error)
        } finally {
            setLoading(false)
        }            
    }

    const removeItem = async (productId: number) => {
        const token = localStorage.getItem('token')
        await fetch(`http://localhost:3000/api/basket/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        setItems(prev => prev.filter(item => item.basket_item_id !== productId))
        console.log(items)
    };

    const updateQuantity = async (basketItemId: number, quantity: number) => {
        if (quantity < 1) return;
        const token = localStorage.getItem('token')
        try{
            const res = await fetch(`http://localhost:3000/api/basket/${basketItemId}`, {
                method: "PATCH",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({quantity})
            });
            if (!res.ok){
                throw new Error("Failed to update quantity")
            }

            const updatedData = await res.json()
            setItems(prev => prev.map(item => 
                item.basket_item_id === basketItemId ? {...item, quantity: updatedData.quantity} : item   
            ));
        } catch (err) {
            console.error("Error: ", err)
        }
    }

    const handleCheckout = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch(`http://localhost:3000/api/order`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })
            if (res.ok) {
                alert('Order placed');
                await refreshBasket();
                navigate('/catalog');
            } else {
                alert('Failed to place order');
            }
        } catch (err) {
            console.error("Error: ", err);
        }
    }


    useEffect(() => {
        fetchBasket()
    }, [])

    if (loading){
        return <div>Loading...</div>
    }

    return (
        <div>
            <h1>Basket</h1>
            {items.length === 0 ? (
                <p>Basket is empty</p>
            ) : (
                <div>
                    {items.map(item => (
                        <div key={item.id} style ={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '20px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '10px'
                        }}>
                            <img src={`http://localhost:3000${item.images[0]?.image_url}`} alt={item.title}
                                style={{
                                    width: '80px', height: '80px', objectFit: 'contain', borderRadius: '8px'
                                }}/>
                            <div>
                                <h3>{item.title}</h3>
                                <p>{item.price} $ x {item.quantity}</p>
                            </div>
                            <button onClick={()=> removeItem(item.basket_item_id)} style={{background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer'}}>Delete</button>
                            <div style={{ marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                            Итого: {items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                            </div>
                            <button onClick={() => updateQuantity(item.basket_item_id, item.quantity - 1)}>-</button>
                            <span>{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.basket_item_id, item.quantity + 1)}>+</button>
                        </div>
                    ))}
                </div>
            )}
            {items.length > 0 && (
                <div style={{ 
                    marginTop: '30px', 
                    padding: '20px', 
                    borderTop: '2px solid #333', 
                    textAlign: 'right' 
                }}>
                    <h2 style={{ margin: 0 }}>
                        Общая сумма: {items.reduce((sum, item) => sum + (item.price * item.quantity), 0)} ₽
                    </h2>
                    <button onClick={handleCheckout} style={{
                        marginTop: '15px',
                        padding: '12px 24px',
                        background: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '1.1rem',
                        cursor: 'pointer'
                    }}>
                        Оформить заказ
                    </button>
                </div>
            )}
        </div>
    ) 
}

export default Basket;