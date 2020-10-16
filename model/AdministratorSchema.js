let mongoose = require('mongoose');
const AdministratorSchema = mongoose.Schema({
    userAdmin: {type: String},
    passwordAdmin: {type: String}
});
module.exports = AdministratorSchema;