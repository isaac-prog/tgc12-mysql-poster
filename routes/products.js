// imports
const express = require("express");
const router = express.Router();

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

// #1 import in the Product model from models
const {Product} = require('../models')

router.get('/', async (req,res)=>{

    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch();
    res.render('products/index', {
        'products': products.toJSON() // #3 - convert collection to JSON
    })
})

module.exports = router;

