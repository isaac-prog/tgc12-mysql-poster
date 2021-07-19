const {CartItem} = require('../models');

const getCartItems = async (userId) => {
    return await CartItem.collection()
        .where({
            'user_id' : userId
        }).fetch({
            require:false,
            withRelated:['products', 'products.category']
        });
}

const getCartItemByUserAndProduct = async (userId, productId) => {
    console.log("product id: " + productId);
    return await CartItem.where({
            'id' : productId
        }).fetch({
            require:false
        });
}

module.exports = {
    getCartItems, getCartItemByUserAndProduct
}

