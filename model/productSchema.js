let mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    ProductName: {type: String},
    Price: {type: Number},
    Description: {type: String},
    Quantity: {type: Number},
    Classify:{type:String},
    ImageProduct: {type: String},
    Rating:{type:Number}
});
module.exports = productSchema;