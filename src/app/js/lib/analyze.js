// var synapta_x2j = require('./synapta_x2j/build/Release/synapta_x2j.node');
var x2j = require('xml-js');
var dictionary = require('./error-dictionary.json');

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
    console.log(lotti[0])
    let errori = [];
    for (let i = 0; i < lotti.length; i ++) {
        errori = analyzeLotto(lotti[i]);
    }

    // console.log(xmlJSON[firstLevel].data.lotto[0])

    cb(
        {
            totLotti: totLotti,
            errors: errori
        }
    )
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

//TODO alle volte all'interno del tag hai del text, alle volte del CDATA

var analyzeLotto = function (lotto) {
    lotto.partecipanti = rendiArray(lotto.partecipanti);
    lotto.aggiudicatari = rendiArray(lotto.aggiudicatari);

    let datiSingoli = ['cig','oggetto','sceltaContraente', 'importoAggiudicazione', 'importoSommeLiquidate']
    for (let key in lotto ){
        console.log(key, presenzaDato(lotto[key]._text),lotto[key]._text);
    }
    let erroriCompletezza = presenzaDati(lotto);
    console.log(erroriCompletezza);
    return erroriCompletezza;

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
    let errori = [];
    // errorTemplate = {text: '', line: 0, type: 'errore'}
    if (!presenzaDato(lotto.cig._text)) errori.push(addError(dictionary.errors.completezza.cig, lotto.cig._attributes.linea))
    return errori;
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
            console.log('sono un oggetto', dato[key])
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
