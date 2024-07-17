const express = require("express");
const multer = require('multer');
const adminjwtauth = require('../services/jwtverify')
const ProductModel = require('../model/product.model')
let route = express.Router();



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '..', 'public', 'uploads' ));
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });


route.get('/', (req, res) => {
    const category = req.query.category;
    const brands = req.query.brand;
    const price = Number(req.query.price);
    const sort = req.query.sort;
    let filter = {};
    if (category && category !== 'All') {
        filter.category = category;
    }

    if (brands) {
        filter.brand = Array.isArray(brands) ? { $in: brands } : { $in: [brands] }
    }

    if (price > 0) {
        filter.price = { $lte: price };
    }

    let sortOption = {};
    if (sort === 'asc') {
        sortOption = { price: 1 }
    }

    ProductModel.find(filter)
        .sort(sortOption)
        .then(product => res.json(product))
        .catch(err => res.json(err))
});

route.post('/add', adminjwtauth, upload.single('avatar'), async (req, res) => {
    try {
        let body;
        if (req.file) {
            body = JSON.parse(req.body.body);
        } else {
            body = req.body;
        }

        const isExist = await ProductModel.findOne({ name: body?.name });

        if (isExist) {
            return res.status(400).json({ error: "Duplicate product name" });
        }

        let imageUrl = body.imageUrl || ''; 

        if (req.file) {
            imageUrl = `http://${req.hostname}:5000/uploads/${req.file.filename}`;
        }

        const newProduct = new ProductModel({ ...body, imageUrl });

        const savedProduct = await newProduct.save();
        res.json(savedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


route.delete('/:id',adminjwtauth, (req, res) => {
    let idDel = req.params.id;
    ProductModel.findByIdAndDelete(idDel)
        .then(product => res.json(product))
        .catch(err => res.status(400).json({ error: err.message }));
})



route.put('/product/:id', adminjwtauth, upload.single('avatar'), async (req, res) => {
    try {
        const productId = req.params.id;
        let body;
        if (req.file) {
            body = JSON.parse(req.body.body);
        } else {
            body = req.body;
        }
        
        let update = { ...body };

        if (req.file) {
            update.imageUrl = `http://${req.hostname}:5000/uploads/${req.file.filename}`;
        }

        const updatedProduct = await ProductModel.findByIdAndUpdate(productId, update, { new: true });
        
        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        
        return res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


module.exports = route;