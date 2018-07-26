const mongoose = require("mongoose");

var userSchema = new mongoose.Schema({
  user: {
    type:String,
    required:true
  },
  company: String,
  service: String,
  email: String,
  phone: String,
  country: String,
  location:String,
  plan: String,
  category: String
});

var User = mongoose.model("users", userSchema);

module.exports = User;
