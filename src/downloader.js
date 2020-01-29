const request = require('request');

getWebPage = function (url, callback) {
    request(url, function (error, response, body) {
        callback(body);
    });
}


exports.getWebPage = getWebPage;
