// $('#search-field').keypress(function (e) {
//  var key = e.which;
//  alert(e)
//  if(key == 13) {
//     alert('You pressed enter!');
//   }
// });

// $('#load-file').click(function (e) {
//  var key = e.which;
//  alert(e)
//  if(key == 13) {
//     alert('You pressed enter!');
//   }
// });
// onclick="window.location.href='/modifica'"

// contratto singolo
// http://www.comune.terni.it/amministrazione_trasparente/opendata/contratto/1313.xml
// molti contratti
// https://www.fnmgroup.it/FNM-theme/Legge190/2018/Legge190-E-Vai_2018.xml
// oggetti lunghi
// http://hosting.soluzionipa.it/cardano_al_campo/benefici/appalti/esportazione_appalti_2019.xml

//TODO loading page per aspettare la rispota dal sito, non solo per l'analisi!

$('#load-site').click(function () {
    let url = $("#search-field").val();
    $.ajax({
        url: "/api/show/xml-from-site?url=" + encodeURI(url),
        type: 'GET',
        success: function(data) {

        $('#main').hide();
        $('#show').show();
        $('#xml-form').text(data);

        window.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("xml-form"), {
            lineNumbers: true,
            lineWrapping: true,
            mode: 'xml'
            // viewportMargin: Infinity --carica tutto il file, puoi fare il cerca, ma se è grosso danni
        });
        let xmlView = window.myCodeMirror;
        data = formatData(xmlView, data);
        // per marcare del testo
        xmlView.markText({line: 50, ch: 0}, {line: 51, ch: 0}, {className: "styled-error" });

        $('#a50').click( function(e) {
            e.preventDefault();
            xmlView.scrollIntoView({line:51, char:0})
            return false;
        });
        $('#a20').click( function(e) {
            e.preventDefault();
            xmlView.scrollIntoView({line:21, char:0})
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




formatData = function (xmlView,data) {
    // bisogna insistere per scollare fra loro tutti i tag
    data = data.replace(/<([^>]+)><([^\/>]+)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+)><([^\/>]+)>/g, '<$1>\n<$2>');
    data = data.replace(/<([^>]+)><([^\/>]+)>/g, '<$1>\n<$2>');
    data = data.replace(/<\/([^>]+)></g, '</$1>\n<');


    xmlView.setValue(data);
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
     return data;
}
