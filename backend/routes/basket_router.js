const Router = require('express');
const router = new Router();
const basketController = require('../controller/basket_controller')
const authMiddleware = require('../middleware/authMiddleware')


router.post('/', authMiddleware, basketController.addToBasket)
router.get('/', authMiddleware, basketController.getBasket)
router.delete('/:productId', authMiddleware, basketController.removeFromBasket)
router.patch('/:id', authMiddleware, basketController.updateQuantity)

module.exports = router;