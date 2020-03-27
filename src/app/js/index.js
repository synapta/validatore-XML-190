var pageStatus = function (status) {
    switch (status) {
        case 'homepage':
            $('#xml-form').text('');
            // $('#loading-lotti').hide();
            $('#loading').hide();
            $('#show').hide();
            $('#main').show();
            $('#messages').html('');
            $('#progress-steps').html('');
            $('#show-results').toggleClass( "ui primary active button" ).toggleClass( "ui primary disabled button" );
            if (window.myCodeMirror !== undefined) window.myCodeMirror.toTextArea();
            break;
        case 'loading':
            $('#custom-error').html('');
            $('#main').hide();
            $('#loading').show();
            $('#loading').html("Scarico il file...");
            break;
        case 'show-steps-with-error':
            $('#loading').hide();
            $('#main').show();
            break;
        case 'show-steps-successful':
            $('#show-results').toggleClass( "ui primary disabled button" ).toggleClass( "ui primary active button" );
            $('#loading').hide();
            $('#main').show();
            break;
        case 'loading-analysis':
            $('#custom-error').html('');
            $('#main').hide();
            $('#show-results').hide();
            $('#loading').show();
            $('#loading').html("Analizzo il file...");
            break;
        case 'show-success':
            $('#loading').hide();
            $('#xml-form').text();
            $('#main').show();
            $('#show').hide();
            break;
        case 'show-analysis1':
            $('#loading').hide();
            $('#xml-form').text();
            $('#main').hide();
            $('#show').show();
            break;
        case 'show-analysis2':
            $('.ui.accordion').accordion('refresh');
            $('.message .close')
                .on('click', function() {
                    $(this)
                    .closest('.message')
                    .transition('fade');
            });
            $('#scroll-to-top').hide();
            jQuery(document).ready(function() {
                var btn = $('#scroll-to-top');

                $(window).scroll(function() {
                if ($(window).scrollTop() > 400) {
                    btn.show();
                } else {
                    btn.hide();
                }
                });

                btn.on('click', function(e) {
                    e.preventDefault();
                    $('html, body').animate({scrollTop:0}, '300');
                });
            });
            break;
    }
}

var loadAnalysis = function () {
    pageStatus('homepage')
    pageStatus('loading')
    let url = $("#search-field").val();
    $.ajax({
        url: "/api/show/xml-from-site?url=" + encodeURI(url),
        type: 'GET',
        error: function(e) {
            makeProgressionSteps(e.responseJSON.progression)
            makeMessageUnderSearch(e.responseJSON.header,e.responseJSON.text, 'negative');
            pageStatus('show-steps-with-error')
        },
        success: function(data) {
            let haveComments = false;
            // prima di parsificare l'xml tolgo i commenti perché rompono la libreria xml-js
            let sanitizedData = sanitizeComments(data);
            if (data !== sanitizedData) haveComments = true;
            data = sanitizedData;
            makeProgressionSteps()
            pageStatus('show-steps-successful')
            if (haveComments) makeMessageUnderSearch('Attenzione', HTMLEncode(`È richiesto dalle linee guida di non usare commenti nel file (indicati da "<!-- testo del commento-->"), per la visualizzazione dell'analisi sono stati eliminati.`), 'warning')
            $('#show-results').click(() => {
                pageStatus('loading-analysis');
                showResults(data);
            })
        }
    });
}

let showResults = function (data) {
    $('#xml-form').text(data);

    window.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("xml-form"), {
        lineNumbers: true,
        lineWrapping: true,
        autoRefresh:true,
        readOnly: true,
        mode: 'xml'
        // viewportMargin: Infinity --carica tutto il file, puoi fare il cerca, ma se è grosso danni
    });
    let xmlView = window.myCodeMirror;
    xmlView.refresh();
    data = formatData(xmlView, data);
    $.ajax({
        url: '/api/analyze/xml',
        type: 'POST',
        data: data,
        contentType: 'text/plain',
        dataType: "json",
        success: function (res) {
            if (res.totErrors === 0 && res.totWarnings === 0) {
                pageStatus('show-success');
                makeMessageUnderSearch("Successo!", "L'analisi è andata a buon fine e non sono stati trovati errori. <br>Si può procedere con una nuova analisi.", 'positive')

            } else {
                pageStatus('show-analysis1');
                $('#numero-lotti').text(res.totLotti);
                $('#numero-errori').text(res.totErrors);
                $('#numero-avvisi').text(res.totWarnings);
                addMessages(res.errors)
                markAll(xmlView, res.errors);
                $(".link_line").click( function(e) {
                    console.log(e)
                    let line = parseInt(e.target.textContent) + 20;
                    e.preventDefault();
                    xmlView.scrollIntoView({line: line, char: 0})
                    return false;
                });
                $(".link_lotto").click( function(e) {
                    let line = parseInt(e.target.dataset.position) + 20;
                    e.preventDefault();
                    xmlView.scrollIntoView({line: line, char: 0})
                    return false;
                });
                pageStatus('show-analysis2');
            }
        },
        error: function(e) {
            alert("Errore nell'analisi :-(");
            console.log(e);
        }
    });

}

$('#home-logo').click(() => {
    pageStatus('homepage');
    $('#custom-error').html('');
});
$('#home-name').click(() => {
    pageStatus('homepage');
    $('#custom-error').html('');
});


$('#load-site').click(() => loadAnalysis() );
$("#search-field").keyup(function(event) {
    if (event.keyCode === 13) {
        loadAnalysis();
    }
});

sanitizeComments = function (string) {
    let sanitized = string.replace(/<!--.*?-->/g, '');
    return sanitized;
}

markLine = function (xmlView, line, type) {
    let mark = xmlView.markText({line: line -1, ch: 0}, {line: parseInt(line), ch: 0}, {className: "styled-"+type, addToHistory:true });
}

markAll = function(xmlView, errori) {
    let sortedErrori = [... errori];
    sortedErrori = sortedErrori.sort((a, b) => (a.line < b.line) ? 1 : (a.line === b.line) ? ((a.type < b.type) ? 1 : -1) : -1 );

    let errorsByLine = _.groupBy(errori, errore => errore.line );
    for (var line in errorsByLine) {
        if (errorsByLine.hasOwnProperty(line)) {
            let groupedError = errorsByLine[line];
            let type = 'warning';
            for (let i = 0; i < groupedError.length; i++) {
                if (groupedError[i].type === 'error') type = 'error';
            }
            if (line !== 'undefined') {
                markLine(xmlView,line, type);
            } else {
                // per gli errori che non hanno una riga ma solo quella di inizio lotto,
                // devo rifare lo stesso lavoro per le singole startLine per trovare gli errori rispetto ai warning
                let errorsByStartLine = _.groupBy(groupedError, errore => errore.startLine );
                for (var startLine in errorsByStartLine) {
                    if (errorsByStartLine.hasOwnProperty(startLine)) {
                        let groupedErrorStartLine = errorsByStartLine[startLine];
                        let type2 = 'warning';
                        for (let j = 0; j < groupedErrorStartLine.length; j++) {
                            if (groupedErrorStartLine[j].type === 'error') type2 = 'error';
                        }
                        markLine(xmlView,startLine, type2);
                    }
                }
            }
        }
    }
}

addMessages = function (errori) {
    let errorMap = groupBy(errori, errore => errore.code );
    let errorIter = errorMap.values();

    for (let i = 0; i < errorMap.size; i++) {
        let groupedError = errorIter.next().value;
        let errObj = groupedError[0];
        let lottoMap = groupBy(groupedError, errore => errore.lottoNumber);
        let lottoIter = lottoMap.values();
        let positions = [];
        for (let j = 0; j < lottoMap.size; j ++) {
            let coordinates = {};
            let groupedLotto = lottoIter.next().value;
            let linee = groupedLotto.map(errore => errore.line)
            coordinates.lottoNumber = groupedLotto[0].lottoNumber;
            coordinates.startLine = groupedLotto[0].startLine;
            coordinates.linee = linee.sort(function(a, b){return a - b});
            positions.push(coordinates);
        }
        groupedError.positions = positions;
        $('#messages').append(makeMessage(groupedError));
    }
}

makeMessage = function (errorObj) {
    let div = '<div class="ui ';
    let coordinates = '';
    for (let i = 0; i < errorObj.positions.length; i++){
        coordinates += `Lotto <span class="link_lotto" data-position="${errorObj.positions[i].startLine}">`
                            + errorObj.positions[i].lottoNumber + '</span>';
        for (let j = 0; j < errorObj.positions[i].linee.length; j ++) {
            if (j === 0) coordinates += ', linea ';
            if (errorObj.positions[i].linee[j] !== undefined) {
                coordinates += '<span class="link_line">' + errorObj.positions[i].linee[j] + '</span> ';
            } else {
                coordinates += 'mancante '
            }
        }
        if (errorObj.positions[i].linee.length > 0) coordinates += '<br>';

    }

    if (errorObj[0].type === 'error') div += 'negative message">';
    if (errorObj[0].type === 'warning') div += 'warning message">';
        div += `<i class="close icon"></i>
            <div class="header">
                ${errorObj.length} Errore/i: ${errorObj[0].text}
            </div>
            <p>${coordinates}</p>
            <div class="ui fluid accordion">
                <div class="title">
                    <i class="dropdown icon"></i>
                    Dettagli
                </div>
                    <div class="content">
                        <p>${errorObj[0].details}</p>
                    </div>
            </div>
        </div>
        `;
    return div;

}

makeProgressionSteps = function (step) {
    let div = "";
    let status = [];
    if (step === 0) status = ['disabled ','disabled ','disabled ']
    if (step === 1) status = ['completed ','active ','disabled ']
    if (step === 2) status = ['completed ','completed ','active ']
    if (step === undefined) status = ['completed ','completed ','completed ']
    div = `<div class="ui tablet stackable steps">
    <div class="${status[0]}step">
        <i class="cloud download icon"></i>
        <div class="content">
            <div class="title">Download</div>
            <div class="description">Scarico il file dal sito</div>
        </div>
    </div>
    <div class="${status[1]}step">
        <i class="file outline icon"></i>
        <div class="content">
            <div class="title">Tipo file</div>
            <div class="description">Controllo che il file sia un XML</div>
        </div>
    </div>
    <div class="${status[2]}step">
        <i class="file code outline icon"></i>
        <div class="content">
            <div class="title">Validazione XSD</div>
            <div class="description">Controllo che il file validi lo schema XSD</div>
        </div>
    </div>
</div>
<br>
<button class="ui primary disabled button" id='show-results'>
    Procedi
</button>`
    $('#progress-steps').html(div);
}


makeMessageUnderSearch = function (header, text, type) {
    let div = `
<div class="ui ${type} message">
    <div class="header">
    ${header}
    </div>
    <p>${text}</p>
</div>`;
    $('#custom-error').html(div);
}

function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
        const key = keyGetter(item).toString();
        const collection = map.get(key);
        if (!collection) {
            map.set(key, [item]);
        } else {
            map.get(key).push(item);
        }
    });
    return map;
}



formatData = function (xmlView,data) {
    // bisogna insistere per scollare fra loro tutti i tag
    // tag di apertura seguito da uno di chiusura
    data = data.replace(/<\?([^>]+?)\?>\s*<([^>]+?)>/g, '<?$1?>\n<$2>');

    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<\/([^>]+?)>\s*</g, '</$1>\n<');
    // due tag di chiusura di seguito
    data = data.replace(/<\/([^>]+?)>\s*<\/([^>]+?)>/g, '</$1>\n</$2>');
    data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    xmlView.setValue(data);
    indentData(xmlView,data);
    data = xmlView.getValue();
    return data;
}

var indentData = function (xmlView, data) {
    //indento il codice
    xmlView.setSelection({
        'line':xmlView.firstLine(),
        'ch':0,
        'sticky':null
      },{
        'line':xmlView.lastLine() + 1,
        'ch':0,
        'sticky':null
      },
      {scroll: false});
      xmlView.indentSelection("smart");
      xmlView.setCursor({
          'line':xmlView.firstLine(),
          'ch':0,
          'sticky':null
     })
}
function HTMLEncode(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
}

setParam = function (name, value) {
    var l = window.location;
    /* build params */
    var params = {};
    var x = /(?:\??)([^=&?]+)=?([^&?]*)/g;
    var s = l.search;
    for(var r = x.exec(s); r; r = x.exec(s)) {
        r[1] = decodeURIComponent(r[1]);
        if (!r[2]) r[2] = '%%';
        params[r[1]] = r[2];
    }
    /* set param */
    params[name] = encodeURIComponent(value);

    /* build search */
    var search = [];
    for(var i in params) {
        var p = encodeURIComponent(i);
        var v = params[i];
        if (v != '%%') p += '=' + v;
        search.push(p);
    }
    search = search.join('&');
    /* execute search */
    l.search = search;
}
