var mongoose = require('mongoose');

var commentSchema = new mongoose.Schema({
    company:String,
    name:String,
    comment:String,
    time:{
        type:String,
        default:Date.now
    }
});

var comment = mongoose.model('comments',commentSchema);

module.exports = comment;