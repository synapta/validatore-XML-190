var express      = require('express');
var morgan       = require('morgan');
var bodyParser   = require('body-parser');

var app = express();
// queste due righe per leggere da una POST
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.text({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(morgan('common'));

require('./routes.js')(app);

var server = app.listen(8041, function() {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Server listening at http://%s:%s', host, port);
});
