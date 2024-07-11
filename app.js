const express = require('express');
const mongoose = require('mongoose');
const cors = require("cors");
const path = require('path');
const ProductModel = require('./model/product.model')
const PORT = process.env.PORT || 5000;
const app = express();
app.use(express.json());
const corsOptions = {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: '*',
};


app.use(cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
});


const DB_URL = process.env.DB_URL || 'mongodb://localhost:27017/AgroUdgam';

mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000,         // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 30000
}, (err) => {
    console.info(`DB is connected`);
});

app.use(express.static(path.join(__dirname, 'public')));


app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

let product = require('./routes/Product');
let adminUser = require('./routes/Admin')
app.use('/product', product)
app.use("/admin", adminUser)


app.listen(PORT, () => {

    console.info(`SERVER RUNNING AT ${PORT} `);

})

