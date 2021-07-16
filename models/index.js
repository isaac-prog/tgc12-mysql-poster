// import bookshelf
const bookshelf = require('../bookshelf')

const Product = bookshelf.model('Product', {
    tableName:'products',
    category() {
        // The Product model has a function named category which returns a belongsTo relationship
        // The argument is the name of the model (not the table) that it belongs to. 
        // This indicates that the Product model belongs to one Category model.
        return this.belongsTo('Category')
    },
    tags() {
        return this.belongsToMany('Tag');
    }
});

const Category = bookshelf.model('Category',{
    tableName: 'categories',
    products() {
        // The Category model has a function named products which returns a hasMany relationship
        // The argument is the name of the model (not the table) which it is involved in the relationship. 
        return this.hasMany('Product');
    }
})

const Tag = bookshelf.model('Tag',{
    tableName: 'tags',
    products() {
        return this.belongsToMany('Product')
    }
})

const User = bookshelf.model('User',{
    tableName: 'users'
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    products() {
        return this.belongsTo('Product')
    }

})

module.exports = {Product, Category, Tag, User, CartItem};
