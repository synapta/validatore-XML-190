const request = require('request');

exports.getWebPage = function (url, callback) {
        request.post({url: url,followAllRedirects: true, followOriginalHttpMethod: true}, function(error, response, body){
            if (error) {
                callback(error, null, body);
                return;
            }
            if (response.statusCode === 405) {
                console.log("La post non era permessa (HTTP 405), provo con la get")
                request.get({url: url,followAllRedirects: true, followOriginalHttpMethod: true}, function(error, response, body){
                    if (error) {
                        callback(error, null, body);
                        return;
                    }
                    callback(error, response.statusCode, body);
                });
            } else {
                callback(error, response.statusCode, body);
            }
        });
}

exports.verificaPartitaIva = function (piva) {
    piva = piva.trim();
    if (piva.length !== 11) return false;
    if (piva.match(/^\d+$/) === null) return false;
    let arr = Array.from(piva, x => parseInt(x));
    let sum = 0;
    for (let i = 0; i < 11; i++) {
        if (i % 2 === 0) {
            sum += arr[i];
        } else {
            sum = arr[i]*2  >= 10 ? sum + arr[i]*2 - 9 : sum + arr[i]*2;
        }
    }
    if (sum % 10 === 0) return true;
    return false;
}

exports.verificaCodiceFiscale = function (cf) {
    cf = cf.trim();
    cf = cf.toUpperCase();
    if (cf.length !== 16) return false;
    let arr = Array.from(cf, x => isNaN(x) ? x : parseInt(x));
    let sum = 0;
    let dic = {
        '0' : {p: 0,d: 1},
        '1' : {p: 1,d: 0},
        '2' : {p: 2,d: 5},
        '3' : {p: 3,d: 7},
        '4' : {p: 4,d: 9},
        '5' : {p: 5,d: 13},
        '6' : {p: 6,d: 15},
        '7' : {p: 7,d: 17},
        '8' : {p: 8,d: 19},
        '9' : {p: 9,d: 21},
        'A' : {p: 0,d: 1},
        'B' : {p: 1,d: 0},
        'C' : {p: 2,d: 5},
        'D' : {p: 3,d: 7},
        'E' : {p: 4,d: 9},
        'F' : {p: 5,d: 13},
        'G' : {p: 6,d: 15},
        'H' : {p: 7,d: 17},
        'I' : {p: 8,d: 19},
        'J' : {p: 9,d: 21},
        'K' : {p: 10,d: 2},
        'L' : {p: 11,d: 4},
        'M' : {p: 12,d: 18},
        'N' : {p: 13,d: 20},
        'O' : {p: 14,d: 11},
        'P' : {p: 15,d: 3},
        'Q' : {p: 16,d: 6},
        'R' : {p: 17,d: 8},
        'S' : {p: 18,d: 12},
        'T' : {p: 19,d: 14},
        'U' : {p: 20,d: 16},
        'V' : {p: 21,d: 10},
        'W' : {p: 22,d: 22},
        'X' : {p: 23,d: 25},
        'Y' : {p: 24,d: 24},
        'Z' : {p: 25,d: 23},
    }
    let controllo = {
        '0' : 'A',
        '1' : 'B',
        '2' : 'C',
        '3' : 'D',
        '4' : 'E',
        '5' : 'F',
        '6' : 'G',
        '7' : 'H',
        '8' : 'I',
        '9' : 'J',
        '10' : 'K',
        '11' : 'L',
        '12' : 'M',
        '13' : 'N',
        '14' : 'O',
        '15' : 'P',
        '16' : 'Q',
        '17' : 'R',
        '18' : 'S',
        '19' : 'T',
        '20' : 'U',
        '21' : 'V',
        '22' : 'W',
        '23' : 'X',
        '24' : 'Y',
        '25' : 'Z'
    }
    for (i = 1; i < 16; i ++){
        if (i % 2 === 0) {
            sum += dic[arr[i - 1]].p // converto i pari
        } else {
            sum += dic[arr[i - 1]].d
        }
    }
    let resto = sum % 26;
    if (controllo[resto] === arr[15]) return true;
    return false;
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
