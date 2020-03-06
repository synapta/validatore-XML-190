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


























//