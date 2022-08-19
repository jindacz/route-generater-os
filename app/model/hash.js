const mongoose = require('mongoose');

// schemea for Hashs object
const hashSchema = new mongoose.Schema({
	longUrl: { type: String },
	shortUrl: { type: String },
	timesVisited: { type: Number },
	ttl: { type: Date },
	// created_at is a Date type, default is current time
	created_at: { type: Date, required: true, default: Date.now },
	updated_at: { type: Date, required: true }
});

module.exports = mongoose.model('Hashs', hashSchema);



