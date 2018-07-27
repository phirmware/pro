var mongoose = require('mongoose');
mongoose.set('debug',true);
mongoose.connect('mongodb://localhost/iservice');
//mongoose.connect("mongodb://phirmware:itachi1@ds237120.mlab.com:37120/iservice");

mongoose.Promise = Promise;

module.exports.user = require('./user');
module.exports.comments = require('./comments');
module.exports.userlogin = require('./userLogin');
module.exports.image = require('./image');