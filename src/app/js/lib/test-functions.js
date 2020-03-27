const moment = require('moment');

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


// funzioni di data quality
// var dqDataRange = function (date) {
//     if (new Date(date) > new Date('2100-01-01 00:00:00')) return false;
//     if (new Date(date) < new Date('2000-01-01 00:00:00')) return false;
//     return true;
// }

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
    if (!verificaPartitaIva(cf) && !verificaCodiceFiscale(cf)) return false;
    return true;
}

// controllo che gli importi non abbiano altre stringhe oltre all'importo
exports.sintassiImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    importo = importo.trim();
    if (importo.match(/[^\d\.,']/)) return false;
    return true;
}

// controllo che gli importi siano nel formato NNNNNN.DD
exports.formatoImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    importo = importo.replace(/[^ \d\.,']/g, '');
    importo = importo.trim();
    if (!importo.match(/^\d+(.\d+)?$/)) return false;
    if (importo.match(/^\d+[^\.]\d+$/)) return false;
    return true
}

// controllo che gli importi siano precisi, ovvero con tutte e solo due cifre decimali NNNNNN.DD
exports.precisioneImporti = function (importo) {
    if (importo === null || importo === undefined) return true;
    importo = importo.replace(/[^ \d\.,']/g, '');
    importo = importo.trim();
    if (importo.match(/^\d+.\d{3,}?$/)) return false;
    if (importo.match(/^\d+$/)) return false;
    return true
}


var verificaPartitaIva = function (piva) {
    piva = piva.trim();
    if (piva.length !== 11) return false;
    if (piva.match(/^\d+$/) === null) return false;
    let arr = Array.from(piva, x => parseInt(x));
    let sum = 0;
    for (let i = 0; i < 11; i++) {
        if (i % 2 === 0) {
            sum += arr[i];
        } else {
            sum = arr[i]*2  >= 10 ? sum + arr[i]*2 - 9 : sum + arr[i]*2;
        }
    }
    if (sum % 10 === 0) return true;
    return false;
}



var verificaCodiceFiscale = function (cf) {
    cf = cf.trim();
    cf = cf.toUpperCase();
    if (cf.length !== 16) return false;
    // if (cf.match(/^\d+$/) === null) return false;
    let arr = Array.from(cf, x => isNaN(x) ? x : parseInt(x));
    let sum = 0;
    let dic = {
        '0' : {p: 0,d: 1},
        '1' : {p: 1,d: 0},
        '2' : {p: 2,d: 5},
        '3' : {p: 3,d: 7},
        '4' : {p: 4,d: 9},
        '5' : {p: 5,d: 13},
        '6' : {p: 6,d: 15},
        '7' : {p: 7,d: 17},
        '8' : {p: 8,d: 19},
        '9' : {p: 9,d: 21},
        'A' : {p: 0,d: 1},
        'B' : {p: 1,d: 0},
        'C' : {p: 2,d: 5},
        'D' : {p: 3,d: 7},
        'E' : {p: 4,d: 9},
        'F' : {p: 5,d: 13},
        'G' : {p: 6,d: 15},
        'H' : {p: 7,d: 17},
        'I' : {p: 8,d: 19},
        'J' : {p: 9,d: 21},
        'K' : {p: 10,d: 2},
        'L' : {p: 11,d: 4},
        'M' : {p: 12,d: 18},
        'N' : {p: 13,d: 20},
        'O' : {p: 14,d: 11},
        'P' : {p: 15,d: 3},
        'Q' : {p: 16,d: 6},
        'R' : {p: 17,d: 8},
        'S' : {p: 18,d: 12},
        'T' : {p: 19,d: 14},
        'U' : {p: 20,d: 16},
        'V' : {p: 21,d: 10},
        'W' : {p: 22,d: 22},
        'X' : {p: 23,d: 25},
        'Y' : {p: 24,d: 24},
        'Z' : {p: 25,d: 23},
    }
    let controllo = {
        '0' : 'A',
        '1' : 'B',
        '2' : 'C',
        '3' : 'D',
        '4' : 'E',
        '5' : 'F',
        '6' : 'G',
        '7' : 'H',
        '8' : 'I',
        '9' : 'J',
        '10' : 'K',
        '11' : 'L',
        '12' : 'M',
        '13' : 'N',
        '14' : 'O',
        '15' : 'P',
        '16' : 'Q',
        '17' : 'R',
        '18' : 'S',
        '19' : 'T',
        '20' : 'U',
        '21' : 'V',
        '22' : 'W',
        '23' : 'X',
        '24' : 'Y',
        '25' : 'Z'
    }
    for (i = 1; i < 16; i ++){
        if (i % 2 === 0) {
            sum += dic[arr[i - 1]].p // converto i pari
        } else {
            sum += dic[arr[i - 1]].d
        }
    }
    let resto = sum % 26;
    if (controllo[resto] === arr[15]) return true;
    return false;
}




// console.log(verificaCodiceFiscale('rstsbn93t56g628p'))












//
