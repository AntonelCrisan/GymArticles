const mongoose = require('mongoose');
const articleSchema = new mongoose.Schema({
    image: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: {
        type: String,
        required: true
    },
    cantity: {
        type: Number,
        required: true
    }
});
articleSchema.index({name: 'text'});
const Article = mongoose.model('Article', articleSchema);
module.exports = Article; 