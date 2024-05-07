const mongoose = require('mongoose');
const cartSchema = new mongoose.Schema({
    idUser: { 
        type: String, 
        required: true 
    },
    idProduct: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    }
});
const Cart = mongoose.model('Cart', cartSchema);
module.exports = Cart; 