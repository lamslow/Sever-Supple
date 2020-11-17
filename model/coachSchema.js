let mongoose = require('mongoose');
const CoachSchema = mongoose.Schema({
    Username: {type: String},
    Password: {type: String},
    CoachName: {type: String},
    Phone: {type: String},
    ImageProfile:{type:String},
    Email: {type: String},
    Address: {type: String},
    Workplace: {type: String},
    Background:{type:String},
    Age:{type:Number},
    Specialized:{type:Array},
    Rating:{type:Number}

});
module.exports = CoachSchema;