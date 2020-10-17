let mongoose = require('mongoose');
const CartSchema = mongoose.Schema({
    Username: {type: String},
    Cart: [{
        Name:{type:String},
        Quantity:{type:Number},
        Price:{type:Number}
    }],

    Recipients:{type:String},
    ReceivingAddress:{type:String},
    DateCart:{type:String},
    TotalPrice:{type:Number}

});
module.exports = CartSchema;