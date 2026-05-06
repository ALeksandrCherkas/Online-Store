import React, {useState, useEffect} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useBasket } from "../context/BasketContext";
import AuthModal from "./AuthModal";

const Navbar = () => {
    const {isAuth, user, logout} = useAuth();
    const navigate = useNavigate();
    const {basketCount} = useBasket();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

    const openLogin = () => {
        setAuthMode('login');
        setIsAuthModalOpen(true);
    }
    const openRegister = () => {
        setAuthMode('register');
        setIsAuthModalOpen(true);
    }

    const handleLogout= () => {
        logout()
    }


    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <div className="navbar-left">
                        <Link to="/catalog" className="catalog-link">Catalog</Link>
                    </div>

                    <div className="navbar-right">
                    {isAuth ? (
                        <>
                        <Link to="/basket" className="basket-wrapper">
                            <span>🛒</span>
                            {basketCount > 0 && <span className="badge">{basketCount}</span>}
                        </Link>
                        <Link to="/orders">Orders</Link>
                        <div className="user-info">
                            <p className="username">Hello, <span>{user?.name || 'Guest'}</span></p>
                            <button className="btn-logout" onClick={handleLogout}>Logout</button>
                        </div>
                        </>
                    ) : (
                        <div className="auth-group">
                            <button className="btn-login" onClick={openLogin} style={{marginRight: '10px'}}>Login</button>
                            <button className="btn-register" onClick={openRegister}>Registration</button>
                        </div>
                    )}
                    </div>
                </div>
            </nav>
            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)} 
                initialMode={authMode}
            />
        </>
        
    );
}

export default Navbar