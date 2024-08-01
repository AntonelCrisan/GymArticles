const mongoose = require('mongoose');
const addresses_Schme = new mongoose.Schema({
    idUser: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    street: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    }
});
const Addresses = mongoose.model('Addresses', addresses_Schme);
module.exports = Addresses; 