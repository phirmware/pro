var mongoose = require('mongoose');

var imageSchema = new mongoose.Schema({
    company:String,
    image:String
});

var image = mongoose.model('image',imageSchema);

module.exports = image;