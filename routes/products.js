// imports
const express = require("express");
const router = express.Router();

// import in the Forms
const { bootstrapField, createProductForm } = require('../forms');

// #1 import in the Product model from models
const {Product} = require('../models')
// 
const {Category}=require('../models')

const {Tag} = require('../models')

router.get('/', async (req,res)=>{

    // #2 - fetch all the products (ie, SELECT * from products)
    let products = await Product.collection().fetch({
    // and load each of their category relationship:
        withRelated:['category']
    });
    res.render('products/index', {
        'products': products.toJSON() // #3 - convert collection to JSON
    })
})

// create new content
router.get('/products/create', async (req, res) => {

    const allCategories = await Category.fetchAll().map((category)=>{
       return [category.get('id'), category.get('name')];
   })

   const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

   const productForm = createProductForm(allCategories, allTags);
  
   res.render('products/create', {
       'form': productForm.toHTML(bootstrapField)
   })
})

router.post('/products/create', async(req,res)=>{

     // 1. Read in all the categories
     const allCategories = await Category.fetchAll().map((category) => {
        return [category.get('id'), category.get('name')];
    })

    //  reads in all the tags from the table and for each tag, store their id and name in an array. 
    // All the tags are then passed to the createProductForm function.

    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
    
    const productForm = createProductForm(allCategories,allTags);
    productForm.handle(req, {
        'success': async (form) => {
            // separate out tags from the other product data as not to cause an error when we create the new product
            // extract out the tags from the form data, and assign the rest of the form keys to be in a new object named productData
            let {tags, ...productData} = form.data;

            // 2. Save data from form into the new product instance
            // we pass all the data in the form to the product via the constructor. 
            // For this to work, the name of fields in the form must match the name of all columns in the table.
            const product = new Product(productData);

            product.set('name', form.data.name);
            product.set('cost', form.data.cost);
            product.set('description', form.data.description);
            await product.save();
            // save the many to many relationship
            // if the user has selected any tags; if so attach ID of those tags to the product. 
            // We have to use tags.split(',') because Caolan Forms will return the selected options from a multiple select as a comma delimited string.

            if (tags) {
                await product.tags().attach(tags.split(","));
            }
            res.redirect('/');

        },
        'error': async (form) => {
            res.render('products/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

// Updating the form
// this router is the get the infromation that is to be updated
router.get('/products/:product_id/update', async (req, res) => {
    // retrieve the product: We retrieve the product instance with that specific product id and store it in the product variable.
    const productId = req.params.product_id
    const product = await Product.where({
        'id': productId
    }).fetch({
        require: true,
        withRelated:['tags']
    });

    // fetch all the categories in the system and use that to populate the forms.
    const allCategories = await Category.fetchAll().map((category)=>{
        return [category.get('id'), category.get('name')];
    })

    // fetch all the tags
    // displaying all the possible tags in the form
    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

    const productForm = createProductForm(allCategories, allTags);

    // fill in the existing values: 
    // we once again create a productForm. 
    // However this time round we assign the value of each field from its corresponding key in the product model instance.  
    productForm.fields.name.value = product.get('name');
    productForm.fields.cost.value = product.get('cost');
    productForm.fields.description.value = product.get('description');

    // set the initial value fo the category_id field of the form:
    // sets the form's category_id field value to be the same as the category_id from the product. 
    // When the form is displayed, the correct category will be selected by default.
    productForm.fields.category_id.value = product.get('category_id');

    // fill in the multi-select for the tags
    // read the current tags of the product and set them as the value of the tags field of the form.
    // This will set the default values of the tags multi-select to the current tags of the product.

    let selectedTags = await product.related('tags').pluck('id');
    productForm.fields.tags.value= selectedTags;

    res.render('products/update', {
        'form': productForm.toHTML(bootstrapField),
        'product': product.toJSON()
    })
})

// this router is to push the updated information into the database

// we fetch the product by the product id from the URL parameters
router.post('/products/:product_id/update', async (req, res) => {
    // fetch all the categories
    const allCategories = await Category.fetchAll().map((category)=>{
        return [category.get('id'), category.get('name')];
    })

    // fetch the product that we want to update
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true,
        withRelated:['tags']
    });
    // console.log(product);

    // process the form:
    // If the form is successfully processed (i.e, no validation errors) and we use the product.
    // set function to overwrite the original product data with the data from the form. 
    // Then we instruct the product to save itself. 
    // If there's an error in the form, we just re-render the form to display the error messages.

    const productForm = createProductForm(allCategories);
    productForm.handle(req, {
        'success': async (form) => {
            //  retrieves the selected tags and the product data from the form
            let { tags, ...productData} = form.data;
            product.set(productData);
            product.save();

            // First, it goes through all the existing tags in the product and removes those not in the selected tags.
            // Second, it adds all the selected tags to the model. (under the .attach())
            let tagIds = tags.split(',');
            let existingTagIds = await product.related('tags').pluck('id');

            // remove all the tags that aren't selected anymore
            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
            await product.tags().detach(toRemove);
            // add in all the tags selected in the form
            await product.tags().attach(tagIds);

            res.redirect('/');
        },
        'error': async (form) => {
            res.render('products/update', {
                'form': form.toHTML(bootstrapField),
                'product': product.toJSON()
            })
        }
    })
})

// Deleting a form
router.get('/products/:product_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    res.render('products/delete', {
        'product': product.toJSON()
    })
});

// process delete:
router.post('/products/:product_id/delete', async(req,res)=>{
    // fetch the product that we want to delete
    const product = await Product.where({
        'id': req.params.product_id
    }).fetch({
        require: true
    });
    // destroy function basically just destroys that product that we fetch above
    await product.destroy();
    res.redirect('/')
})

module.exports = router;

