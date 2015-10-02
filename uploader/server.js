var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer({ dest: 'cache_files/' });

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.send('Hello World!');
});

app.post('/upload', upload.array('files', 12), function (req, res) {
	// req.files is array of `photos` files
	// req.body will contain the text fields, if there were any

	var data = req.files;

	for (var i in data) {
		console.log(data[i]);
	};

	res.json(data);
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});