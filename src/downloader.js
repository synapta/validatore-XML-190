const request = require('request');
const query = require('./query');

getWebPage = function (url, callback) {
    request(url, function (error, response, body) {
        callback(body);
    });
}

getData = function (id_fonte, callback) {
    query.launchSimplePostgresQuery(query.getGuriDetails(id_fonte), function (data) {
        callback(data);
    });
}

exports.next = function (callback) {
    query.launchSimplePostgresQuery(query.getNextGuri(), function (data) {
        let id = data.rows[0].id_fonte;
        callback(id);
    });
}

exports.nextBando = function (id, callback) {
    let anno = id.split("-")[0];
    let mese = id.split("-")[1];
    let giorno = id.split(".")[0].split("-")[2];
    let codice = id.split(".")[2];
    console.log(id, anno, mese, giorno, codice);

    getWebPage('https://www.gazzettaufficiale.it/eli/id/' + anno + '/' + mese + '/' + giorno + '/' + codice + '/s5', function (body) {
        callback(body);
    })
}

exports.nextBandoData = function (id_fonte, callback) {
    getData(id_fonte, function (body) {
        callback(body);
    })
}
