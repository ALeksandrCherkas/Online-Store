const cors = require("cors");
const express = require("express");
const app = express();
const path = require('path')
require('dotenv').config();
const productRouter = require('./routes/product_router');
const basketRouter = require('./routes/basket_router');
const userRouter = require('./routes/user_router');
const reviewRouter = require('./routes/review_router');
const orderRouter = require('./routes/order_router');



const port = 3000;

const products = [];
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use(express.json())
app.use(cors());


app.use('/api/products', productRouter);
app.use('/api/basket', basketRouter);
app.use('/api/users', userRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/orders', orderRouter);




app.listen(port, ()=>{
    console.log("API listening on port 3000");
});