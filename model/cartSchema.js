let mongoose = require('mongoose');
const CartSchema = mongoose.Schema({
    Username: {type: String},
    Cart: [{
        Name:{type:String},
        Quantity:{type:String},
        Price:{type:String}
    }],

    Recipients:{type:String},
    ReceivingAddress:{type:String},
    DateCart:{type:String}

});
module.exports = CartSchema;