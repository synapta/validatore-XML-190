var pageStatus = function (status) {
    switch (status) {
        case 'homepage':
            $('#xml-form').text('');
            $('#loading').hide();
            $('#show').hide();
            $('#messages').html('');
            $('#custom-error').html('');
            $('#progress-steps').html('');
            if (window.myCodeMirror !== undefined) window.myCodeMirror.toTextArea();
            break;
        case 'loading':
            $('#loading').show();
            $('#loading').html("Scarico il file...");
            break;
        case 'show-steps-with-error':
            $('#loading').hide();
            break;
        case 'show-steps-successful':
            $('#loading').hide();
            break;
        case 'loading-analysis':
            $('#show-results').hide();
            $('#loading').show();
            $('#loading').html("Analizzo il file...");
            break;
        case 'show-success':
            $('#loading').hide();
            $('#xml-form').text();
            $('#show').hide();
            break;
        case 'show-error':
            $('#loading').hide();
            break;
        case 'show-analysis1':
            $('#loading').hide();
            $('#xml-form').text();
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

//scarico la risorsa e faccio i primi controlli per vedere se è un xml valido
var loadAnalysis = function (url) {
    let isIndex = false;
    let isEmpty = false;
    pageStatus('homepage')
    pageStatus('loading')
    $.ajax({
        url: "/api/show/xml-from-site?url=" + encodeURI(url),
        type: 'GET',
        error: function(e) {
            // non è stato possibile arrivare all'analisi per un x motivo
            if (e.responseJSON.is_index === true) isIndex = true;
            makeProgressionSteps(e.responseJSON.progression)
            if (isIndex)
                makeMessageUnderSearch(dict['indice_w_errori']);
            makeMessageUnderSearch({title: e.responseJSON.header, text: e.responseJSON.text, type: 'negative'});
            if (e.responseJSON.is_empty === true)
                makeMessageUnderSearch(dict['vuoto']);
            pageStatus('show-steps-with-error');
        },
        success: function(data) {
            // il file ha superato tutti i primi controlli, quindi procedo con l'analisi di data quality
            if (data.match(/<\s*indici/)) isIndex = true;
            if (data.match(/<\s*data\s*\/\s*>/)) isEmpty = true;
            let haveComments = false;
            // prima di parsificare l'xml tolgo i commenti perché rompono la libreria xml-js
            let sanitizedData = sanitizeComments(data);
            if (data !== sanitizedData) haveComments = true;
            data = sanitizedData;

            if (haveComments) makeMessageUnderSearch(dict['has_comments'])

            if (isIndex) {
                makeProgressionSteps();
                pageStatus('show-steps-with-error')
                makeMessageUnderSearch(dict['indice_no_errori'])
            }
            else if (isEmpty) {
                makeProgressionSteps(3);
                pageStatus('show-steps-with-error')
                makeMessageUnderSearch(dict['vuoto']);
            } else {
                pageStatus('show-steps-successful')
                pageStatus('loading-analysis');
                showResults(data);
            }

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
        mode: 'xml',
        tabMode: "indent",
        styleActiveLine: true,
        autoCloseTags: true,
        gutters: ['gutter-error',"CodeMirror-linenumbers"],
        lint: true
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
            // mostro gli errori di data quality trovati, se ce ne sono
            if (res.totErrors === 0 && res.totWarnings === 0) {
                makeProgressionSteps();
                pageStatus('show-success');
                makeMessageUnderSearch(dict['successo'])

            } else {
                makeProgressionSteps(3);
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
            makeProgressionSteps(3);
            pageStatus('show-error');
            makeMessageUnderSearch({title: "C'è stato un errore nell'analisi :-(", text: e.responseText, type: 'negative'});
            console.log(e);
        }
    });

}

if (window.location.search.indexOf('?url=') > -1) {
    let url = new URL(window.location);
    loadAnalysis(url.searchParams.get("url"));
}

$("input:text:visible:first").focus();

$('#home-name').click(() => {
    pageStatus('homepage');
    $('#custom-error').html('');

});


$('#load-site').click(() => {
    let url = $("#search-field").val();
    window.location.href = '?url=' + encodeURI(url);
    }
);

$("#search-field").keyup(function(event) {
    if (event.keyCode === 13) {
        let url = $("#search-field").val();
        window.location.href = '?url=' + encodeURI(url);
    }
});

sanitizeComments = function (string) {
    let sanitized = string.replace(/<!--.*?-->/g, '');
    return sanitized;
}

markLine = function (xmlView, line, type) {
    let mark = xmlView.markText({line: line -1, ch: 0}, {line: parseInt(line), ch: 0}, {className: "styled-"+type, addToHistory:true });
}

//funzione per aggiungere le icone al lato della riga (sul gutter accanto ai numeri)
//con il tooltip con il testo di tutti gli errori rilevati a quella riga
setLint = function (xmlView,line,text, type ) {
    line = line - 1;
    let color = 'yellow';
    const marker = document.createElement("i");
    if (type === 'error') color = 'red';

    marker.setAttribute('class','large ' + color + ' x icon');
    marker.setAttribute('data-html', text);
    marker.setAttribute('data-variation', 'large very wide');
    xmlView.setGutterMarker(line,'gutter-error',marker);
    $('.icon').popup();
}

// evidenzio le righe dell'XML che hanno un errore o un warning
markAll = function(xmlView, errori) {

    xmlView.clearGutter('gutter-error');
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
                let lintText = errorsByLine[line].map(el =>
                    el.type === 'error' ? '<font color="red">Errore:</font> ' + el.text: '<font color="orange">Avviso:</font> ' + el.text);
                lintText = lintText.toString().replace(/,/g,'<br/>');
                setLint(xmlView,line,lintText,type)
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
                        let lintText = errorsByStartLine[startLine].map(el =>
                            el.type === 'error' ? '<font color="red">Errore:</font> ' + el.text: '<font color="orange">Avviso:</font> ' + el.text);
                        lintText = lintText.toString().replace(/,/g,'<br/>');
                        setLint(xmlView,startLine,lintText,type2)
                        markLine(xmlView,startLine, type2);
                    }
                }
            }
        }
    }
}

// riformulo l'oggetto degli errori di data quality, raggruppandoli per tipo
// e poi per lotto
addMessages = function (errori) {
    let errorByCode = _.groupBy(errori, errore => errore.code);
    let sortable = [];
    for (var error in errorByCode) {
        sortable.push([error, errorByCode[error]]);
    }

    sortable.sort(function(a, b) {
        if (a[1][0].type === b[1][0].type) {
           return b[1].length - a[1].length;
        }
        return a[1][0].type > b[1][0].type ? 1 : -1;
    });
    var errorByCodeSorted = {}
    sortable.forEach(function(item){
        errorByCodeSorted[item[0]]=item[1];
    })
    for (let code in errorByCodeSorted) {
        let groupedError = errorByCodeSorted[code];
        let errObj = groupedError[0];
        let lottoByLottoNumber = _.groupBy(groupedError, errore => errore.lottoNumber);
        let positions = [];

        for (let lottoNumber in lottoByLottoNumber) {
            let coordinates = {};
            let groupedLotto = lottoByLottoNumber[lottoNumber];
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

// creo l'HTML per i messaggi di errori di data quality
makeMessage = function (errorObj) {
    let div = '<div class="ui ';
    let coordinates = '';
    let maxShownRows = 5;
    for (let i = 0; i < errorObj.positions.length; i++){
        if (i === maxShownRows) {
            coordinates += `
            <div class="ui fluid accordion">
                <div class="title">
                    <i class="dropdown icon"></i>
                    Più righe
                </div>
                    <div class="content">
                        <p>`
        }
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
        if (i === errorObj.positions.length - 1 && i >= maxShownRows) {
            coordinates += `
                        </p>
                    </div>
            </div>`
        }
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

// creo l'HTML per la barra di progressione a step dell'analisi del link
makeProgressionSteps = function (step) {
    let div = "";
    let status = [];
    if (step === 0) status = ['active ','red x ', 'disabled ', 'file outline ', 'disabled ', 'file code outline ','disabled ', 'table ']
    if (step === 1) status = ['completed ','cloud download ', 'active ', 'red x ', 'disabled ', 'file code outline ','disabled ', 'table ']
    if (step === 2) status = ['completed ','cloud download ', 'completed ', 'file outline ', 'active ', 'red x ','disabled ', 'table ']
    if (step === 3) status = ['completed ','cloud download ', 'completed ', 'file outline ', 'completed ', 'file code outline ','active ', 'red x ']
    if (step === undefined) status = ['completed ','','completed ', '', 'completed ', '','completed ', 'table ']
    div = `<div class="ui tablet stackable steps">
    <div class="${status[0]}step">
        <i class="${status[1]} icon"></i>
        <div class="content">
            <div class="title">Download</div>
            <div class="description">Scarico il file </div>
        </div>
    </div>
    <div class="${status[2]}step">
        <i class="${status[3]} icon"></i>
        <div class="content">
            <div class="title">Tipo file</div>
            <div class="description">Controllo che sia un XML</div>
        </div>
    </div>
    <div class="${status[4]}step">
        <i class="${status[5]} icon"></i>
        <div class="content">
            <div class="title">Validazione XSD</div>
            <div class="description">Valido con lo schema XSD</div>
        </div>
    </div>
    <div class="${status[6]}step">
        <i class="${status[7]} icon"></i>
        <div class="content">
            <div class="title">Analisi dati</div>
            <div class="description">Controllo che non ci siano errori nei dati</div>
        </div>
    </div>
</div>`
    $('#progress-steps').html(div);
}

// creo HTML per i messaggi di informazione/errore sotto la buca di ricerca
makeMessageUnderSearch = function (ref) {
    let header = ref.title;
    let text = ref.text;
    let type = ref.type;
    let div = `
    <div class="ui ${type} message">
        <div class="header">
        ${header}
        </div>
        <p>${text}</p>
    </div>`;
    $('#custom-error').append(div);
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
    // (esistono infatti i file monoriga)
    // tag di apertura seguito da uno di chiusura
    data = data.replace(/<\?([^>]+?)\?>[ \t]*<([^>]+?)>/g, '<?$1?>\n<$2>');
    data = data.replace(/<([^>]+?)>[ \t]*<([^>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>[ \t]*<([^>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>[ \t]*<([^>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>[ \t]*<([^>]+?)>/g, '<$1>\n<$2>');

    xmlView.setValue(data);
    indentData(xmlView,data);
    data = xmlView.getValue();
    return data;
}

//indento il codice del file XML
var indentData = function (xmlView, data) {
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


function addLoadEvent(func) {
  var oldonload = window.onload;
  if (typeof window.onload != 'function') {
    window.onload = func;
  } else {
    window.onload = function() {
      if (oldonload) {
        oldonload();
      }
      func();
    }
  }
}
