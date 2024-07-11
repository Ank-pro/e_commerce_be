const express = require("express");
const multer = require('multer');
const adminjwtauth = require('../services/jwtverify')
const ProductModel = require('../model/product.model')
let route = express.Router();
const app = express();


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
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

route.post('/add',adminjwtauth, upload.single('avatar'), async (req, res) => {
    const body = JSON.parse(req.body.body)
    const isExist = await ProductModel.findOne({ name: body?.name })

    if (isExist) {
        res.status(400).json({ error: "duplicate" })
        return;
    }

    const newProduct = new ProductModel({ ...body, imageUrl: `http://${req.hostname}:${5000}/${req.file.destination}${req.file.originalname}` });
    newProduct.save()
        .then(product => res.json(product))
        .catch(err => res.status(400).json({ error: err.message, msg: err }));
});

route.delete('/:id',adminjwtauth, (req, res) => {
    let idDel = req.params.id;
    ProductModel.findByIdAndDelete(idDel)
        .then(product => res.json(product))
        .catch(err => res.status(400).json({ error: err.message }));
})



route.put('/product/:id', adminjwtauth, upload.single('avatar'), (req, res) => {
    const productId = req.params.id;
    const body = JSON.parse(req.body.body);
    let update = { ...body };

    
    if (req.file) {
        update.imageUrl = `http://${req.hostname}:5000/uploads/${req.file.filename}`;
    }

    ProductModel.findByIdAndUpdate(productId, update, { new: true })
        .then(updatedProduct => {
            if (!updatedProduct) {
                return res.status(404).json({ error: 'Product not found' });
            }
            return res.json(updatedProduct);
        })
        .catch(err => res.status(400).json({ error: err.message }));
});

module.exports = route;