$.ajax({
    url: "/api/bando/stat",
    type: 'GET',
    success: function(data) {
        let div = '';
        div += '<h3 class="ui dividing header">Ultimi 30 giorni</h3>';
        div += '<div class="ui statistics">';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[0].count).toLocaleString('it') + '</div><div class="label">Fatti</div></div>';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[1].count).toLocaleString('it') + '</div><div class="label">Da fare</div></div>';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[2].count).toLocaleString('it') + '</div><div class="label">Totale</div></div>';
        div += '</div><br>';
        let perc = Math.round(Number(data.rows[0].count)*100/Number(data.rows[2].count));
        if (perc > 100) perc = 100;
        div += '<div class="ui indicating progress" data-percent="' + perc + '"><div class="bar" style="width:' + perc + '%""><div class="progress">' + perc +'%</div></div></div>';
        div += '<h3 class="ui dividing header">Storico</h3>';
        div += '<div class="ui statistics">';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[3].count).toLocaleString('it') + '</div><div class="label">Fatti</div></div>';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[4].count).toLocaleString('it') + '</div><div class="label">Da fare</div></div>';
        div += '<div class="statistic"><div class="value">' + parseInt(data.rows[5].count).toLocaleString('it') + '</div><div class="label">Totale</div></div>';
        div += '</div><br>';
        let percTot = Math.round(Number(data.rows[3].count)*100/Number(data.rows[5].count));
        if (percTot > 100) percTot = 100;
        div += '<div class="ui indicating progress" data-percent="' + percTot + '"><div class="bar" style="width:' + percTot + '%""><div class="progress">' + percTot +'%</div></div></div>';
        $("#numeriche").html(div);
    }
});

$.ajax({
    url: "/api/bando/recent",
    type: 'GET',
    success: function(data) {
        let list = "";
        list +='<table class="ui celled table">';
        list +='<thead><tr><th>n</th><th>Data modifica</th><th>ID Synapta</th></tr></thead><tbody>';
        for (let i = 0; i < data.rows.length; i++) {
            let link = '/guri?id=' + data.rows[i].id_fonte;
            let stringDate = data.rows[i].data_modifica;
            let tzoffset = (new Date(stringDate)).getTimezoneOffset() * 60000; //offset in milliseconds
            let date = (new Date(new Date(stringDate) - tzoffset)).toISOString().replace(/T/,' ').replace(/\.\d{3}Z/,'');
            list += '<tr> <td data-label="n"> ' + data.rows[i].n + '</td>';
            list += '<td data-label="Data modifica"> ' + date + '</td>';
            list += '<td data-label="Id Synapta">  <a href=\"' + link + '\">' + data.rows[i].id_fonte + '</a></td></tr>';
        }
        list += '</tbody> </table>';
        $("#recenti").html("<ul>" + list + "</ul>");
    }
});
