let mongoose = require('mongoose');
const CheckCoachSchema = mongoose.Schema({
    Username:{type:String},
    CoachName: {type: String},
    ImageProfile:{type:String},
    Workplace: {type: String},
    Background:{type:String},
    Age:{type:Number},
    Specialized:{type:Array},
    Token:{type:String}

});
module.exports = CheckCoachSchema;