import React, {createContext, useState, useEffect, useContext} from "react";
import { useAuth } from "../hooks/useAuth";

interface BasketContextType{
    basketItems: any[];
    basketCount: number;
    refreshBasket: () => Promise<void>;
    addToBasket: (productId: number) => Promise<void>;
}

const BasketContext = createContext<BasketContextType | undefined>(undefined);

export const BasketProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
    const [basketItems, setBasketItems] = useState<any[]>([]);
    const {isAuth} = useAuth();

    const addToBasket = async (productId: number) => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error("User not authenticated");
            return;
        }
        try{
            const response = await fetch(`http://localhost:3000/api/basket`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ productId })
            });
            if (!response.ok) throw new Error("Ошибка при добавлении в корзину");
            await refreshBasket();
        } catch (error) {
            console.error("Error adding to basket: ", error);
        }
    }

    const refreshBasket = async () => {
        const token = localStorage.getItem('token')
        if (!token || !isAuth) return;

        try{
            const response = await fetch(`http://localhost:3000/api/basket`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json()
                setBasketItems(data)
            }
        } catch (error) {
            console.error("Error: ", error)
        }
    
    }
    useEffect(() => {
        if(isAuth) refreshBasket();
        else setBasketItems([]);
    }, [isAuth]);

    const basketCount = basketItems.reduce((sum, item) => sum + item.quantity, 0);
    return (
        <BasketContext.Provider value={{basketItems, basketCount, refreshBasket, addToBasket}}>
            {children}
        </BasketContext.Provider>
    )
}

export const useBasket = () => {
    const context = useContext(BasketContext);
    if(!context) throw new Error('useBasket must be used within a BasketProvider')
    return context
}