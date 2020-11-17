let mongoose = require('mongoose');
const CheckCoachSchema = mongoose.Schema({
    CoachName: {type: String},
    ImageProfile:{type:String},
    Workplace: {type: String},
    Background:{type:String},
    Age:{type:Number},
    Specialized:{type:Array}

});
module.exports = CheckCoachSchema;