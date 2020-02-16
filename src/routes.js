var utils = require('./app/js/lib/utils.js')
var analyze = require('./app/js/lib/analyze.js')

var express  = require('express');
var bodyParser = require('body-parser');
var req = require('request');

module.exports = function(app) {
    app.use('/',express.static('./app'));

    app.use(bodyParser.text({ type: 'text/*' }))

    // app.use((err, req, res, next) => {
    //     res.status(status).send(body).json(err);
    // });

    app.get('/api/show/xml-from-site', function (request, response) {
        utils.getWebPage(request.query.url, function(err, statusCode, body) {
            if (err) {
                console.log(err);
                response.status(400).send(err.message);
            } else if (statusCode !== 200) {
                response.status(statusCode).send();
            } else {
                console.log("Download OK!");
                analyze.fileType(body, function(errMessage) {
                    if (errMessage) {
                        response.status(400).send(errMessage);
                    } else {
                        response.send(body);
                        console.log("XSD OK!")
                    }
                })
            }
        })
    });

    app.post('/api/analyze/xml', function (request, response) {
        analyze.analyze(request.body, function(body) {
            response.send(body);
        })
    });

// http://localhost:8041/xml/test1
// http://localhost:8041/xml/file.zip
    app.get('/xml/:path', function (request, response) {
        response.sendFile(__dirname + '/xml/' + request.params.path);
    });

    app.post('/xml/:path', function (request, response) {
        response.sendFile(__dirname + '/xml/' + request.params.path);
    });
}
