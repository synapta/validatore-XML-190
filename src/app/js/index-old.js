var textString;

go = function(ID_FONTE) {
    $.ajax({
       url: "/api/bando/next/webpage?id_fonte=" + ID_FONTE,
       type: 'GET',
       success: function(data) {
           let anno = ID_FONTE.split("-")[0];
           let mese = ID_FONTE.split("-")[1];
           let giorno = ID_FONTE.split(".")[0].split("-")[2];
           let codice = ID_FONTE.split(".")[2];
           let link = 'https://www.gazzettaufficiale.it/eli/id/' + anno + '/' + mese + '/' + giorno + '/' + codice + '/s5'
           textString = data.match(/\<div id="testa_atto_b"\>([\s\S]*)\<\/h3\>\s*\<\/div\>/g)[0];
           textString += data.match(/\<pre\>([\s\S]*)<\/pre>/g)[0];
           let textLink = "<hr>ID Synapta: <a href=\"" + link + "\">" + ID_FONTE + "</a>";
           $('#sito-bando').html(textString + textLink);
           $('#testa_atto_b').css("font-size", "0.7rem");
           $("#testa_atto_b h3").remove();
           textString = $('#sito-bando').outerHTML;
       }
    });

    var formObject = {
        cf: {
            type: 'string',
            title: 'CF stazione appaltante'
        },
        cig: {
            type: 'string',
            title: 'CIG'
        },
        cup: {
            type: 'string',
            title: 'CUP'
        },
        multi_cig: {
            type: 'boolean',
            title: 'CIG multipli?'
        },
        cpv: {
            type: 'string',
            title: 'CPV'
        },
        id_simog: {
            type: 'string',
            title: 'Codice SIMOG'
        },
        oggetto: {
            type: 'textarea',
            title: 'Oggetto',
            required: true
        },
        importo_complessivo: {
            type: 'number',
            title: 'Importo complessivo',
            step: 0.01
        },
        oneri_sicurezza: {
            type: 'number',
            title: 'Oneri della sicurezza',
            step: 0.01
        },
        rup: {
            type: 'string',
            title: 'RUP'
        },
        tipologia_inter: {
            type: 'string',
            title: 'Tipologia intervento',
            enum: [ "Vuoto",
                    "Lavoro",
                    "Servizio",
                    "Fornitura"
                  ]
        },
        settore: {
            type: 'string',
            title: 'Settore',
            enum: [ "Vuoto",
                    "Ordinario",
                    "Speciale"
                  ]
        },
        scelta_contraente: {
            type: 'string',
            title: 'Scelta contraente',
            enum: [ "Vuoto",
                    "01-PROCEDURA APERTA",
                    "02-PROCEDURA RISTRETTA",
                    "03-PROCEDURA NEGOZIATA PREVIA PUBBLICAZIONE DEL BANDO",
                    "04-PROCEDURA NEGOZIATA SENZA PREVIA PUBBLICAZIONE DEL BANDO",
                    "05-DIALOGO COMPETITIVO",
                    "06-PROCEDURA NEGOZIATA SENZA PREVIA INDIZIONE DI  GARA ART. 221 D.LGS. 163/2006",
                    "07-SISTEMA DINAMICO DI ACQUISIZIONE",
                    "08-AFFIDAMENTO IN ECONOMIA - COTTIMO FIDUCIARIO",
                    "14-PROCEDURA SELETTIVA EX ART 238 C.7, D.LGS. 163/2006",
                    "17-AFFIDAMENTO DIRETTO EX ART. 5 DELLA LEGGE N.381/91",
                    "21-PROCEDURA RISTRETTA DERIVANTE DA AVVISI CON CUI SI INDICE LA GARA",
                    "22-PROCEDURA NEGOZIATA DERIVANTE DA AVVISI CON CUI SI INDICE LA GARA",
                    "23-AFFIDAMENTO IN ECONOMIA - AFFIDAMENTO DIRETTO",
                    "24-AFFIDAMENTO DIRETTO A SOCIETA' IN HOUSE",
                    "25-AFFIDAMENTO DIRETTO A SOCIETA' RAGGRUPPATE/CONSORZIATE O CONTROLLATE NELLE CONCESSIONI DI LL.PP",
                    "26-AFFIDAMENTO DIRETTO IN ADESIONE AD ACCORDO QUADRO/CONVENZIONE",
                    "27-CONFRONTO COMPETITIVO IN ADESIONE AD ACCORDO QUADRO/CONVENZIONE",
                    "28-PROCEDURA AI SENSI DEI REGOLAMENTI DEGLI ORGANI COSTITUZIONALI",
                    "29-PROCEDURA RISTRETTA SEMPLIFICATA",
                    "30-PROCEDURA DERIVANTE DA LEGGE REGIONALE",
                    "31-AFFIDAMENTO DIRETTO PER VARIANTE SUPERIORE AL 20% DELL'IMPORTO CONTRATTUALE"
                  ]
        },
        infrastruttura_strategica: {
            type: 'boolean',
            title: 'Infrastruttura strategica'
        },
        criterio_aggiudicazione: {
            type: 'string',
            title: 'Criterio di aggiudicazione',
            enum: [ "Vuoto",
                    "Offerta economicamente più vantaggiosa",
                    "Prezzo più basso"
                  ]
        },
        data_term_rich_chiar: {
            type: 'date',
            title: 'Termine richiesta chiarimenti'
        },
        orario_term_rich_chiar: {
            type: 'time',
            title: '-'
        },
        data_iniz_pres_off: {
            type: 'date',
            title: 'Inizio presentazione offerte'
        },
        orario_iniz_pres_off: {
            type: 'time',
            title: '-'
        },
        data_term_off: {
            type: 'date',
            title: 'Termine presentazione offerte'
        },
        orario_term_off: {
            type: 'time',
            title: '-'
        },
        data_seduta: {
            type: 'date',
            title: 'Seduta'
        },
        orario_seduta: {
            type: 'time',
            title: '-'
        },
        n_lotti: {
            type: 'number',
            title: 'Numero di lotti',
            default: 1
        },
        skip: {
            type: 'boolean',
            title: 'Skip'
        },
        note: {
            type: 'textarea',
            title: 'Note'
        }
    }

    $.ajax({
        url: "/api/bando/next/data?id_fonte=" + ID_FONTE,
        type: 'GET',
        success: function(data) {
            for (key in data.rows[0]) {
                if (key in formObject) {
                    formObject[key].default = data.rows[0][key];
                    if (formObject[key].type === 'date' && data.rows[0][key] !== null ) {
                        var tzoffset = (new Date(data.rows[0][key])).getTimezoneOffset() * 60000; //offset in milliseconds
                        formObject[key].default = (new Date(new Date(data.rows[0][key]) - tzoffset)).toISOString().replace(/T.*/,'').slice(0,19);
                    }

                }
                console.log(data.rows[0][key]);
            }

            let array = [];
            Object.keys(formObject).forEach( key => {
                array.push({"key": key,
                    "onClick": function (evt) {
                        $('#sito-bando').html(textString);
                        var value = $(evt.target).val();
                        if (value !== "") {
                            let re = new RegExp(value, "gi");
                            let textStringMarked = textString.replace(re, "<mark>" + value + "</mark>");
                            $('#sito-bando').html(textStringMarked);
                        }
                    }
                });
            });
            array.push({
                "type": "submit",
                "title": "Finito, invio! (e passo al prossimo)"
            });

            $('form').jsonForm({
                schema: formObject,
                form: array,
                onSubmit: function (errors, values) {
                    if (errors) {
                        alert(errors)
                    }

                    console.log(values)
                    values.id_fonte = ID_FONTE;
                    values.data_pubblicazione = ID_FONTE.substring(0, 10);

                    $.ajax({
                        url: '/api/bando/save',
                        type: 'post',
                        data: JSON.stringify(values),
                        contentType: 'application/json',
                        success: function () {
                            alert("Salvato con successo!");
                            $.ajax({
                                url: "/api/bando/next",
                                type: 'GET',
                                success: function(data) {
                                    $('#form-bando').html("<form></form>");
                                    window.location.href = window.location.href.replace(window.location.search,'');
                                    go(data);
                                }
                            });
                        },
                        error: function(e) {
                            alert('Errore nel salvataggio :-(');
                            console.log(e);
                        }
                    });
                }
            });


            $('.jsonform-error-importo_complessivo').css("float","left")
            $('.jsonform-error-importo_complessivo').css("margin-right","1rem")
            $('.jsonform-error-tipologia_inter').css("float","left")
            $('.jsonform-error-tipologia_inter').css("margin-right","1rem")
            $('.jsonform-error-data_term_rich_chiar').css("float","left")
            $('.jsonform-error-data_term_rich_chiar').css("margin-right","1rem")
            $('.jsonform-error-data_iniz_pres_off').css("float","left")
            $('.jsonform-error-data_iniz_pres_off').css("margin-right","1rem")
            $('.jsonform-error-data_term_off').css("float","left")
            $('.jsonform-error-data_term_off').css("margin-right","1rem")
            $('.jsonform-error-data_seduta').css("float","left")
            $('.jsonform-error-data_seduta').css("margin-right","1rem")
            $('.jsonform-error-skip').css("float","right")
            $('.jsonform-error-skip').css("margin-right","1rem")
        }
    });
}


if (window.location.search.indexOf('?id=') > -1) {
    let url = new URL(window.location);
    go(url.searchParams.get("id"));
} else {
    $.ajax({
       url: "/api/bando/next",
       type: 'GET',
       success: function(data) {
           go(data);
       }
    });
}
