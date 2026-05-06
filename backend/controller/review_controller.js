const db = require('../db')


class ReviewController{
    async createReview(req, res){
        const {productId, rating, reviewText} = req.body;
        const userId = req.user.id

        try{
            await db.query('BEGIN')

            const newReview = await db.query(
                `INSERT INTO reviews (user_id, product_id, rating, text) VALUES ($1, $2, $3, $4) RETURNING *`,
                [userId, productId, rating, reviewText]
            )

            const productRes = await db.query(
                `SELECT rating, reviews_count FROM product WHERE id = $1`
                , [productId]
            );

            const {rating: oldRating, reviews_count: oldCount} = productRes.rows[0];

            const newCount = oldCount + 1;
            const newRating = (oldRating * oldCount + rating) / newCount;

            await db.query(
                `UPDATE product SET rating = $1, reviews_count = $2 WHERE id = $3`,
                [newRating.toFixed(1), newCount, productId]
            );

            await db.query('COMMIT')
            res.json(newReview.rows[0])
        }
        catch(err){
            await db.query('ROLLBACK')
            console.error(err)
            res.status(500).json({error: 'Internal Server Error'})
        }
    }
    async getReviews(req, res){
        const {productId} = req.query;
        try {
            const reviews = await db.query(
                `SELECT r.id, r.rating, r.text, r.created_at, u.name 
                FROM reviews r 
                JOIN users u ON r.user_id = u.id 
                WHERE r.product_id = $1
                ORDER BY r.created_at DESC`
                , [productId]
            );
            res.json(reviews.rows)
        }
        catch(err){
            console.error(err)
            res.status(500).json({error: 'Internal Server Error'})
        }
    }
    async deleteReview(req, res){

    }
}

module.exports = new ReviewController()