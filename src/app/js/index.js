var returnToHome = function () {
    $('#loading-lotti').hide();
    $('#loading').hide();
    $('#show').hide();
    $('#main').show();
    $('#xml-form').text('');
    $('#messages').html();
}


$('#home-logo').click(() => returnToHome() );
$('#home-name').click(() => returnToHome() );

$('#load-site').click(function () {
    $('#main').hide();
    $('#loading').show();
    let url = $("#search-field").val();
    $.ajax({
        url: "/api/show/xml-from-site?url=" + encodeURI(url),
        type: 'GET',
        error: function(e) {
            alert("Url non valido :-(");
            console.log(e);
        },
        success: function(data) {

            $('#loading').hide();
            $('#show').show();
            $('#loading-lotti').show();
            $('#xml-form').text(data);
            // window.location.search += 'id=' + encodeURI(url);

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
    });
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
        $('#messagges').append(makeMessage(errori[i].type,errori[i].text,errori[i].line));
    }
}


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
