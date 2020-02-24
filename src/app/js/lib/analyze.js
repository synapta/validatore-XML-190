// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');
var dict = require('./error-dictionary.json');
var utils = require('./utils.js');
var xsd = require('xsd-schema-validator');
var fs = require('fs');
var _ = require('lodash');
var xsdPath = __dirname + '/../../assets/schema-tolerant.xsd'

var mmm = require('mmmagic'),
    Magic = mmm.Magic;


var detectMIME = function (body, cb) {
    let buf = Buffer.from(body);
    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detect(buf, function(err, mimeType) {
        if (err) throw err;
        if (mimeType !== 'text/xml') {
            let errorLog = {};
            errorLog.header = "Il file non è del tipo giusto :-(";
            errorLog.text = "Il link è di file che non è un XML."
            if (mimeType === "text/html") errorLog.text = "Il link è di una pagina HTML.";
            if (mimeType === "application/zip") errorLog.text = "Il link è di un file compresso.";
            // if (mimeType === "application/vnd.ms-excel") errorLog.text = "Il link è di un file xml prodotto con excel.";
            // if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                // errorLog.text = "Il link è di un file xml prodotto con excel.";

            console.log("mime type of file: ", mimeType);
            errorLog.progression = 1;
            cb(errorLog)
        } else {
            cb(undefined)
        }

    });
}

var validateXML = function (body, cb) {
    xsd.validateXML(body, xsdPath, function(err, result) {
        if (result.valid) {
            cb(undefined)
        } else {
            let errorLog = {};
            errorLog.header = "L'XML non valida lo schema XSD :-(";
            errorLog.text = "";
            errorLog.progression = 2;
            for (let i = 0; i < result.messages.length; i++){
                errorLog.text += result.messages[i] + '<br>';
            }
            console.log(errorLog.text)
            cb(errorLog)
        }
    });
}

exports.validateFile = function (body,cb) {
    detectMIME(body, (errorLog) => {
        if (errorLog) {
            cb(errorLog)
        } else {
            console.log("MIME OK!")
            validateXML(body,cb);
        }
    })
}



exports.analyze = function (body, cb) {
    var lines = body.split('\n');
    var newBody = '';
    for (var i = 0; i < lines.length; i++){
        let regex = /<[^\/][^>]+()>/;
        let regexQuestionMarks = /<\?[^\/][^>]+()\?>/;
        let newLine = lines[i];
        if (lines[i].match(regex)) {
            let tag = lines[i].match(regex);
            let indexEndOfTag = tag[0].length + lines[i].match(regex).index - 1;
            if (lines[i].match(regexQuestionMarks)) indexEndOfTag -= 1;
            let trueI = i + 1;
            newLine = insertString(lines[i],' linea="' + trueI + '"', indexEndOfTag);

        }
        newBody += newLine;
        if (i !== lines.length - 1 ) newBody += '\n';
    }
    var xmlJSON = JSON.parse(x2j.xml2json(newBody, {compact: true, spaces: 4}));
    // c'è il primo livello (singolo) dell'XML che non è sempre uguale (spesso 'legge190:pubblicazione')
    var firstLevel;
    for (var key in xmlJSON) firstLevel = key;
    var totLotti = 1;
    var multiLotto = false;
    if (Array.isArray(xmlJSON[firstLevel].data.lotto)) {
        totLotti = xmlJSON[firstLevel].data.lotto.length;
        multiLotto = true;
    }
    let lotti = rendiArray(xmlJSON[firstLevel].data.lotto);
    let errors = [];
    for (let j = 0; j < lotti.length; j ++) {
        let incremented = j + 1;
        lotti[j].lottoNumber = incremented;
        lotti[j].startLine = getLine(lotti[j],'')
    }
    for (let i = 0; i < lotti.length; i ++) {
        errors = errors.concat(analyzeLotto(lotti[i]));
    }
    let totErrors = errors.filter(element => element.type === 'error').length;
    let totWarnings = errors.filter(element => element.type === 'warning').length;

    let output = {
                totLotti: totLotti,
                totErrors: totErrors,
                totWarnings: totWarnings,
                errors: errors
            };
    cb(output);
}


var insertString = function (str,newStr,i) {
    return str.slice(0, i) + newStr + str.slice(i);
}

var rendiArray = function (obj) {
    if (Array.isArray(obj)) {
        return obj;
    }
    if (typeof obj === 'object') {
        let newObj = [obj];
        return newObj;
    }
}

var analyzeLotto = function (lotto) {
    lotto.partecipanti.partecipante = rendiArray(lotto.partecipanti.partecipante);
    lotto.aggiudicatari.aggiudicatario = rendiArray(lotto.aggiudicatari.aggiudicatario);

    let erroriTotali = [];
    erroriTotali = erroriTotali.concat(presenzaDati(lotto));
    erroriTotali = erroriTotali.concat(useTest(utils.checkCig,lotto,{field:'cig',code:'ECR01'}))
    return erroriTotali;

}

// funzioni di presenza del dato
var presenzaDati = function (lotto) {
    let errori = [];
    let fieldsToTest = [
        {field: 'cig', code: 'ECM01'},
        {field: 'strutturaProponente.codiceFiscaleProp', code: 'ECM02'},
        {field: 'strutturaProponente.denominazione', code: 'ECM03'},
        {field: 'oggetto', code: 'ECM04'},
        {field: 'sceltaContraente', code: 'ECM05'},
        {field: 'importoAggiudicazione', code: 'ECM06'},
        {field: 'importoSommeLiquidate', code: 'WCM01'},
        {field: 'tempiCompletamento.dataInizio', code: 'ECM07'},
        {field: 'tempiCompletamento.dataUltimazione', code: 'WCM02'},
        {field: 'partecipanti.partecipante._array.codiceFiscale', code: 'ECM08'},
        {field: 'partecipanti.partecipante._array.ragioneSociale', code: 'ECM09'},
        {field: 'aggiudicatari.aggiudicatario._array.codiceFiscale', code: 'ECM10'},
        {field: 'aggiudicatari.aggiudicatario._array.ragioneSociale', code: 'ECM11'}
    ];
    for (let i = 0; i < fieldsToTest.length; i++) {
        errori = errori.concat(useTest(presenzaDato,lotto,fieldsToTest[i]))
    }
    return errori;
}

var useTest = function (testFunction,lotto,row) {
    let errors = [];
    if (row.field.match('_array')) {
        let length = 0;
        var match = /_array/.exec(row.field);
        let path = row.field.substring(0, match.index);
        length = _.get(lotto, path + 'length');
        if (testFunction.name === 'presenzaDato' && length === undefined) {
            errors.push(addError(row.code, undefined , lotto));
        } else {
            for (let j = 0; j < length; j ++){
                let currentLine = row.field.replace('_array',j)
                if (!testFunction(getValue(lotto,currentLine)))
                    errors.push(addError(row.code, getLine(lotto,currentLine),lotto));
            }
        }
    } else {
        if (!testFunction(getValue(lotto,row.field)))
            errors.push(addError(row.code, getLine(lotto,row.field),lotto));
    }
    return errors;

}

var getValue = function (lotto, child) {
    let otherTags = ['._cdata'];
    let path = child + '._text';
    let value = _.get(lotto, path);
    if (!value) {
        for (let i = 0 ; i < otherTags.length; i ++) {
            value = _.get(lotto, child + otherTags[i]);
            if (value) return value;
        }
        return undefined;
    }
    return value;
}


var getLine = function (lotto, child) {
    let path = '';
    path = child + '._attributes.linea';
    if (child === '') path = '_attributes.linea';
    let line = _.get(lotto, path);
    return line;
}



var addError = function (errorCode, line,lotto) {
    let definition = findKey(dict,errorCode)
    return {text:definition.text, type:definition.type, details:definition.details, line:line,
        lottoNumber:lotto.lottoNumber, startLine:lotto.startLine };
}


var findKey = function(obj,code) {
    for (let p in obj) {
        if (p === 'code') {
            if (obj[p] == code) {
                return obj;
            }
        } else if (obj[p] instanceof Object) {
            if (obj.hasOwnProperty(p)) {
                tRet = findKey(obj[p],code);
                if (tRet) { return tRet; }
            }
        }
    }
    return false;
};


var presenzaDato = function (dato) {
    if (dato === null || dato === undefined) return false;
    if (dato === '') return false;
    if (Array.isArray(dato)) {
        if (dato.length === 0) return false;
        for (let i = 0; i < dato.length; i++) {
            for (let key in dato[i]) {
                return presenzaDato(dato[i][key])
            }
        }
    }
    if (typeof dato === 'object') {
        for (let key in dato) {
            return presenzaDato(dato[key])
        }
    }

    return true;
}


// funzioni sul formato dei dati



// funzioni di data quality
var dqDataRange = function (date) {
    if (new Date(date) > new Date('2100-01-01 00:00:00')) return false;
    if (new Date(date) < new Date('2000-01-01 00:00:00')) return false;
    return true;
}
