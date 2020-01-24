var express    = require('express');
var bodyParser = require('body-parser');
var reqwest = require('reqwest');
var libxml = require('libxmljs2');
var fs = require('fs');

module.exports = function(app) {
    app.use( bodyParser.json() );       // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));

    // file statici e index.html in app/
    app.use('/', express.static('.'));

    var xsd_190_buf = fs.readFileSync('./static/datasetAppaltiL190.xsd');
    var xsd_190 = libxml.parseXmlString(xsd_190_buf.toString());

    app.post('/validate', function (request, response) {
        if (!request.body.url) {
            response.status(400).end();
            return;
        }
        const url = new URL(request.body.url);
        reqwest({
            url: url.href,
        }).then(function(resp) {
            try {
                var xml_doc = libxml.parseXmlString(resp);
                var valid = xml_doc.validate(xsd_190);
                response.send({
                    'url': url.href,
                    'valid': valid,
                    'errors': xml_doc.validationErrors,
                });
            } catch(error) {
                response.send({
                    'url': url.href,
                    'valid': false,
                    'errors': ['File is invalid XML document: ' + error],
                });
            }
        }).fail(function(err, msg) {
            response.send({});
        });
    });
};
