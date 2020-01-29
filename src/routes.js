var query = require('./query');
var downloader = require('./downloader');

var express  = require('express');
var req = require('request');

module.exports = function(app) {
    app.use('/',express.static('./app'));

    app.get('/modifica', function (request, response) {
        response.sendFile(__dirname + '/app/pages/modifica.html');
    });

    app.get('/api/modifica/show/xml-from-site', function (request, response) {
        downloader.getWebPage(request.query.url, function(body) {
            response.send(body);
        })
    });

}
