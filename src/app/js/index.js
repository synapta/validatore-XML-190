var returnToHome = function () {
    $('#xml-form').text('');
    $('#loading-lotti').hide();
    $('#loading').hide();
    $('#show').hide();
    $('#main').show();
    $('#messages').html('');
    $('#progress-steps').html('');
    $('#show-results').toggleClass( "ui primary active button" ).toggleClass( "ui primary disabled button" );
    // window.myCodeMirror.toTextArea();
}

var loadAnalysis = function () {
    $('#custom-error').html('');
    // $('#error-under-search').hide();
    $('#main').hide();
    $('#loading').show();
    let url = $("#search-field").val();
    $.ajax({
        url: "/api/show/xml-from-site?url=" + encodeURI(url),
        type: 'GET',
        error: function(e) {
            makeProgressionSteps(e.responseJSON.progression)
            makeErrorUnderSearch(e.responseJSON.header,e.responseJSON.text);
            $('#loading').hide();
            $('#main').show();
            // console.log(e);
            // returnToHome();
        },
        success: function(data) {
            makeProgressionSteps()
            // document.getElementById('show-results').classList.add('active');
            $('#show-results').toggleClass( "ui primary disabled button" ).toggleClass( "ui primary active button" );

            $('#loading').hide();
            $('#main').show();

            $('#show-results').click(() => {
                showResults(data);
            })
        }
    });
}

let showResults = function (data) {
    $('#xml-form').text();
    $('#main').hide();
    // $('#loading').hide();
    $('#show').show();
    $('#loading-lotti').show();
    $('#xml-form').text(data);
    // window.location.search += 'id=' + encodeURI(url);
    // setParam('url',url)

    window.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("xml-form"), {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'xml'
        // viewportMargin: Infinity --carica tutto il file, puoi fare il cerca, ma se è grosso danni
    });
    let xmlView = window.myCodeMirror;
    data = formatData(xmlView, data);

    $.ajax({
        url: '/api/analyze/xml',
        type: 'post',
        data: data,
        contentType: 'text/plain',
        dataType: "json",
        success: function (res) {
            $('#loading-lotti').hide();
            $('#numero-lotti').text(res.totLotti);
            $('#numero-errori').text(res.totErrors);
            $('#numero-avvisi').text(res.totWarnings);
            addMessages(res.errors)
            markAll(xmlView, res.errors);
            $(".error_line").click( function(e) {
                let line = e.target.textContent;
                e.preventDefault();
                xmlView.scrollIntoView({line:line, char:0})
                return false;
            });
            alert("Analizzato!");
        },
        error: function(e) {
            alert("Errore nell'analisi :-(");
            console.log(e);
        }
    });

}

$('#home-logo').click(() => {
    returnToHome();
    $('#custom-error').html('');
});
$('#home-name').click(() => {
    returnToHome();
    $('#custom-error').html('');
});


$('#load-site').click(() => loadAnalysis() );
$("#search-field").keyup(function(event) {
    if (event.keyCode === 13) {
        loadAnalysis();
    }
});


$('.message .close')
  .on('click', function() {
    $(this)
      .closest('.message')
      .transition('fade')
    ;
  })
;

markLine = function (xmlView, line, type) {
    xmlView.markText({line: line -1, ch: 0}, {line: parseInt(line), ch: 0}, {className: "styled-"+type });
}

markAll = function(xmlView, errori) {
    // console.log(errori)
    for (let i = 0; i < errori.length; i++) {
        markLine(xmlView,errori[i].line, errori[i].type)
    }
}
addMessages = function (errori) {
    for (let i = 0; i < errori.length; i++) {
        $('#messages').append(makeMessage(errori[i].type,errori[i].text,errori[i].line));
    }
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
        <i class="file code outline icon"></i>
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
</div>`
    $('#progress-steps').html(div);
}


makeErrorUnderSearch = function (header, text) {
    let div = `
<div class="ui negative message">
    <i class="close icon"></i>
    <div class="header">
    ${header}
    </div>
    <p>${text}</p>
</div>`;
    $('#custom-error').html(div);
    // $('#text-error-under-search').text(text);
    // $('#header-error-under-search').text(header);
}

// makeError = function (idH,idP) {
//     return
// }


makeMessage = function (type,text,line) {
    let div = '<div class="ui ';

    if (type === 'error') div += 'negative message">';
    if (type === 'warning') div += 'warning message">';
        div += `<i class="close icon"></i>
            <div class="header">
                Errore: ${text}
            </div>
            <p>Linea <span class="error_line">${line}</span> </p>
        </div>
        `;
    return div;

}

formatData = function (xmlView,data) {
    // console.log(data)
    // bisogna insistere per scollare fra loro tutti i tag
    // tag di apertura seguito da uno di chiusura
    data = data.replace(/<\?([^>]+?)\?>\s*<([^>]+?)>/g, '<?$1?>\n<$2>');

    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+?)>\s*<([^\/>]+?)>/g, '<$1>\n<$2>');
    data = data.replace(/<\/([^>]+?)>\s*</g, '</$1>\n<');
    // console.log(data)
    // due tag di chiusura di seguito
    data = data.replace(/<\/([^>]+?)>\s*<\/([^>]+?)>/g, '</$1>\n</$2>');
    data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    // console.log(data)
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

setParam = function (name, value) {
    var l = window.location;

    /* build params */
    var params = {};
    var x = /(?:\??)([^=&?]+)=?([^&?]*)/g;
    var s = l.search;
    for(var r = x.exec(s); r; r = x.exec(s))
    {
        r[1] = decodeURIComponent(r[1]);
        if (!r[2]) r[2] = '%%';
        params[r[1]] = r[2];
    }

    /* set param */
    params[name] = encodeURIComponent(value);

    /* build search */
    var search = [];
    for(var i in params)
    {
        var p = encodeURIComponent(i);
        var v = params[i];
        if (v != '%%') p += '=' + v;
        search.push(p);
    }
    search = search.join('&');

    /* execute search */
    l.search = search;
}
