var mongoose = require('mongoose');

var colorSchema = new mongoose.Schema({
    company:String,
    headerColor:{
        type:String,
        default:'#00b289'
    }
});

var Colors = mongoose.model('colors',colorSchema);

module.exports = Colors;