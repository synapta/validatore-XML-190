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
    
    return true;
}





















//
