var mongoose = require('mongoose');
var Schema = mongoose.Schema;


module.exports = mongoose.model('Temperature', new Schema({
	temperature: String,
	date: String,
	hour: String
}));