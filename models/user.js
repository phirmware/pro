const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
  section:{
    type:String,
    required:true
  },
  username:{
     type:String,
     required:true
  },
  user: {
    type:String,
    required:true
  },
  company: {
    type:String,
    unique:true
  },
  service: {
    type:String,
    required:true
  },
  email: {
    type:String,
    required:true
  },
  phone: String,
  country: {
    type:String,
    required:true
  },
  location:String,
  plan: {
    type:String,
    required:true
  },
  category: {
    type:String,
    required:true
  },
  thumbnail:{
    type:String,
    required:true
  },
  date:{
    type:Date,
    default:Date.now
  }
});

userSchema.plugin(uniqueValidator, { message: 'Error, someone already registered with this comapany name.' });

var User = mongoose.model("users", userSchema);

module.exports = User;
