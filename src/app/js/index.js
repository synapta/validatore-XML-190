var returnToHome = function () {
    $('#xml-form').text('');
    $('#loading-lotti').hide();
    $('#loading').hide();
    $('#show').hide();
    $('#main').show();
    $('#messages').html('');
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
            makeErrorUnderSearch("C'è un problema con l'URL immesso :-(","");
            // alert();
            console.log(e);
            returnToHome();
        },
        success: function(data) {
                    $('#xml-form').text();
                    $('#loading').hide();
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
                            // $('.message .close')
                            //   .on('click', function() {
                            //     $(this)
                            //       .closest('.message')
                            //       .transition('fade')
                            //     ;
                            //   })
                            // ;

                        },
                        error: function(e) {
                            alert("Errore nell'analisi :-(");
                            console.log(e);
                        }
                    });
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
