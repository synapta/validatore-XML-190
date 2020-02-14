// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');
var dictionary = require('./error-dictionary.json');
var utils = require('./utils.js');

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
    // console.log(dictionary.warnings.completezza.importoSommeLiquidate)
    let errori = [];
    let datiSingoli = ['cig','oggetto','sceltaContraente', 'importoAggiudicazione']
    for (let i = 0; i < datiSingoli.length; i++) {
        if (!presenzaDato(lotto[datiSingoli[i]]._text))
            errori.push(addError(dictionary.errors.completezza[datiSingoli[i]], lotto[datiSingoli[i]]._attributes.linea));
    }
    if (!presenzaDato(lotto.importoSommeLiquidate._text))
        errori.push(addError(dictionary.warnings.completezza.importoSommeLiquidate, lotto.importoSommeLiquidate._attributes.linea));
    if (!presenzaDato(lotto.tempiCompletamento.dataInizio._text))
        errori.push(addError(dictionary.errors.completezza.dataInizio, lotto.tempiCompletamento.dataInizio._attributes.linea));
    if (!presenzaDato(lotto.tempiCompletamento.dataUltimazione._text))
        errori.push(addError(dictionary.warnings.completezza.dataUltimazione, lotto.tempiCompletamento.dataUltimazione._attributes.linea));
    if (!presenzaDato(lotto.strutturaProponente.codiceFiscaleProp._text))
        errori.push(addError(dictionary.errors.completezza.codiceFiscaleProp, lotto.strutturaProponente.codiceFiscaleProp._attributes.linea));
    if (!presenzaDato(lotto.strutturaProponente.denominazione._text))
        errori.push(addError(dictionary.errors.completezza.denominazione, lotto.strutturaProponente.denominazione._attributes.linea));
    for (let j = 0; j < lotto.partecipanti.partecipante.length; j ++){
        if (!presenzaDato(lotto.partecipanti.partecipante[j].codiceFiscale._text))
            errori.push(addError(dictionary.errors.completezza.codiceFiscalePartecipante, lotto.partecipanti.partecipante[j].codiceFiscale._attributes.linea));
        if (!presenzaDato(lotto.partecipanti.partecipante[j].ragioneSociale._text))
            errori.push(addError(dictionary.errors.completezza.ragioneSocialePartecipante, lotto.partecipanti.partecipante[j].ragioneSociale._attributes.linea));
    }
    for (let j = 0; j < lotto.aggiudicatari.aggiudicatario.length; j ++){
        if (!presenzaDato(lotto.aggiudicatari.aggiudicatario[j].codiceFiscale._text))
            errori.push(addError(dictionary.errors.completezza.codiceFiscaleAggiudicatario, lotto.aggiudicatari.aggiudicatario[j].codiceFiscale._attributes.linea));
        if (!presenzaDato(lotto.aggiudicatari.aggiudicatario[j].ragioneSociale._text))
            errori.push(addError(dictionary.errors.completezza.ragioneSocialeAggiudicatario, lotto.aggiudicatari.aggiudicatario[j].ragioneSociale._attributes.linea));
    }
    return errori;
}

var valutaCig = function (lotto) {
    let errore;
    if (!utils.checkCig(lotto.cig._text))
        errore = addError(dictionary.errors.correttezza.cig, lotto.cig._attributes.linea);

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
