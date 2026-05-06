const Router =  require('express');
const router = new Router();
const reviewController = require('../controller/review_controller')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

router.get('/', reviewController.getReviews)
router.post('/', authMiddleware, reviewController.createReview)

module.exports = router;
