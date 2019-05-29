var compression = require('compression');
var express     = require('express');
var morgan      = require('morgan');

var app = express();

// Comprimi risultati delle richieste ove possibile
// @see https://github.com/expressjs/compression
app.use(compression());
// Log
app.use(morgan('common'));
// Servo path
require('./routes.js')(app);

var server = app.listen(8080, function() {
    console.log('Server listening...');
});
