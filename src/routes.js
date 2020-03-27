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
            if (err || statusCode !== 200) {
                console.log("Errore nel recuperare la pagina:", err, statusCode);
                let errorLog = {};
                errorLog.header = `C'è un problema con l'URL immesso :-(`;
                errorLog.text = `HTTP Status ${statusCode}`;
                errorLog.progression = 0;
                response.status(400).send(errorLog);
            } else {
                console.log("Download OK!");
                analyze.validateFile(body, function(errMessage) {
                    if (errMessage) {
                        // console.log(errMessage.text)
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
            console.log("Analisi OK")
            response.send(body);
        })
    });

// http://localhost:8041/xml/test1
// http://localhost:8041/xml/testonline
// http://localhost:8041/xml/file.zip
    app.get('/xml/:path', function (request, response) {
        response.sendFile(__dirname + '/xml/' + request.params.path);
    });

    app.post('/xml/:path', function (request, response) {
        response.sendFile(__dirname + '/xml/' + request.params.path);
    });
}
