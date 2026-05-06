const db = require('../db')

class BasketController{

    async addToBasket(req,res){
        const userId = req.user.id;
        const {productId} = req.body;

        const newItem = await db.query(
            `INSERT INTO basket_item (user_id, product_id, quantity) VALUES ($1, $2, 1)
            ON CONFLICT (user_id, product_id) DO UPDATE SET quantity = basket_item.quantity + 1
            RETURNING *`,
            [userId, productId]
        );

        res.json(newItem.rows[0]);
    }catch(err){
        console.error(err);
        res.status(500).json({message: 'Error adding item to basket'});
    }

    async getBasket(req,res){
        try{
            const userId = req.user.id;
            const basket = await db.query(`
                SELECT
                    b.id AS basket_item_id, b.quantity, p.*,
                COALESCE(json_agg(pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]') as images
                FROM basket_item b
                JOIN product p ON b.product_id = p.id
                LEFT JOIN product_images pi ON p.id = pi.product_id
                WHERE b.user_id = $1
                GROUP BY b.id, p.id`, [userId]);
            res.json(basket.rows)
        }catch(err){
            console.error(err);
            res.status(500).json({message: 'Error getting basket'});
        }
    }
    async removeFromBasket(req,res){
        try{
            const {productId} = req.params;
            const userId = req.user.id;
            const result = await db.query(`DELETE FROM basket_item WHERE id = $1 AND user_id = $2`, [productId, userId]);
            if (result.rowCount === 0) {
                return res.status(404).json({message: 'Item not found in basket'});
            }
            
            res.json({message: 'Item removed from basket'});
        }catch(err){
            console.error(err);
            res.status(500).json({message: 'Error removing item from basket'});
        }
    }

    async updateQuantity(req,res){
        try{
            const userId = req.user.id;
            const basketItemId = req.params.id;
            const {quantity} = req.body;
            if (quantity < 1) {
                return res.status(400).json({message: 'Quantity must be greater than 0'});
            }
            const result = await db.query(`
                UPDATE basket_item
                SET quantity = $1
                WHERE user_id = $2 AND id = $3
                RETURNING *;`,
                [quantity, userId, basketItemId]);
            if (result.rowCount === 0) {
                return res.status(404).json({message: 'Basket item not found'});
            }
            res.json(result.rows[0]);
        }catch(err){
            console.error(err);
            res.status(500).json({message: 'Error updating basket item'});
        }
    }

}

module.exports = new BasketController();