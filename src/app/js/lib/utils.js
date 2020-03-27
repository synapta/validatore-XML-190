const request = require('request');

exports.getWebPage = function (url, callback) {
    request.post({url: url,followAllRedirects: true, followOriginalHttpMethod: true
                }, function(error, response, body){
        if (error) {
            callback(error, null, body);
            return;
        }
        callback(error, response.statusCode, body);
    });
}


smartCigValidity = function (string) {
    var checkStr = string.toUpperCase().substring(1,3);
    var cigBody = string.toUpperCase().substring(3,10);
    var cigProg = parseInt(cigBody,16);
    var cigCheck = cigProg*211%251;
    cigCheck = cigCheck.toString(16).toUpperCase().padStart(2, '0');
    if (cigCheck === checkStr){
    return true;
    } else {
    return false;
    }
}

normalCigValidity = function (string) {
    var checkStr = string.toUpperCase().substring(7,10);
    var cigProg = string.toUpperCase().substring(0,7);
    var cigCheck = cigProg*211%4091;
    cigCheck = cigCheck.toString(16).toUpperCase().padStart(3, '0');
    if (cigCheck === checkStr){
    return true;
    } else {
    return false;
    }
}

//Check CIG validity. True valid, false if not valid.
exports.checkCig = function (string) {
    if (!string) return false;
    var patt_normal = /([0-9]{7}[A-Fa-f0-9]{3})/ig;
    var patt_smart = /([X-Zx-z]{1}[A-Fa-f0-9]{9})/ig;
    var patt_new = /([A-Wa-w]{1}[A-Fa-f0-9]{4}[0-9]{5})/ig;

    if (string.match(patt_smart)){
    return smartCigValidity(string);
    }
    if (string.match(patt_normal)){
    return normalCigValidity(string);
    }
    if (string.match(patt_new)){
    return string.match(patt_new); //There's no validation algorithm yet for this pattern.
    }
    if (string.match(patt_smart) === null && string.match(patt_normal) === null && string.match(patt_new) === null){
    return false;
    }
};
