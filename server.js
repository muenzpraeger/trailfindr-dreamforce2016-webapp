var express = require('express');
var http = require('http');
var https = require('https');
var fs = require('fs');
var env = require('node-env-file');
var queries = require('./node/javascript/queries.js');

// Load environment variables for localhost
try {
	env(__dirname + '/.env');
} catch (e) {}

var app = express();

app.set('port', (process.env.PORT || 5000));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/node/ejs/pages');

app.use(express.static(__dirname + '/node'));

app.get('/', function(req, res) {
	res.render('index', {});
});

app.get('/api/beacons', queries.getBeacons);
app.get('/api/venue', queries.getVenue);
app.get('/api/graph', queries.getGraph);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
