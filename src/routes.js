var express    = require('express');
var request    = require('request');
var bodyParser = require('body-parser');

var httpProxy = require('http-proxy');
var apiProxy = httpProxy.createProxyServer();

module.exports = function(app) {
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));

    // file statici e index.html in app/
    app.use('/', express.static('.'));

    app.post('/validate', function (request, response) {
        if (!request.body.url) {
	    response.status(400).end();
	    return;
	}
	const url = new URL(request.body.url);

	// TODO:
	// - get url
	// - validate all the things
        response.send({});
    });
};
