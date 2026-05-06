const db = require('../db')
const multer = require('multer')
const path = require('path')
const { ca } = require('zod/v4/locales')

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random()*1e9)
        cb(null, uniqueSuffix + path.extname(file.originalname))
    }
})
const upload = multer({storage})

class ProductController{
    async createProduct(req,res){
        const {title, description, price, full_description, category} = req.body
        const newProduct = await db.query(
            `INSERT INTO product (title, description, price, full_description, category) values ($1, $2, $3, $4, $5) RETURNING *`, 
            [title, description, price, full_description, category])
        
        res.json(newProduct.rows[0])
    }
    async getProducts(req,res){
        try{
            const {search, minPrice, maxPrice, category} = req.query;
            let query = `SELECT * FROM product WHERE 1=1`;
            const params = []

            if(search && search.trim() !== ''){
                params.push(`%${search}%`);
                query += ` AND title ILIKE $${params.length}`;
            }
            if(category && category !== ''){
                params.push(category);
                query += ` AND category = $${params.length}`;
            }
            if (minPrice && !isNaN(Number(minPrice))) {
                params.push(minPrice);
                query += ` AND price >= $${params.length}`;
            }
            if (maxPrice && !isNaN(Number(maxPrice))) {
                params.push(maxPrice);
                query += ` AND price <= $${params.length}`;
            }
            query += ` ORDER BY id DESC`;
            const productsRes = await db.query(query, params);
            const products = productsRes.rows;
            const images = await db.query(`SELECT * FROM product_images`);
            const allImages = images.rows;

            const productsWithImages = products.map(p=>({
                ...p,
                images: allImages.filter(img=> img.product_id === p.id)
            }));
            res.json(productsWithImages);
        }catch(err){
            console.error(err);
            res.status(500).json({message: 'Error getting products'});
        }
        
        /* 
        const products = await db.query(`SELECT * FROM product`)
        const images = await db.query(`SELECT * FROM product_images`)
        
        res.json(productsWithImages)
        */
        
    }
    async getOneProduct(req, res) {
    try {
        const { id } = req.params;

        // 1. Получаем сам товар
        const productRes = await db.query(`SELECT * FROM product WHERE id = $1`, [id]);
        
        if (productRes.rows.length === 0) {
            return res.status(404).json({ message: "Товар не найден" });
        }

        const product = productRes.rows[0];

        // 2. Получаем картинки именно для этого товара
        const imagesRes = await db.query(`SELECT * FROM product_images WHERE product_id = $1`, [id]);
        
        // 3. Собираем всё в один объект
        const productWithImages = {
            ...product,
            images: imagesRes.rows
        };

        res.json(productWithImages);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Ошибка при получении товара' });
        }
    }
    async updateProduct(req,res){
        const id = req.params.id;
        const {title, description, price, full_description, category} = req.body

        const product = await db.query(
            `UPDATE product 
            set title = $1, description = $2, price = $3, full_description = $4, category = $5
            where id = $6 
            RETURNING *`,
            [title, description, price, full_description, category, id])
        const result = await db.query(`SELECT p.*, 
            COALESCE(json_agg(pi.*) FILTER (WHERE pi.id IS NOT NULL), '[]') as images
            FROM product p
            LEFT JOIN product_images pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id`, [id])
        res.json(result.rows[0])
    }
    async deleteProduct(req,res){
        const id = req.params.id;
        const product = await db.query(`DELETE FROM product where id = $1`, [id])
        res.json(product.rows[0])
    }

    async uploadImages(req,res){
        try {
            const files = req.files
            const {id: product_id} = req.params
            if (!files || files.length === 0) return res.status(400).json({message: "No file uploaded"})

            
            
            const uploadImages = []

            for (const file of files){
                const img_url = `/uploads/${file.filename}`
                const result = await db.query(
                    `INSERT INTO product_images (image_url, product_id) VALUES ($1, $2) RETURNING *`,
                    [img_url, product_id]
                )
                uploadImages.push(result.rows[0])
            }
            
            res.json(uploadImages)
        } catch(err) {
            console.error(err)
            res.status(500).json({message: 'Server error'})
        }
    }

    async getCategories(req,res){
        try{
            const categories = await db.query(`SELECT DISTINCT category FROM product WHERE category IS NOT NULL AND category != ''`)
            const categoryList = categories.rows.map(row => row.category)
            res.json(categoryList)
        }catch(err){
            console.error(err) 
            res.status(500).json({message: 'Server error'});
        }
    }
    async reviewAdd(req,res){
        const {productId, rating, text} = req.body;
        const userId = req.user.id;
        try {
            await db.query(`INSERT INTO reviews (user_id, product_id, rating, text) VALUES ($1, $2, $3, $4)`,
            [userId, productId, rating, text])
            res.json({message: 'Review added successfully'});
            const productRes = await db.query(`SELECT rating, reviews_count FROM product WHERE id = $1`, [productId]);
            const {rating: oldRating, reviews_count: oldCount} = productRes.rows[0];
            const newCount = oldCount + 1;
            const newRating = (oldRating * oldCount + rating) / newCount;
            await db.query(`UPDATE product SET rating = $1, reviews_count = $2 WHERE id = $3`, [newRating.toFixed(1), newCount, productId]);
            res.status(201).json({message: 'Review added successfully'})
        } catch (err) {
            console.error(err);
            res.status(500).json({message: 'Server error'});
        }
    }
}

module.exports = {
    productController: new ProductController(),
    upload: upload
}