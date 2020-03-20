// template
// exports.presenzaDati = {
//     testName: 'presenzaDato',
//     fieldsToTest: [
//         {field: 'cig', code: 'ECM01'},
//         {field: 'strutturaProponente.codiceFiscaleProp', code: 'ECM02'},
//         {field: 'strutturaProponente.denominazione', code: 'ECM03'},
//         {field: 'oggetto', code: 'ECM04'},
//         {field: 'sceltaContraente', code: 'ECM05'},
//         {field: 'importoAggiudicazione', code: 'ECM06'},
//         {field: 'importoSommeLiquidate', code: 'WCM01'},
//         {field: 'tempiCompletamento.dataInizio', code: 'ECM07'},
//         {field: 'tempiCompletamento.dataUltimazione', code: 'WCM02'},
//         {field: 'partecipanti.partecipante._array.codiceFiscale', code: 'ECM08'},
//         {field: 'partecipanti.partecipante._array.ragioneSociale', code: 'ECM09'},
//         {field: 'aggiudicatari.aggiudicatario._array.codiceFiscale', code: 'ECM10'},
//         {field: 'aggiudicatari.aggiudicatario._array.ragioneSociale', code: 'ECM11'}
//     ]
// };

exports.presenzaDati = {
    testName: 'presenzaDato',
    fieldsToTest: [
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
        {field: 'aggiudicatari.aggiudicatario._array.ragioneSociale', code: 'ECM11'},
        {field: 'aggiudicatari.aggiudicatario._array', code: 'WCM03'},
        {field: 'partecipanti.partecipante._array', code: 'WCM04'}
    ]
};

exports.validitaCig = {
    testName: 'checkCig',
    fieldsToTest: [
        {field: 'cig', code: 'ECR01'}
    ]
};

exports.validitaCf = {
    testName: 'validitaCf',
    fieldsToTest: [
        {field: 'strutturaProponente.codiceFiscaleProp', code: 'ECR04'},
        {field: 'partecipanti.partecipante._array.codiceFiscale', code: 'ECR05'},
        {field: 'aggiudicatari.aggiudicatario._array.codiceFiscale', code: 'ECR06'}
    ]
};

exports.lunghezzaRagioneSociale = {
    testName: 'lunghezzaRagioneSociale',
    fieldsToTest: [
        {field: 'strutturaProponente.denominazione', code: 'WCR01'},
        {field: 'partecipanti.partecipante._array.ragioneSociale', code: 'WCR02'},
        {field: 'aggiudicatari.aggiudicatario._array.ragioneSociale', code: 'WCR03'}
    ]
};

exports.lunghezzaOggetto = {
    testName: 'lunghezzaOggetto',
    fieldsToTest: [
        {field: 'oggetto', code: 'WCR04'}
    ]
};

exports.importoNullo = {
    testName: 'importoNullo',
    fieldsToTest: [
        {field: 'importoAggiudicazione', code: 'WCR05'}
    ]
};

exports.importoTroppoGrande = {
    testName: 'importoTroppoGrande',
    fieldsToTest: [
        {field: 'importoAggiudicazione', code: 'WCR06'},
        {field: 'importoSommeLiquidate', code: 'WCR07'}
    ]
};

exports.importoNegativo = {
    testName: 'importoNegativo',
    fieldsToTest: [
        {field: 'importoAggiudicazione', code: 'ECR02'},
        {field: 'importoSommeLiquidate', code: 'ECR03'}
    ]
};

exports.coerenzaDate = {
    testName: 'coerenzaDate',
    fieldsToTest: [
        {fields: {dataFine: 'tempiCompletamento.dataUltimazione', dataInizio: 'tempiCompletamento.dataInizio'}, code: 'ECO01'},
    ]
};

exports.coerenzaImporti = {
    testName: 'coerenzaImporti',
    fieldsToTest: [
        {fields: {importoAggiudicazione: 'importoAggiudicazione', importoLiquidato: 'importoSommeLiquidate'}, code: 'WCO01'},
    ]
};

exports.validitaCf = {
    testName: 'validitaCf',
    fieldsToTest: [
        {field: 'strutturaProponente.codiceFiscaleProp', code: 'ECR04'},
        {field: 'partecipanti.partecipante._array.codiceFiscale', code: 'ECR05'},
        {field: 'aggiudicatari.aggiudicatario._array.codiceFiscale', code: 'ECR06'}
    ]
};

















//
