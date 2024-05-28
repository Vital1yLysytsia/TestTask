const express = require('express')
const mongoose = require('mongoose')
require("dotenv").config()
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 5000
app.use(cors());

app.use(express.json({extended: true}))
app.use('/api/title', require('./routes/product.route'))



async function start() {
    try {
        await mongoose.connect('mongodb+srv://zeyaroslav:newpass123@ppc1.769ih6s.mongodb.net/?retryWrites=true&w=majority&appName=PPC1')

        app.listen(PORT, () => {
            console.log(`Server started on port ${PORT}`)
        })

    } catch (err) {console.error(err)}
} 

start()