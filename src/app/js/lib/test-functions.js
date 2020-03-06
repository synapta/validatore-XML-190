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
































//
