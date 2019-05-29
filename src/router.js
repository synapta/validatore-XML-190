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

    app.get('/api/0.1/find/:string', function (request, response) {
        doSomething(param, function (data) {
            response.send(data);
        });
    });

    app.get('/dump', function(request, response) {
        response.sendFile(__dirname + '/export/dump.zip');
    });
};
