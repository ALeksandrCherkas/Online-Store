const Router = require('express');
const router = new Router();
const userController = require('../controller/user_controller')
const validate = require('../middleware/validateMiddleware')
const {registrationSchema, loginSchema} = require('../schemas/userSchema')

router.post('/registration', validate(registrationSchema) ,userController.registration)
router.post('/login', validate(loginSchema), userController.login)

module.exports = router;
