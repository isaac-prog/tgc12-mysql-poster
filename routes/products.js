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

router.get('/create', async (req, res) => {
    const productForm = createProductForm();
    res.render('products/create',{
        'form': productForm.toHTML(bootstrapField)
    })
})

router.post('/create', async(req,res)=>{
    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            const product = new Product();
            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            await product.save();
            res.redirect('/products');

        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// router to update the form
// this router is the get the infromation that is to be updated
router.get('/:product_id/update', async (req, res) => {
    // retrieve the product: We retrieve the product instance with that specific product id and store it in the product variable.
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true
    });

    const productForm = createProductForm();

    // fill in the existing values: 
    // we once again create a productForm. 
    // However this time round we assign the value of each field from its corresponding key in the product model instance.  
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})


// this router is to push the updated information into the database

// we fetch the product by the product id from the URL parameters
router.post('/:product_id/update', async (req, res) => {

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });

    // process the form:
    // If the form is successfully processed (i.e, no validation errors) and we use the product.
    // set function to overwrite the original product data with the data from the form. 
    // Then we instruct the product to save itself. 
    // If there's an error in the form, we just re-render the form to display the error messages.

    const productForm = createProductForm();
    productForm.handle(req, {
        'success': async (form) => {
            product.set(form.data);
            product.save();
            res.redirect('/products');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })

})




module.exports = router;

