const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name: String,
    type: String,
    description: String,
    price: Number,
    total: Number,
    number: Number,
    picture: [String],

});
module.exports = mongoose.model('products', productSchema);