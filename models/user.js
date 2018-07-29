const mongoose = require("mongoose");
var uniqueValidator = require('mongoose-unique-validator');

var userSchema = new mongoose.Schema({
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
  country: String,
  location:String,
  plan: {
    type:String,
    required:true
  },
  category: {
    type:String,
    required:true
  }
});

userSchema.plugin(uniqueValidator, { message: 'Error, someone already registered with this comapany name.' });

var User = mongoose.model("users", userSchema);

module.exports = User;
