var express      = require('express');
var morgan       = require('morgan');
var bodyParser   = require('body-parser');

var app = express();
//NEXT TWO LINES FOR READ BODY FROM POST
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());
app.use(morgan('common'));

require('./routes.js')(app);

var server = app.listen(8041, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
