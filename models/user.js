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
  service: String,
  email: String,
  phone: String,
  country: String,
  location:String,
  plan: String,
  category: String
});

userSchema.plugin(uniqueValidator, { message: 'Error, someone already registered with this comapany name.' });

var User = mongoose.model("users", userSchema);

module.exports = User;
