var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');


exports.analyze = function (body, cb) {
    body += 'AAAAAAAAAAAAAAAAAAAAAAAAAa';
    var xmlJSON = synapta_x2j.convert(body,false)
    console.log(xmlJSON)
    cb(body)
}
