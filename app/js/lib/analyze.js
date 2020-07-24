var x2j = require('xml-js');
var dict = require('./error-dictionary.json');
var fun = require('./test-functions.js');
var tl = require('./test-list.js');
var utils = require('./utils.js');
var xsd = require('xsd-schema-validator');
var fs = require('fs');
var _ = require('lodash');
var mmm = require('mmmagic'),
    Magic = mmm.Magic;
var xsdXmlPath = __dirname + '/../../assets/schema-tolerant.xsd';
var xsdIndexPath = __dirname + '/../../assets/schema-index.xsd';



var detectMIME = function (body, cb) {
    let buf = Buffer.from(body);
    let magic = new Magic(mmm.MAGIC_MIME_TYPE);
    magic.detect(buf, function(err, mimeType) {
        if (err) throw err;
        if (mimeType === 'text/plain') {
            // questa stringa può essere scordata all'inizio dei file XML, ma se manca,
            // il detector del mime type non è in grado di riconoscere che è un XML
            let bodyXMLCured = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + body;
            let bufXMLCured = Buffer.from(bodyXMLCured);
            magic.detect(bufXMLCured, function(err2,mimeType2)  {
                if (err2) throw err2;
                logic(mimeType2,cb)
            })
        } else {
            logic(mimeType,cb)
        }
    });
    let logic = function (mimeType, cb) {
        if (mimeType !== 'text/xml') {
            let errorLog = {};
            errorLog.header = "Il file non è del tipo giusto :-(";
            errorLog.text = "Il link porta ad un file che non è un XML."
            if (mimeType === "text/html") errorLog.text = "Il link è di una pagina HTML.";
            if (mimeType === "application/zip") errorLog.text = "Il link porta ad un file compresso.";
            // if (mimeType === "application/vnd.ms-excel") errorLog.text = "Il link è di un file xml prodotto con excel.";
            // if (mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                // errorLog.text = "Il link è di un file xml prodotto con excel.";

            console.log("mime type of file: ", mimeType);
            errorLog.progression = 1;
            cb(errorLog)
        } else {
            cb(undefined)
        }
    }
}

var xsdValidation = function (body, property, cb) {
    xsdPath = xsdXmlPath;
    if (property.is_index === true) xsdPath = xsdIndexPath;
    xsd.validateXML(body, xsdPath, function(err, result) {
        if (result.valid) {
            cb(undefined)
        } else {
            let errorLog = {};
            errorLog.header = "L'XML non valida lo schema XSD :-(";
            errorLog.text = "";
            errorLog.progression = 2;
            if (property.is_empty === true) errorLog.is_empty = true;
            if (property.is_index === true) errorLog.is_index = true;
            for (let i = 0; i < result.messages.length; i++){
                errorLog.text += result.messages[i] + '<br>';
            }
            console.log(errorLog.text)
            cb(errorLog)
        }
    });
}

var detectIfIndex = function (body) {
    if (body.match(/<indici/)) return true;
    return false;
}
var detectIfEmpty = function (body) {
    if (body.match(/<data\s*\/>/)) return true;
    return false;
}

// faccio i primi test di analisi del file fino alla validazione dello schema XSD
exports.validateFile = function (body,cb) {
    detectMIME(body, (errorLog) => {
        if (errorLog) {
            cb(errorLog)
        } else {
            console.log("MIME OK!")
            let property = {is_index: detectIfIndex(body), is_empty: detectIfEmpty(body)}
            xsdValidation(body,property,cb);
        }
    })
}

var convertXMLToJSON = function (body) {
    var lines = body.split('\n');
    var newBody = '';
    for (var i = 0; i < lines.length; i++){
        let regex = /<[^\/\!>]+()\/?>/;
        let regexEmptyTag = /<[^\/\!>]+()\/>/;
        let regexQuestionMarks = /<\?[^\/][^>]+()\?>/;
        let newLine = lines[i];
        // per mostrare gli errori di data quality ho bisogno di mettere il riferimento
        // direttamente dentro l'XML stesso della posizione della riga
        // inietto nei tag il parametro "linea" con valore la riga
        if (lines[i].match(regex)) {
            let tag = lines[i].match(regex);
            let indexEndOfTag = tag[0].length + tag.index - 1;
            if (lines[i].match(regexQuestionMarks)) indexEndOfTag -= 1;
            if (lines[i].match(regexEmptyTag)) indexEndOfTag -= 1;
            let trueI = i + 1;
            newLine = insertString(lines[i],' linea="' + trueI + '"', indexEndOfTag);

        }
        newBody += newLine;
        if (i !== lines.length - 1 ) newBody += '\n';
    }
    return xmlJSON = JSON.parse(x2j.xml2json(newBody, {compact: true, spaces: 4}));
}

var extractLotti = function (xmlJSON) {
    // c'è il primo livello (singolo) dell'XML che non è sempre uguale (spesso 'legge190:pubblicazione')
    var firstLevel;
    for (var key in xmlJSON) firstLevel = key;
    return rendiArray(xmlJSON[firstLevel].data.lotto);
}


exports.analyze = function (body, cb) {
    let xmlJSON = convertXMLToJSON(body);
    let lotti = extractLotti(xmlJSON);
    let totLotti = lotti.length;
    let errors = [];
    for (let j = 0; j < lotti.length; j ++) {
        let incremented = j + 1;
        lotti[j].lottoNumber = incremented;
        lotti[j].startLine = getLine(lotti[j],'')
    }
    // analizzo lotto per lotto
    // XXX da implementare controlli cross-lotto
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

// nella trasformazione da XML a oggetto json, alcune parti dell'oggetto stesso, a seconda della loro numerosità,
// possono essere array come no, per semplificare i riferimenti questa funzione ha l'obbiettivo di
// rendere l'oggetto in entrata un array se non lo è già
var rendiArray = function (obj) {
    if (Array.isArray(obj)) {
        return obj;
    }
    if (typeof obj === 'object') {
        let newObj = [obj];
        return newObj;
    }
}

// funzione per passare il path di un elmento come stringa
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

// funzione per recuperare la riga originaria di un tag dato il suo path nel json
var getLine = function (lotto, child) {
    let path = '';
    path = child + '._attributes.linea';
    if (child === '') path = '_attributes.linea';
    let line = _.get(lotto, path);
    return line;
}

// funzione per standardizzare la struttura degli errori
// tutti i dati sono esplicitati in error-dictionary.json
var addError = function (errorCode, line,lotto) {
    let definition = findKey(dict,errorCode)
    return {text:definition.text, type:definition.type, code:errorCode, details:definition.details, line:line,
        lottoNumber:lotto.lottoNumber, startLine:lotto.startLine };
}

// funzione per recuperare una porzione di oggetto a partire da un codice identificativo
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

// dichiariazioni per associare i riferimenti alle funzioni dichiarate in test-functions.js
// e poi riusarne i nomi come stringhe da passare come parametri
presenzaDato = fun.presenzaDato;
checkCig = utils.checkCig;
lunghezzaRagioneSociale = fun.lunghezzaRagioneSociale;
lunghezzaOggetto = fun.lunghezzaOggetto;
importoNullo = fun.importoNullo;
importoTroppoGrande = fun.importoTroppoGrande;
importoNegativo = fun.importoNegativo;
coerenzaDate = fun.coerenzaDate;
coerenzaImporti = fun.coerenzaImporti;
validitaCf = fun.validitaCf;
sintassiImporti = fun.sintassiImporti;
formatoImporti = fun.formatoImporti;
precisioneImporti = fun.precisioneImporti;
sintassiDate = fun.sintassiDate;
formatoDate = fun.formatoDate;
precisioneDate = fun.precisioneDate;
rangeDate = fun.rangeDate;
numeroEnti = fun.numeroEnti;

// iteratore sulla lista di funzione dei controlli da fare su un lotto
var analyzeLotto = function (lotto) {
    lotto.partecipanti.partecipante = rendiArray(lotto.partecipanti.partecipante);
    lotto.aggiudicatari.aggiudicatario = rendiArray(lotto.aggiudicatari.aggiudicatario);

    let erroriTotali = [];
    let testArray = [tl.presenzaDati,tl.validitaCig,tl.lunghezzaRagioneSociale,tl.lunghezzaOggetto,tl.importoNullo,tl.importoTroppoGrande,
    tl.importoNegativo,tl.coerenzaDate,tl.coerenzaImporti,tl.validitaCf,tl.sintassiImporti,tl.formatoImporti,tl.precisioneImporti,
    tl.sintassiDate,tl.formatoDate,tl.precisioneDate, tl.rangeDate, tl.numeroEnti];
    for (let i = 0; i < testArray.length; i ++){
        erroriTotali = erroriTotali.concat(useTest(lotto, testArray[i]));
    }

    return erroriTotali;
}

// funzione che chiama una funzione di un controllo e ritorna la lista degli errori trovati
// per tutti i campi che sui quali la funzione va applicata, come dichiarato in test-list.js
var useTest = function (lotto, options) {
    let errori = [];
    let fieldsToTest = options.fieldsToTest;
    let testName = _.get(this, options.testName);
    for (let i = 0; i < fieldsToTest.length; i++) {
        errori = errori.concat(useTestOnField(testName,lotto,fieldsToTest[i]))
    }
    return errori;
}

// funzione che effettivamente itera una funzione di controllo su tutti i campi richiesti
var useTestOnField = function (testFunction,lotto,row) {
    let errors = [];
    // confronto fra campi
    if (row.fields !== undefined) {
        let objFields = {};
        for (var key in row.fields) {
            if (row.fields.hasOwnProperty(key)) {
                objFields[key] = getValue(lotto,row.fields[key]);
            }
        }
        if (!testFunction(objFields))
            errors.push(addError(row.code, getLine(lotto,row.fields[key]),lotto));
    return errors;
    }
    // test su singolo campo
    // campo che è un array
    if (row.field.match('_array')) {
        let length = 0;
        var match = /_array/.exec(row.field);
        let path = row.field.substring(0, match.index);
        length = _.get(lotto, path + 'length');
        let only_array = row.field.match(/_array$/) ? true : false;
        if (testFunction.name === 'numeroEnti') {
            if (!testFunction(length))
                errors.push(addError(row.code, getLine(lotto,row.field.replace(/\.[^\.]+\._array/,'')), lotto));
            return errors;
        }
        if (testFunction.name === 'presenzaDato' && length === undefined) {
            errors.push(addError(row.code, undefined , lotto));
        } else {
            if (only_array) return [];
            for (let j = 0; j < length; j ++){
                let currentLine = row.field.replace('_array',j)
                if (!testFunction(getValue(lotto,currentLine)))
                    errors.push(addError(row.code, getLine(lotto,currentLine),lotto));
            }
        }
    // campo che non è un array
    } else {
        if (!testFunction(getValue(lotto,row.field)))
            errors.push(addError(row.code, getLine(lotto,row.field),lotto));
    }
    return errors;
}
