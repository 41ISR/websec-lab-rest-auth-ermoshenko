const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const db = require("./db")
const express = require("express")


const salt = "secret-key"
const SECRET = "this-is-for-JWT"

const app = express()

app.use(express.json())

app.post("/api/auth/register", (req,res) => {
    try{
        const {username, email, password} = req.body
    
        if (!username || !email || !password){ return res.status(400).json({"error": "Не хватаент данных"})
        }
        const syncSalt = bcrypt.genSaltSync(10)
        const hashed = bcrypt.hashSync(password, syncSalt)
        const query = db.prepare(`INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, "admin")`)
        const info = query.run(username, email, hashed)
        const newUser = db.prepare(`SELECT * FROM users WHERE ID = ?`).get(info.lastInsertRowid)
        res.status(201).json(newUser)
    }
    catch(error){
        console.error(error)
    }
})

app.use(express.json())

const authMiddleware = (req, res, next)=>{
    const authHeader = req.headers.authorization
    if (!authHeader) res.status(401).json({error: "Нет токена аворизации"})
    if (!(authHeader.split(" ")[1])) res.status(401).json({error: "Неверный формат токена"})

    try{
        const token = authHeader.split(" ")[1]
        const decoded = jwt.verify(token, SECRET)
        req.user = decoded
        next()
    }
    catch(error){
        console.error(error)
    }
        
}

app.post("/login", (req,res) =>{
    try{
        const {email, password} = req.body
        const user = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)

        if (!user) res.status(404).json({error: "Неправильные данные"})
        const valid = bcrypt.compareSync(password, user.password)

        if (!valid) res.status(401).json({error:"Неправильные данные"})

        const token = jwt.sign({...user}, SECRET, {expiresIn: '24h'})

        const {password: p, ...response} = user
        res.status(200).json({token: token, ...response })
    }
    catch(error){
        console.error(error)
    }
})
