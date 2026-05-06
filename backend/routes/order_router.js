const Router = require('express');
const router = new Router();
const orderController = require('../controller/order_controller')
const authMiddleware = require('../middleware/authMiddleware')

router.post('/', authMiddleware, orderController.createOrder)
router.get('/', authMiddleware, orderController.getOrders);
module.exports = router;