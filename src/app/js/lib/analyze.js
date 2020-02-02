// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');

exports.analyze = function (body, cb) {
    var xmlJSON = JSON.parse(x2j.xml2json(body, {compact: true, spaces: 4}));

    var firstLevel;
    for (var key in xmlJSON) firstLevel = key;
    var totLotti = 1;
    if (Array.isArray(xmlJSON[firstLevel].data.lotto)) totLotti = xmlJSON[firstLevel].data.lotto.length;
    cb(totLotti)
}
