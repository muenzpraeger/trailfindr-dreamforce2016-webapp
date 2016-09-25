var express = require('express');
var env = require('node-env-file');
var bodyParser = require('body-parser')
var queries = require('./node/javascript/queries.js');
var inputs = require('./node/javascript/inputs.js');

// Load environment variables for localhost
try {
	env(__dirname + '/.env');
} catch (e) {}

var app = express();

app.set('port', (process.env.PORT || 5000));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/node/ejs/pages');

app.use(express.static(__dirname + '/node'));
app.use(bodyParser.json())

app.get('/', function(req, res) {
	res.render('index', {});
});

app.get('/api/config', queries.getConfig);
app.get('/api/beacons', queries.getBeacons);
app.get('/api/venue', queries.getVenue);
app.get('/api/graph', queries.getGraph);
app.post('/api/feedback', inputs.setFeedback);
app.post('/api/itunes', inputs.registerItunes);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
