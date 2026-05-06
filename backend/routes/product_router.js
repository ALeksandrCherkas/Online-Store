const Router = require('express');
const router = new Router();
const {productController, upload} = require('../controller/product_controller')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')
const validate = require('../middleware/validateMiddleware')
const {productSchema} = require('../schemas/productSchema')

router.get('/categories', productController.getCategories)
router.get('/', productController.getProducts)
router.get('/:id', productController.getOneProduct)

router.post('/', authMiddleware, roleMiddleware, validate(productSchema), productController.createProduct)
router.put('/:id', authMiddleware, roleMiddleware, validate(productSchema.partial()), productController.updateProduct)
router.delete('/:id', authMiddleware, roleMiddleware, productController.deleteProduct)
router.post('/:id/images', authMiddleware, roleMiddleware, upload.array('images') ,productController.uploadImages)

module.exports = router





//reviews
router.post('/reviews', authMiddleware, productController.reviewAdd);


