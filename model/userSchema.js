let mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    Username: {type: String},
    Password: {type: String},
    Fullname: {type: String},
    Phone: {type: String},
    Email: {type: String},
    Address: {type: String},
    ImageProfile: {type: String},
    Workplace: {type: String},
    Background: {type: String},
    Age: {type: Number},
    Specialized: {type: Array},
    Rating: {type: Number},
    Status: {type: String},
    Type: {type: String},
    Sex: {type: String}

});
module.exports = UserSchema;