var mongoose = require('mongoose');

var detailsSchema = new mongoose.Schema({
    company:String,
    details:{
        type:String,
        default:''
    }
});

var Details = mongoose.model('details',detailsSchema);

module.exports = Details;