// contratto singolo
// http://www.comune.terni.it/amministrazione_trasparente/opendata/contratto/1313.xml
// molti contratti
// https://www.fnmgroup.it/FNM-theme/Legge190/2018/Legge190-E-Vai_2018.xml
// oggetti lunghi
// http://hosting.soluzionipa.it/cardano_al_campo/benefici/appalti/esportazione_appalti_2019.xml
// contratto singolo senza cig
// http://livigno.trasparenza-valutazione-merito.it/avcp/c_e621/2013/Dataset_idx_148503.xml

var returnToHome = function () {
    $('#loading-lotti').hide();
    $('#loading').hide();
    $('#show').hide();
    $('#main').show();
    $('#xml-form').text('');
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
        success: function(data) {

            $('#loading').hide();
            $('#show').show();
            $('#loading-lotti').show();
            $('#xml-form').text(data);

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
                    console.log(res)
                    $('#loading-lotti').hide();
                    $('#numero-lotti').text(res.totLotti);
                    addMessages(res.errors)
                    // markAll(xmlView, res.mark);
                    // markLine(xmlView,res.errori,'error')
                    alert("Analizzato!");

                },
                error: function(e) {
                    alert("Errore nell'analisi :-(");
                    console.log(e);
                }
            });



            // per marcare del testo
            // markLine(xmlView,50,'error')
            // markLine(xmlView,20,'warning')

            $(".error_line").click( function(e) {
                let line = e.target.textContent;
                e.preventDefault();
                xmlView.scrollIntoView({line:line, char:0})
                return false;
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

markLine = function (xmlView,line, type) {
    xmlView.markText({line: line -1, ch: 0}, {line: line , ch: 0}, {className: "styled-"+type });
}

markAll = function(xmlView, description) {
    console.log(description)
    for (let i = 0; i < description.length; i++) {
        markLine(xmlView,description[i].line, description[i].type)
    }
}
addMessages = function (errori) {
    for (let i = 0; i < errori.length; i++) {
        $('#messages').text(makeMessage(errori[i].type,errori[i].text,errori[i].line));
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
    // data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    // data = data.replace(/<\/([^>]+)><\/([^>]+)>/g, '</$1>\n</$2>');
    xmlView.setValue(data);
    indentData(xmlView,data);
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
