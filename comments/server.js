var express = require('express'),
	api = require('./api'),
	app = express();

GLOBAL.user = {
	id: 1,
	name: 'Delilah'
};

app
	// 设置静态文件目录
	.use(express.static('public'))
	// 添加前缀
	.use('/api', api);

app.get('/', function (req, res) {
  res.send('Hello World!');
});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
