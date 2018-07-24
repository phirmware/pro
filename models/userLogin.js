var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserLogInSchema = new mongoose.Schema({
  username:String,
  password:String
});

UserLogInSchema.plugin(passportLocalMongoose);

var LoggedInUser = mongoose.model('loggedinuser',UserLogInSchema);

module.exports = LoggedInUser;