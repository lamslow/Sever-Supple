let mongoose = require('mongoose');
const NotificationSchema = mongoose.Schema({
    Username: {type: String},
    Title:{type:String},
    Description:{type:String},
    DateRecieve:{type:Date}

});
module.exports = NotificationSchema;