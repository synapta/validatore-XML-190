var query = require('./query');
var downloader = require('./downloader');

var express  = require('express');
var req = require('request');

module.exports = function(app) {
    //app.use('/',express.static('.', { maxAge: maxAge }));
    app.use('/',express.static('./app'));

    app.get('/modifica', function (request, response) {
        response.sendFile(__dirname + '/app/pages/modifica.html');
    });

    app.get('/api/modifica/show/xml-from-site', function (request, response) {
        downloader.getWebPage(request.query.url, function(body) {
            response.send(body);
        })
    });

    // app.get('/guri', function (request, response) {
    //     response.sendFile(__dirname + '/app/index.html');
    // });

    // app.get('/api/bando/next', function (request, response) {
    //     downloader.next(function(body) {
    //         response.send(body);
    //     })
    // });
    //
    // app.get('/api/bando/next/webpage', function (request, response) {
    //     downloader.nextBando(request.query.id_fonte, function(body) {
    //         response.send(body);
    //     })
    // });
    //
    // app.get('/api/bando/next/data', function (request, response) {
    //     downloader.nextBandoData(request.query.id_fonte, function(body) {
    //         response.send(body);
    //     })
    // });
    //
    // app.post('/api/bando/save', function (request, response) {
    //     query.launchSimplePostgresQuery(query.saveGuri(request.body), function () {
    //         response.sendStatus(200);
    //     });
    // });
    //
    //
    //
    // app.get('/api/bando/recent', function (request, response) {
    //     query.launchSimplePostgresQuery(query.recentGuri(), function (body) {
    //         response.send(body);
    //     });
    // });
    //
    // app.get('/suggestions', function (request, response) {
    //     req("https://contrattipubblici.org/archimede/suggestions?q=" + request.query.q, function (error, res, body) {
    //         if (error) {
    //             response.send(500);
    //             return;
    //         }
    //
    //         response.send(body);
    //     });
    // });

}
