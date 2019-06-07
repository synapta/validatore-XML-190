exports.validaData = function (data) {
    let regex = /^(-?(?:[1-9][0-9]*)?[0-9]{4})-(1[0-2]|0[1-9])-(3[01]|0[1-9]|[12][0-9])$/g;
    if (data.match(regex)) {
        return true;
    }
    return false;
}


exports.dataFineDopoDataInizio = function (dataInizio, dataFine) {
    dataInizio = new Date(dataInizio);
    dataFine = new Date(dataFine);

    if (dataInizio <= dataFine) {
        return true;
    }
    return false;
}
