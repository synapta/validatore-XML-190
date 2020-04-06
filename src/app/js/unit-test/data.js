var data = {};

//*********************************
//          TEST 1
//*********************************
data.precisioneImporti = [
    { description : 'bassa precisione',
    inputData : '43', expectedOutput : false},
    { description : 'formato sbagliato ma giusta precisione',
    inputData : '43,12', expectedOutput : true},
    { description : 'bassa precisione',
    inputData : '43.1', expectedOutput : false},
    { description : 'precisione eccessiva',
    inputData : '43.13131231', expectedOutput : false},
    { description : 'bassa precisione e sintassi sbagliata',
    inputData : 'antani 12313', expectedOutput : false},
    { description : 'precisione eccessiva, formato sbagliato',
    inputData : '12.243,2131321', expectedOutput : false}
];

data.formatoDate = [
    { description : 'bassa precisione',
    inputData : '12-01-54', expectedOutput : false},
    { description : 'formato sbagliato',
    inputData : '01-01-2001', expectedOutput : false},
    { description : 'bassa precisione',
    inputData : '15-01-01', expectedOutput : false},
    { description : 'formato sbagliato',
    inputData : '15 agosto 2012', expectedOutput : false},
    { description : 'giusto formato, sintassi sbagliata',
    inputData : 'antani 2012-01-01', expectedOutput : true},
    { description : 'formato giusto',
    inputData : '2000-01-01', expectedOutput : true}
];


//*********************************
//          TEST n-th function
//*********************************
// data.nomefunzione = [
//     { description : 'bassa precisione',
//    inputData : '43', expectedOutput : false}
// ]

exports.data = data;
