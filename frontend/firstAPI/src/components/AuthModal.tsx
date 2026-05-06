import type React from "react"
import { useEffect, useState } from "react"
import { useAuth } from "../hooks/useAuth"

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialMode?: 'login' | 'register';
}

export default function AuthModal({isOpen, onClose, initialMode = 'login'}: AuthModalProps){
    const [isLogin, setIsLogin] = useState(initialMode === 'login');
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [loading, setLoading] = useState(false)

    const {login} = useAuth();

    useEffect(() => {
        setIsLogin(initialMode === 'login');
    }, [initialMode, isOpen]);

    if(!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const endpoint = isLogin ? '/api/users/login' : '/api/users/registration';
        const body = isLogin ? {email, password} : {email, password, name};

        try {
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });
            const data = await response.json();
            if(response.ok){
                login(data.token, data.user)
                onClose()
            } else {
                alert(data.message || 'Authentication failed')
            }
        } catch (e) {
            alert('Server connection error')
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-x" onClick={onClose}>&times;</button>
                <h2>{isLogin ? 'Login' : 'Registration'}</h2>

                <form onSubmit={handleSubmit}>
                    {isLogin ? (
                        /* Login Form */
                        <div className="form-group">
                            <input 
                                type="email" 
                                value={email}
                                placeholder="email@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input 
                                type="password" 
                                value={password}
                                placeholder="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Loading...' : 'Login'}
                            </button>
                        </div>
                    ) : (
                        /* Registration Form */
                        <div className="form-group">
                            <input 
                                type="text" 
                                value={name}
                                placeholder="Your Name"
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                            <input 
                                type="email" 
                                value={email}
                                placeholder="email@example.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <input 
                                type="password" 
                                value={password}
                                placeholder="Create password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button type="submit" disabled={loading}>
                                {loading ? 'Creating account...' : 'Register'}
                            </button>
                        </div>
                    )}
                </form>

                <div className="modal-footer">
                    <p>
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <span className="toggle-link" onClick={() => setIsLogin(!isLogin)}>
                            {isLogin ? 'Register' : 'Login'}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    )
}