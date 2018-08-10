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
  resetPasswordExpires:Date,
  verificationToken:String,
  verificationExpires:Date,
  verified:{
    type:Boolean,
    default:false
  }
});

UserLogInSchema.plugin(passportLocalMongoose);

var LoggedInUser = mongoose.model('loggedinuser',UserLogInSchema);

module.exports = LoggedInUser;