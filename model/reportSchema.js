let mongoose = require('mongoose');
const ReportSchema = mongoose.Schema({
    Username: {type: String},
    Content: {type: String},
    Detail:{type:String},
    Status:{type:String},
    Token:{type:String}
});
module.exports = ReportSchema;