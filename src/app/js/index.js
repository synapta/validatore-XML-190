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

// http://www.comune.terni.it/amministrazione_trasparente/opendata/contratto/1313.xml

$('#load-site').click(function () {
    let url = $("#search-field").val();
    $.ajax({
       url: "/api/modifica/show/xml-from-site?url=" + encodeURI(url),
       type: 'GET',
       success: function(data) {

           $('#main').hide();
           $('#modifica').show();
           $('#xml-form').text(data);
           window.myCodeMirror = CodeMirror.fromTextArea(document.getElementById("xml-form"), {
              lineNumbers: true,
              lineWrapping: true,
               mode: 'xml',
               // viewportMargin: Infinity --carica tutto il file, puoi fare il cerca, ma se è grosso danni
           });

           data = data.replace(/<\/([^>]+)></g, '</$1>\n<');
           window.myCodeMirror.setValue(data);
           //programmatically select all code, this is equivalent to ctrl+a on windows
           window.myCodeMirror.setSelection({
               'line':window.myCodeMirror.firstLine(),
               'ch':0,
               'sticky':null
             },{
               'line':window.myCodeMirror.lastLine() + 1,
               'ch':0,
               'sticky':null
             },
             {scroll: false});
             //auto indent the selection
             window.myCodeMirror.indentSelection("smart");
             //I tried to fire a mousdown event on the code to unselect everything but it does not work.
             // $('.CodeMirror-code', $codemirror).trigger('mousedown');

             window.myCodeMirror.setCursor({
                 'line':window.myCodeMirror.firstLine(),
             'ch':0,
             'sticky':null
            })


           // window.myCodeMirror.execCommand(indentAuto);


       }
    });
});
