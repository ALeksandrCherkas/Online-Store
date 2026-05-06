import { createContext, useState, useEffect} from "react";
import type { ReactNode } from "react";
import {jwtDecode} from "jwt-decode";


interface AuthTypeContext{
    user: any
    login: (token: string, userData: any) => void
    logout: ()=> void
    isAuth: boolean
    isLoading: boolean
}

export const AuthContext = createContext<AuthTypeContext | null>(null);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [user, setUser] = useState(null)
    const [isLoading, setIsLoading] = useState(true)
    

    useEffect(()=>{
        const savedToken = localStorage.getItem('token')
        if(savedToken){
            try {
                const decoded: any = jwtDecode(savedToken)
                const currentTime = Date.now() / 1000
                if(decoded.exp > currentTime){
                    setUser(decoded)
                }else{
                    logout()
                }
            } catch (error) {
                logout()
            }
        }
        setIsLoading(false)
    }, []);

    const login = (token: string, userData: any) => {
        localStorage.setItem('token', token)
        setUser(userData)
    }

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value = {{user, login, logout, isAuth: !!user, isLoading}}>
            {children}
        </AuthContext.Provider>
    )
}