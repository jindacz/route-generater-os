const moment = require('moment');
// Get a short hash from a string.
const shortHash = require('short-hash');
// Handle GET requests to /api route
const logger = (req, res, next) => {
	console.log(
		`${req.method}: '${req.protocol}://${req.get(
			'host'
		)}${req.originalUrl}' at: '${moment().format()}' from ${req.ip ||
			req.headers['x-forwarded-for'] ||
			req.socket.remoteAddress ||
			req.ip ||
			null}`
	);
	next();
};
// module.exports = logger;

// test whether the url is valid using regex
const urlValidator = (value) => {
	const linkRegex = /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/;
	// Returns a Boolean value that indicates whether or not a pattern exists in a searched string.
	return linkRegex.test(value);
};

// use createShort function
const createShort = (value) => {
	try {
		// if url is valid
		if (urlValidator(value)) {
			// call npm's short-hash's shortHash to get a short hash
			return shortHash(value);
		} else {
			return false;
		}
	} catch (err) {
		console.log(err);
	}
};

// export functions
module.exports = { logger, urlValidator, createShort };
