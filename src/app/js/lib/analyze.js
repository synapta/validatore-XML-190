// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');

exports.analyze = function (body, cb) {
    var lines = body.split('\n');
    var newBody = '';
    for (var i = 0; i < lines.length; i++){
        let regex = /<[^\/][^>]+()>/;
        let regexQuestionMarks = /<\?[^\/][^>]+()\?>/;
        let newLine = lines[i];
        if (lines[i].match(regex)) {
            let tag = lines[i].match(regex);
            let endOfTag = tag[0].length + lines[i].match(regex).index - 1;
            if (lines[i].match(regexQuestionMarks)) endOfTag -= 1;
            let trueI = i + 1;
            newLine = insertString(lines[i],' linea="' + trueI + '"', endOfTag);

        }
        newBody += newLine;
        if (i !== lines.length - 1 ) newBody += '\n';
    }
    console.log(newBody)
    var xmlJSON = JSON.parse(x2j.xml2json(newBody, {compact: true, spaces: 4}));
    console.log(xmlJSON['legge190:pubblicazione'].data.lotto.cig)
    var firstLevel;
    for (var key in xmlJSON) firstLevel = key;
    var totLotti = 1;
    if (Array.isArray(xmlJSON[firstLevel].data.lotto)) totLotti = xmlJSON[firstLevel].data.lotto.length;
    cb(
        {
            totLotti: totLotti,
            mark: [{line:xmlJSON['legge190:pubblicazione'].data.lotto.cig._attributes.linea,
                    type: 'error'}]
        }
    )
}


var insertString = function (str,newStr,i) {
return str.slice(0, i) + newStr + str.slice(i);
}
