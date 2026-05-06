const db = require('../db')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const generateAccessToken = (id, email, role) => {
    const payload = {id, email, role};

    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '24h'})
}

class UsercController{
    async registration(req,res){
        try{
            const {email, password, name} = req.body;

            const candidate = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);
            if (candidate.rows.length > 0) {
                return res.status(409).json({message: "This email already exists"});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await db.query(`INSERT INTO users (email, password_hash, name) values ($1, $2, $3) RETURNING *`, [email, hashedPassword, name])
            const user = newUser.rows[0];
            const token = generateAccessToken(
                user.id,
                user.email,
                user.role
            )
            res.json({token, newUser: {
                id: user.id,
                email: user.email,
                role: user.role
            }})
        } catch (err){
            console.error(err)
            res.status(500).json({message: "Registration error"})
        }    
    }

    async login(req, res){
        try {
            const {email, password} = req.body;
            const user = await db.query(`SELECT * FROM users WHERE email = $1`, [email]);

            if (user.rows.length === 0){
                return res.status(404).json({message: "User not found"})
            }

            const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
            if (!isMatch) {
                return res.status(400).json({message: "Passwords don`t match!"})
            }

            const token = generateAccessToken(
                user.rows[0].id,
                user.rows[0].email,
                user.rows[0].role
            );

            res.json({
                token,
                user: {
                    id: user.rows[0].id,
                    email: user.rows[0].email,
                    role: user.rows[0].role
                }
            });
        } catch (err) {
            console.error(err)
            res.status(500).json({message: "Login error"})
        }
    }
}

module.exports = new UsercController();