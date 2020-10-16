let mongoose = require('mongoose');
const UserSchema = mongoose.Schema({
    Username: {type: String},
    Password: {type: String},
    Fullname: {type: String},
    Phone: {type: String},
    Email: {type: String},
    Address: {type: String}

});
module.exports = UserSchema;