const db = require('../db')

class OrderController{

    async createOrder(req,res){
        const client = await db.connect()
        try{
            await client.query('BEGIN')
            const userId = req.user.id;
            const basketRes = await client.query(
                `SELECT b.*, p.price FROM basket_item b 
                JOIN product p ON b.product_id = p.id 
                WHERE b.user_id = $1`, [userId]
            );
            if (basketRes.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({message: 'Basket is empty'})
            }
            
            const total = basketRes.rows.reduce((sum, item) => sum + Number((item.price * item.quantity)), 0)

            const orderRes = await client.query(
                `INSERT INTO orders (user_id, total_price)
                VALUES ($1, $2) RETURNING id`,
                [userId, total]
            );
            const orderId = orderRes.rows[0].id;

            for (const item of basketRes.rows){
                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase)
                    VALUES ($1, $2, $3, $4)`,
                    [orderId, item.product_id, item.quantity, item.price]
                );
            }
            await client.query('DELETE FROM basket_item WHERE user_id = $1', [userId]);
            await client.query(`COMMIT`);
            res.json({message: 'Order created successfully'})
        }catch(err){
            await client.query('ROLLBACK');
            console.error(err);
            res.status(500).json({message: 'Error creating order'});
        } finally {
            client.release();
        }
    }
    async getOrders(req,res){
        const userId = req.user.id;
        
        try {
            const order = await db.query(`SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC`, [userId]);
            res.json(order.rows);
        } catch (err) {
            console.error(err);
            res.status(500).json({message: 'Error getting orders'});
        }
    }
}

module.exports = new OrderController();