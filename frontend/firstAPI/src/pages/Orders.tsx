import React, {useState, useEffect} from "react";

interface Order {
    id: number;
    total_price: number;
    status: string;
    created_at: string;
}

const Orders = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        const token = localStorage.getItem('token')
        try{
            const response = await fetch(`http://localhost:3000/api/orders`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
           });
           if (response.ok) {
            const data = await response.json()
            setOrders(data)
           }
        } catch (error) {
            console.error("Error: ", error)
        } finally {
            setLoading(false)
        }
    };

    useEffect(()=>{
        fetchOrders();
    }, []);
    if (loading){
        return <div style={{padding:'20px'}}>Loading...</div>
    }

    return (
        <div style= {{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
            <h1>Orders</h1>
            {orders.length === 0 ? (
                <p>No orders found</p>
            ) : (
                <div style={{display:'flex', flexDirection: 'column', gap: '15px'}}>
                    {orders.map(order => (
                        <div key={order.id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: '#f9f9f9'
                        }}>
                            <div>
                                <h3 style={{margin: '0 0 10px 0'}}>Order№ {order.id}</h3>
                                <p style={{margin:'5px 0', color: '#666'}}>Date: {new Date(order.created_at).toLocaleString()}</p>
                                <p style={{margin: '5px 0', fontWeight: 'bold'}}>Status: <span style={{
                                    color: order.status === 'pending' ? '#f39c12' : '#27ae60',
                                    textTransform: 'uppercase',
                                    fontSize: '0.8rem'
                                }}>{order.status}
                                    </span>
                                </p>
                            </div>
                            <div style={{textAlign:'right'}}>
                                <span style={{fontSize: '1.2rem', fontWeight: 'bold', color: '#2c3e50'}}>
                                    {order.total_price} $
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Orders;