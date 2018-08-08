var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var UserLogInSchema = new mongoose.Schema({
  username:{
    type:String,
    required:true
  },
  email:{
    type:String,
    required:true
  },
  password:String,
  resetPasswordToken:String,
  resetPasswordExpires:Date
});

UserLogInSchema.plugin(passportLocalMongoose);

var LoggedInUser = mongoose.model('loggedinuser',UserLogInSchema);

module.exports = LoggedInUser;