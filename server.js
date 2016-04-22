var express = require("express");
var path = require("path");
var ejs = require("ejs");
var bodyParser = require("body-parser");
var assert = require('assert');
var monk = require('monk');
var app = express();

//configure mongodb
var uri = 'mongodb://reader:123@ds021999.mlab.com:21999/gecko-cage'

var db = monk(uri);
app.db = db;

var collection = app.db.get('temperature-humidity');


//configure env variables
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

//configure express
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static('./public'));
app.engine('html', ejs.renderFile);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//database routing
app.get('/api/th/', function (req, res) {
	var promise = collection.find();
	promise.success(function (doc) {
		res.send(doc);
	})
})

app.post('/api/th/', function (req, res) {
	if (req.body.secret == process.env.OPENSHIFT_MONGODB_DB_PASSWORD) {
		var newData = req.body.data
		var promise = collection.insert(newData);
		promise.success(function() {
			res.send("success.");
		});
	} else {
		res.send("Not successful.");
	}
})

//database routing
app.get('/api/th/:id', function (req, res) {
	var promise = collection.find();
	promise.success(function (doc) {
		res.send(doc);
	})
})


//set up initial routing
app.get('/', function (req, res) {
    res.render('index.html');
});


//start the server
app.listen(server_port, server_ip_address, function(){
  console.log("Listening on server_port " + server_port)
});


module.exports = app;