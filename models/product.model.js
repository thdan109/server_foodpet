const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name: String,
    type: "food"|"care"|"tool"|"other",
    description: String,
    price: Number,
    total: Number,
    number: Number,
    picture: [String],

});
module.exports = mongoose.model('products', productSchema);