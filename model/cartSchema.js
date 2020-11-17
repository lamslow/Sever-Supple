let mongoose = require('mongoose');
const CartSchema = mongoose.Schema({
    Username: {type: String},
    Cart: [{
        Name:{type:String},
        Quantity:{type:Number},
        Price:{type:Number}
    }],
    Phone:{type:String},
    Recipients:{type:String},
    ReceivingAddress:{type:String},
    DateCart:{type:Date},
    TotalPrice:{type:Number}

});
module.exports = CartSchema;