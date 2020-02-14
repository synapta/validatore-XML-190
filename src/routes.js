var utils = require('./app/js/lib/utils.js')
var analyze = require('./app/js/lib/analyze.js')

var express  = require('express');
var bodyParser = require('body-parser');
var req = require('request');

module.exports = function(app) {
    app.use('/',express.static('./app'));

    app.use(bodyParser.text({ type: 'text/*' }))

    app.get('/api/show/xml-from-site', function (request, response) {
        utils.getWebPage(request.query.url, function(body) {
            response.send(body);
        })
    });

    app.post('/api/analyze/xml', function (request, response) {
        analyze.analyze(request.body, function(body) {
            response.send(body);
        })
    });

// http://localhost:8041/xml/test1
    app.get('/xml/:path', function (request, response) {
        response.sendFile(__dirname + '/xml/' + request.params.path);
    });
}
