import React, {useState, useEffect} from "react";
import { useParams } from "react-router-dom";
import type {Product} from "../types/Product";
import { useBasket } from "../context/BasketContext";
import { useAuth } from "../hooks/useAuth";

interface Review {
    id: number;
    user_id: number;
    product_id: number;
    rating: number;
    text: string;
    created_at: string;
    name: string;
}

const ProdcutPage: React.FC = () => {
    const {id} = useParams<{id: string}>();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const {addToBasket} = useBasket();
    const [currentImage, setCurrentImage] = useState(0)
    
    const [reviewText, setReviewText] = useState("");
    const [rating, setRating] = useState(0);
    const [sending, setSending] = useState(false);
    const [reviews, setReviews] = useState<Review[]>([]);

    const {user} = useAuth();

    const fetchData = async () => {
        try {
            const productRes = await fetch(`http://localhost:3000/api/products/${id}/`);
            const productData = await productRes.json();
            setProduct(productData);

            const reviewsRes = await fetch(`http://localhost:3000/api/reviews?productId=${id}`);
            const reviewsData = await reviewsRes.json();
            setReviews(reviewsData);
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleSendReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try{
            const res = await fetch(`http://localhost:3000/api/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId: Number(id),
                    rating,
                    reviewText
                })
            });
            if(res.ok){
                setReviewText("");
                setRating(0);
                fetchData();
            }
        } catch (err) {
            console.error("Error: ", err);
        } finally {
            setSending(false);
        }
    }

    

    // useEffect(()=>{
    //     const fetchProduct = async () => {
    //         try{
    //             const res = await fetch(`http://localhost:3000/api/product/${id}/`);
    //             const data = await res.json();
    //             setProduct(data);
    //         } catch (err) {
    //             console.error("Error: ", err);
    //         } finally {
    //             setLoading(false);
    //         }
    //     }
    //     fetchProduct();
    // }, [id]);
    if(loading) return <h2>Loading...</h2>;
    if(!product) return <h2>Product not found</h2>;

    return (
        <div className="product-page-container">
            <div className="product-details-page">
                {/* Левая часть: Изображение */}
                <div className="details-viewer">
                    {(product.images?.length ?? 0) > 0 && (
                        <>
                            <span className="details-nav left" onClick={(e) => {
                                e.preventDefault();
                                setCurrentImage(prev => (prev === 0 ? product.images.length - 1 : prev - 1))
                            }} />
                            <span className="details-nav right" onClick={(e) => {
                                e.preventDefault();
                                setCurrentImage(prev => (prev === product.images.length - 1 ? 0 : prev + 1))
                            }} />
                        </>
                    )}

                    <div className="details-track" style={{ transform: `translateX(-${currentImage * 100}%)` }}>
                        {product.images?.map((img, index) => (
                            <img
                                key={index}
                                className="details-img"
                                src={`http://localhost:3000${img.image_url}`}
                                alt={product.title}
                            />
                        ))}
                    </div>
                </div>

                {/* Правая часть: Описание и покупка */}
                <div className="details-info">
                    <span className="details-category">{product.category}</span>
                    <h1 className="details-title">{product.title}</h1>
                    
                    <div className="details-rating">
                        <div className="details-stars">
                            {'★'.repeat(Math.round(product.rating || 0))}
                            {'☆'.repeat(5 - Math.round(product.rating || 0))}
                        </div>
                        <span className="details-rating-value">{product.rating} / 5</span>
                    </div>

                    <p className="details-description">
                        {product.full_description || product.description}
                    </p>

                    <div className="details-price">
                        {product.price?.toLocaleString()} <span>₽</span>
                    </div>

                    <button className="details-buy-btn" onClick={() => addToBasket(product.id)}>
                        Add to Basket
                    </button>
                </div>
            </div>

            <hr className="section-divider"/>

            <div className="reviews-section">
                <h2>Customer reviews</h2>

                {user ? (
                    <form className="review-form" onSubmit={handleSendReview}>
                        <div className="star-picker">
                            {[1, 2, 3, 4, 5].map(num => (
                                <span 
                                    key={num} 
                                    onClick={() => setRating(num)}
                                    style={{ cursor: 'pointer', fontSize: '1.5rem', color: num <= rating ? '#00d4ff' : '#ccc' }}
                                >
                                    {num <= rating ? '★' : '☆'}
                                </span>
                            ))}
                        </div>
                        <textarea
                            placeholder="Write your review here..."
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={sending}>
                            {sending ? "Sending..." : "Submit Review"}
                        </button>
                    </form>
                ) : (
                    <p className="login-promt">Please log in to leave a review.</p>
                )}

                <div className="reviews-list">
                    {reviews.length > 0 ? reviews.map(rev => (
                        <div key={rev.id} className="review-item">
                            <div className="review-header">
                                {/* Имя автора — жирным, чтобы выделялось */}
                                <span className="review-author">
                                    {rev.name || "Anonymous"}
                                </span>
                                
                                <span className="review-stars">
                                    {'★'.repeat(rev.rating)}
                                    {'☆'.repeat(5 - rev.rating)} {/* Добавил пустые звезды для красоты */}
                                </span>
                                
                                <span className="review-date">
                                    {new Date(rev.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="review-text">{rev.text}</p>
                        </div>
                    )) : <p>No reviews yet. Be the first!</p>}
                </div>
            </div>
        </div> 
    );
}

export default ProdcutPage;