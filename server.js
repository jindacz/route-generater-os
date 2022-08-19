// require dependencies in server.js
const express = require('express');
// declear variables
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
// add connection string to .env file
require('dotenv').config();
const port = process.env.PORT || 3000;
const Hashs = require('./app/model/hash');
const { logger, createShort } = require('./app/helpers/helpers');
// view engine setup
app.set('view engine', 'ejs');
app.use(express.static('public'));

// set middleware
app.use(bodyParser.urlencoded({ extended: true }))
	.use(cors())
	.use(express.json())
	.use(logger);
app.set('json spaces', 2);

// app.listen doesnt run for test suite
if (require.main === module) {
	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}

// mongoose setup
mongoose.connect(process.env.dburi);
// connect to mongo DB
const db = mongoose.connection;
// dds the listener function to the end of the listeners array for the event error
db.on('error', (error) => console.log(error));
// Adds a one-timelistener function for the event named open
db.once('open', () => console.log('Connected to db'));

// set root router
app.get('/', async (req, res) => {
	try {
		const data = '';
		const shortenedUrl = '';
		// render the index.ejs file
		res.render('index.ejs', { data, shortenedUrl });
	} catch (err) {
		console.log(err);
	}
});

// listen on /showlinks
app.get('/showlinks', async (req, res) => {
	try {
		// read all data from db
		const data = await readFromDb();
		// console log the link datas
		res.status(200).json({ data });
	} catch (err) {
		console.log(err);
	}
});

// listen on /shortlink
app.get('/:shortLink', async (req, res) => {
	try {
		const data = await readFromDb('shortUrl', req.params.shortLink);
		if (data) {
			res.status(301).redirect(data.longUrl);
		} else {
			// Send a response.to handle error
			res.status(301).send(`${req.params.shortLink} is not a valid short link`);
		}
	} catch (err) {
		console.log(err);
	}
});

// submit form
app.post('/', async (req, res) => {
	try {
		// get the long url from the form
		const reqBody = req.body;
		// set randomizeDate
		let randomizeDate = new Date();
		// set randomizeNum
		let randomizeNum = Math.random() * 10000;
		console.log(`${reqBody.longUrl}${randomizeDate}${randomizeNum}`);
		let shortUrl = '';
		// if make it unique is checked, make it unique
		if (reqBody.randomize === 'on') {
			// call createShort to start change url, pass in the whole string
			shortUrl = createShort(`${reqBody.longUrl}${randomizeDate}${randomizeNum}`);
			// make it unique is not checked
		} else {
			shortUrl = createShort(reqBody.longUrl);
		}
		// if shortUrl is None. return 400
		if (!shortUrl) {
			res.status(400).send({ msg: `${reqBody.longUrl} is not a valid link` });
		}
		// call write to DB function
		writeToDb(reqBody.longUrl, shortUrl, reqBody.timesVisited, reqBody.ttl);

		const data = shortUrl;
		// get the origin URL
		const reqOrigin = req.headers.origin;
		// combine original/hashvalue to get the final url
		const shortenedUrl = `${reqOrigin}/${shortUrl}`;
		// tell index.ejs with { data, shortenedUrl }
		res.render('index.ejs', { data, shortenedUrl });
	} catch (err) {
		console.log(err);
	}
});

// read all documents from db
const readFromDb = async (key, value) => {
	console.log('read from db');
	if (key != undefined && value != undefined) {
		// read one document from db
		return await Hashs.findOne({ [key]: value });
	} else {
		// The lean option tells Mongoose to skip hydrating the result documents. This makes queries faster and less memory intensive, but the result documents are plain old JavaScript objects (POJOs), not Mongoose documents. 
		return await Hashs.find().lean();
	}
};

// helps to write to db. Upsert helps with adding if not found, or update if found.
const writeToDb = async (longUrl, shortUrl, timesVisited, ttl) => {
	console.log('write to db');
	// set query
	const query = { shortUrl: shortUrl };
	const updated_at = Date.now();
	const update = {
		$set: {
			longUrl,
			shortUrl,
			timesVisited,
			ttl
		},
		updated_at
	};

	return await Hashs.findOneAndUpdate(query, update, { upsert: true });
};

module.exports = app;
