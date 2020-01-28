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
       url: "/api/modifica/show/xml-from-site?url=" + url,
       type: 'GET',
       success: function(data) {
           // console.log("aaaaaaaaaaaaaaaaaaaaaa",data)

           // console.log("1",$('#xml-form').html())
           // $("pippo").appendTo('#xml-form');
           // $('#xml-form').val("pippooooo");
           // $('#xml-form').append(data);
           window.location.href = '/modifica';
           // console.log("2",$('#xml-form').html())
           $.ajax({
               url: "/modifica",
               type: 'GET',
               success: function(body) {
                   console.log(body)
                   console.log(data)
                   $('#xml-form').text(data);

               }
           })

       }
    });
});
