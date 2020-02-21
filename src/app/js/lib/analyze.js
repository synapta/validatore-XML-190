// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');
var dict = require('./error-dictionary.json');
var utils = require('./utils.js');
var xsd = require('xsd-schema-validator');
var fs = require('fs');
var _ = require('lodash');
var xsdPath = __dirname + '/../../assets/schema.xsd'

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
    // console.log(newBody)
    var xmlJSON = JSON.parse(x2j.xml2json(newBody, {compact: true, spaces: 4}));
    // console.log(xmlJSON)
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
    for (let i = 0; i < lotti.length; i ++) {
        errors = errors.concat(analyzeLotto(lotti[i]));
    }
    let totErrors = errors.filter(element => element.type === 'error').length;
    let totWarnings = errors.filter(element => element.type === 'warning').length;

    // console.log(xmlJSON[firstLevel].data.lotto[0])
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
    // console.log(lotto.aggiudicatari)


    // for (let key in lotto ){
    //     console.log(key, presenzaDato(lotto[key]._text),lotto[key]._text);
    // }
    let erroriTotali = [];
    erroriTotali = erroriTotali.concat(presenzaDati(lotto));
    erroriTotali.push(valutaCig(lotto));
    return erroriTotali;

    // cig
    // strutturaProponente
    // strutturaProponente.codiceFiscaleProp
    // strutturaProponente.denominazione
    // oggetto
    // sceltaContraente
    // partecipanti
    // partecipanti.partecipante
    // partecipanti.partecipante.codiceFiscale
    // partecipanti.partecipante.ragioneSociale
    // aggiudicatari
    // aggiudicatari.aggiudicatario
    // aggiudicatari.aggiudicatario.codiceFiscale
    // aggiudicatari.aggiudicatario.ragioneSociale
    // importoAggiudicazione
    // tempiCompletamento
    // tempiCompletamento.dataInizio
    // tempiCompletamento.dataUltimazione
    // importoSommeLiquidate

}

// funzioni di presenza del dato
var presenzaDati = function (lotto) {
    // console.log(lotto)
    // console.log(dict.warnings.completezza.importoSommeLiquidate)
    let errori = [];
    let datiSingoli = ['cig','oggetto','sceltaContraente', 'importoAggiudicazione']
    for (let i = 0; i < datiSingoli.length; i++) {
        if (!presenzaDato(lotto[datiSingoli[i]]._text))
            errori.push(addError(dict.errors.completezza[datiSingoli[i]], lotto[datiSingoli[i]]._attributes.linea));

    }
    if (!presenzaDato(getValue(lotto,'importoSommeLiquidate')))
        errori.push(addError(dict.warnings.completezza.importoSommeLiquidate, getLine(lotto,'importoSommeLiquidate')));
    if (!presenzaDato(getValue(lotto, 'tempiCompletamento.dataInizio')))
        errori.push(addError(dict.errors.completezza.dataInizio, getLine(lotto,'tempiCompletamento.dataInizio')));
    if (!presenzaDato(getValue(lotto,'tempiCompletamento.dataUltimazione')))
        errori.push(addError(dict.warnings.completezza.dataUltimazione, getLine(lotto,'tempiCompletamento.dataUltimazione')));
    if (!presenzaDato(getValue(lotto,'strutturaProponente.codiceFiscaleProp')))
        errori.push(addError(dict.errors.completezza.codiceFiscaleProp, getLine(lotto,'strutturaProponente.codiceFiscaleProp')));
    if (!presenzaDato(getValue(lotto,'strutturaProponente.denominazione')))
        errori.push(addError(dict.errors.completezza.denominazione, getLine(lotto,'strutturaProponente.denominazione')));
    for (let j = 0; j < lotto.partecipanti.partecipante.length; j ++){
        if (!presenzaDato(getValue(lotto,`partecipanti.partecipante[${j}].codiceFiscale`)))
            errori.push(addError(dict.errors.completezza.codiceFiscalePartecipante, getLine(lotto,'partecipanti.partecipante[j].codiceFiscale')));
        if (!presenzaDato(getValue(lotto,`partecipanti.partecipante[${j}].ragioneSociale`)))
            errori.push(addError(dict.errors.completezza.ragioneSocialePartecipante, getLine(lotto,'partecipanti.partecipante[j].ragioneSociale')));
    }
    for (let j = 0; j < lotto.aggiudicatari.aggiudicatario.length; j ++){
        if (!presenzaDato(getValue(lotto,`aggiudicatari.aggiudicatario[${j}].codiceFiscale`)))
            errori.push(addError(dict.errors.completezza.codiceFiscaleAggiudicatario, getLine(lotto,'aggiudicatari.aggiudicatario[j].codiceFiscale')));
        if (!presenzaDato(getValue(lotto,`aggiudicatari.aggiudicatario[${j}].ragioneSociale`)))
            errori.push(addError(dict.errors.completezza.ragioneSocialeAggiudicatario, getLine(lotto,'aggiudicatari.aggiudicatario[j].ragioneSociale')));
    }
    return errori;
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
    let path = child + '._attributes.linea';
    let line = _.get(lotto, path);
    return line;
    // if (!line) return undefined;
}


var valutaCig = function (lotto) {
    let errore;
    if (!utils.checkCig(lotto.cig._text))
        errore = addError(dict.errors.correttezza.cig, lotto.cig._attributes.linea);

    return errore;
}

var addError = function (errorRef, line) {
    return {text:errorRef.text, type:errorRef.type, line };
}

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
            // console.log('sono un oggetto', dato[key])
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
