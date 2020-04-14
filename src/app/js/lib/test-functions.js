const moment = require('moment');
const utils = require('./utils.js')
moment.locale('it');

// se un campo è compilato o meno (potrebbe anche essere assente il tag)
exports.presenzaDato = function (dato) {
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

// se ragione sociale più corta di 3 caratteri troppo corta
exports.lunghezzaRagioneSociale = function (nome) {
    if (nome === undefined || nome === null) return true;
    if (nome.length < 4) return false;
    return true;
}

// se meno di 5 parole oggetto troppo corto
exports.lunghezzaOggetto = function (oggetto) {
    if (oggetto === undefined || oggetto === null) return true;
    let parole = oggetto.split(' ');
    if (parole.length < 5) return false;
    return true;
}

// se la data d'inizio è successiva a quella di fine
exports.coerenzaDate = function (obj) {
    let dataInizio = obj.dataInizio;
    let dataFine = obj.dataFine;
    if (dataInizio === undefined || dataInizio === null) return true;
    if (dataFine === undefined || dataFine === null) return true;
    dataInizio = Date.parse(dataInizio);
    dataFine = Date.parse(dataFine);
    if (dataInizio > dataFine) return false;
    return true;

}

// se l'importo liquidato è più del doppio di quello d'aggiudicazione
exports.coerenzaImporti = function (obj) {
    let importo = obj.importoAggiudicazione;
    let liquidato = obj.importoLiquidato;
    if (importo === undefined || importo === null) return true;
    if (liquidato === undefined || liquidato === null) return true;
    if (isNaN(importo)) return true;
    if (isNaN(liquidato)) return true;
    importo = parseFloat(importo);
    liquidato = parseFloat(liquidato);
    if (liquidato > importo * 2) return false;
    return true;
}

//se il codice fiscale/partita iva è valido
exports.validitaCf = function (cf) {
    if (cf === undefined || cf === null) return true;
    if (!utils.verificaPartitaIva(cf) && !utils.verificaCodiceFiscale(cf)) return false;
    return true;
}

// controllo che gli importi non abbiano altre stringhe oltre all'importo
exports.sintassiImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    importo = importo.trim();
    // se matcha una qualunque cosa che non sono numeri, virgole, punti o virgolette dà errore
    if (importo.match(/[^\d\.,']/)) return false;
    return true;
}

// controllo che gli importi siano nel formato NNNNNN.DD
exports.formatoImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    // spurgo la stringa da tutto quello che non è un numero, virgole, punti o virgolette
    importo = importo.replace(/[^\d\.,']/g, '');
    importo = importo.trim();
    // non mi preme vedere se la cifra ha il giusto numero di cifre dopo la virgola, voglio vedere se c'è un solo divisorio
    // qualunque cosa diversa da "numeri-divisiorio-numeri" o "numeri" -> errore!
    if (!importo.match(/^\d+(.\d+)?$/)) return false;
    // 123123,23 ci vuole il punto!
    if (importo.match(/^\d+[^\d\.]\d+$/)) return false;
    // 00000123.12 zeri all'inizio del numero
    if (importo.match(/^0+[1-9]+/)) return false;
    return true
}

// controllo che gli importi siano precisi, ovvero con tutte e solo due cifre decimali NNNNNN.DD
exports.precisioneImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    importo = importo.replace(/[^ \d\.,']/g, '');
    importo = importo.trim();
    // 123.123123 o 123.1
    if (importo.match(/^[\d\,\. ']+[\.\, ](\d{3,}?|\d)$/)) return false;
    // 123123 (senza virgola)
    if (importo.match(/^\d+$/)) return false;
    return true;
}

// se l'importo è nullo
exports.importoNullo = function (importo) {
    if (importo === undefined || importo === null) return true;
    if (isNaN(importo)) return true;
    if (parseFloat(importo) === 0) return false;
    return true;
}

// se gli importi sono negativi o troppo grandi
exports.importoTroppoGrande = function (importo) {
    if (importo === undefined || importo === null) return true;
    if (isNaN(importo)) return true;
    if ( parseFloat(importo) > 10000000000) return false;
    return true;
}

// se gli importi sono negativi o troppo grandi
exports.importoNegativo = function (importo) {
    if (importo === undefined || importo === null) return true;
    if (isNaN(importo)) return true;
    if ( parseFloat(importo) < 0) return false;
    return true;
}

// controllo che le date non abbiano altre stringhe oltre alla data stessa
//(è un controllo un po' lasco perché è un falso positivo per questo test specifico una data nel formato '12 agosto 2012')
exports.sintassiDate = function (data) {
    if (data === undefined || data === null) return true;
    if (data.match(/[^\d\.\-\/ \\]/)) return false;
    return true;
}

// controllo che le date siano nel formato ISO
exports.formatoDate = function (data) {
    if (data === undefined || data === null) return true;
    let cleanDate = data.replace(/[^\d\.\-\/\\]/gi, '');

    cleanDate = cleanDate.trim();
    //se moment può trovare una data valida, allora vedo se è nel formato giusto
    if (!moment(cleanDate, 'YYYY-MM-DD', true).isValid())
        return false;
    return true;
}

// controllo che le date siano precise, ovvero con tutte le cifre necessarie
// (in pratica significa se le date hanno l'anno scritto con 2 cifre invece di tutte e 4)
exports.precisioneDate = function (data) {
    if (data === undefined || data === null) return true;
    data = data.trim();
    if (moment(data, 'YY-MM-DD', true).isValid()) return false;
    if (moment(data, 'DD-MM-YY', true).isValid()) return false;
    if (moment(data, 'YY MMMM DD', true).isValid()) return false;
    if (moment(data, 'DD MMMM YY', true).isValid()) return false;
    return true;
}

// controllo se le date sono entro un range ragionevole
exports.rangeDate = function (data) {
    if (data === undefined || data === null) return true;
    //controllo lasco, ma dovrebbe bastare: estraggo l'anno!
    let cleanDate = data.replace(/[^\d\.\-\/\\]/gi, '');
    let year = cleanDate.match(/[0-3]\d\d\d/);
    if (parseInt(cleanDate) > 2100) return false;
    if (parseInt(cleanDate) < 2000) return false;
    return true;
}





//
