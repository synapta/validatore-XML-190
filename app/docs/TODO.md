# Appunti

## MIGLIORIE
- sarebbe carino invece che costruire l'html in modo poco leggibile per i messaggi, tu costruissi lo stesso div e poi ci inietti
la classe che è la roba che cambia nella struttura del div [AM]
- errori nell'ordine migliore
- trova un nome migliore per l'applicazione
- gestire meglio il messaggio che riguarda le righe mancanti
- quando sono sopra il testo dell'xml evidenziato perché c'è un errore vorrei poter andare a leggere qual era questo errore (link al messaggio, o in qualche modo il messaggio segue il testo)
- ordina errori per: categoria d'errore, numero, campo
- group by errori per categoria d'errori invece che per numero
- mostrare se l'errore viene da specifiche tecniche delle direttive anac, data quality generale o semplice buon senso
- definire una specie di semaforino del tipo
    - qualità bassa: hai errori anche fondamentali/errori rispetto alle direttive anac
    - media: hai errori ma non fondamentali
    - alta: solo avvisi
- sarebbe bella una api da chiamare



## TODO
- scrivere i testi per gli approfondimenti
- scrivere tutti i test per le funzioni
- nelle info scrivere delle FAQ, tipo cosa è un tag, cosa un cig, cosa la iso ecc.
- aggiungere il controllo di mime type per i file prodotti con excel -> non facile, passano il mime type test
    - www.comunefosdinovo.it/download_2015_comune.xml?h=634ed9133d133968ddf82630d55c486868c2c7bb
    - http://www.bonificanurra.it/pubblicazioni/tabella7.xml
    - http://www.aeronautica.difesa.it/atticontr/Documents/LG_190_2014_80115410153.xml
    - probabilmente da programma simil excel https://www.cbsm.it/public/allegati/testi/150331171237_AVCP_ANTICORRUZIONE_De_Ferrari.xml
    - http://www.comune.urbino.pu.it/fileadmin/docs/gazzettamministrativa/004/a4/02/Dotazione%20organica%20al%2031-12-2015.xml
- se la lista di lotti con errori è molto lunga magari servirebbe una preview e poi puoi allargare
    - es http://www.vcotrasporti.it/userdata/Gara%20Assicurazioni/2020-2022/GARA%20BUONI%20PASTO/ANNO%202019%20(file%20XLM).xml
    - https://www.isiaroma.it/file-amministrazione/Dati-contratti-pubblici-ISIA-ROMA-2017-Legge-n.190-del-6-novembre-2012.xml
- gli aggiudicatari sono obbligatori? non credo!
- potrebbe servire gestire i tag in lowercase
- aggiungere la gestione dell'identificativo fiscale estero
- cosa balorda per cui ha reagito male con qualcosa e l'editor ha messo spazi in più ad ogni riga
    - https://www.istitutomatteifiorenzuola.edu.it/legge190/AVCP_2019.xml
- scrivere tutti i riferimenti e da dove provengono le linee guida negli approfondimenti
- request non sembra seguire bene il link che si ottiene
    - http://iccanale.gov.it/PubXML2.php?anno=2017&id=46
- errore 500
    - http://www.comune.cameratacornello.bg.it/PortaleNet/portale/streaming/Lex190_2017_1.xml?nonce=NCXXK3SFAPX6E4D6
- errore 403
    - https://cdn.website-editor.net/67c5f5debbeb4ae99523f8dfeee541a2/files/uploaded/L190_2019.xml
- non viene riconosciuto il tipo di file
    - https://cercalatuascuola.istruzione.it/cercalatuascuola/istituti/BNIC804009/finanza/AVCP?annoScolastico=201920&annoBilancio=2019

## NOTE
- errore in console non dipende da me, credo --> https://github.com/Semantic-Org/Semantic-UI/issues/2146


## FATTI
- richiesta troppo grossa (la post dovrebbe gestirlo)
- analisi dell'XSD
- aggiungere più informazioni negli errori con un "approfondisci"
- allargare la buca del link!
- raggruppamento di errori simili
- aggiungere il numero di lotto nei messaggio
- sul link al mousover lo stile deve essere cursor [AM]
- id degli errori (così che sia più corta la sintassi per arrivarci)
- se una roba è mancante ma non c'è la riga, dovrei per lo meno dire in che lotto dovrebbe essere!
- se analizzo una roba, ma non clicco procedi e poi ne analizzo un'altra si accodano uno dopo l'altra
- svuotare la pagina prima di ricaricarla (se passi dalla home fa un append)
- il testo nel box di testo non deve essere modificabile!
- se il lotto non ha alcun errore -> messaggio di successo!
- gestiti i commenti nell'XML
- il file di dati vuoti da errore (vedere test "vuoto")
- se sulla stessa riga c'è sia un errore che un warning deve prevalere l'evidenziazione da errore non da warning!
- per il riconoscimento del mime type di un xml c'è bisogno della stringa "<?xml version="1.0" encoding="UTF-8" standalone="yes"?>"
- gestire i redirect con la POST in request
    - http://montecchiomaggiore.trasparenza-valutazione-merito.it/anac/1249929510/2015/Dataset_idx_127554.xml
- se non si vuole gestire gli indici, per lo meno rilevarli e dare un messaggio di warning per cui non viene fatta l'analisi, o al massimo vedere se l'xsd va bene
- se ho un errore più bloccante, quelli dopo non li valuto! es. se il dato manca è inutile che mi sforzi di controllare se è corretto!
- impostati gli unit-test per vedere che dia il giusto output ogni funzione di validazione
- aggiungi l'ultimo step nella progressione, ovvero la ricerca degli errori [AM]
- nei messaggi di errore/warning sotto la barra di ricerca non scrivere "attenzione", scrivi subito l'errore [AM]
- togli che siano due pagine di seguito e che devi cliccare su "procedi", metti che il risultato della ricerca sia subito sotto [AM]
- metti che nella progressione quando si rompe è attivo lo step e hai la X e quelli non ancora fatti sono disattivati [AM]
- footer con data e nome
- pagina/messaggio/alert con "informazioni sull'applicazione"
- puoi aggiungere un parametro nell'url quando passi alla pagina di analisi dove ti indica l'url dell'xml cercato [AM]
- alle volte all'interno del tag hai del text, alle volte del CDATA
- errori nell'indentazione -> creano problemi nella gestione del tagging delle righe
    - http://www.bologna.aci.it/avcp/00312900376/2015/indice.xml
    - gestire i file monoriga (view-source:https://www.comune.poggibonsi.si.it/files/00097460521/2013/Z83082FC0B.xml)
- errori nel parsing dell'XML (valido per l'XSD) (era un mio errore scemo per il tagging delle linee con il parametro "linea")
    - http://bra.trasparenza-valutazione-merito.it/anac/c_b111/2013/Dataset_idx_97343.xml
    - esempio erroretag
    - http://www.comune.fiesole.fi.it/01252310485/2015/Z8914A766F.xml

## Lista test

### singolo campo singolo lotto
- [X] non nullo su tutto tranne [warn] data fine, importo liquidato, aggiudicatario, partecipante
- [X] cig valida algoritmo
- [X] [warn] ragonesocialeprop >=3 caratteri
- [X] [warn] oggetto con almeno 3 parole distinte (parola = cosa separata da spazi)
- [ ] [warn] più di 1000 partecipanti
- [X] codfiscprop regex
- [ ] [warn] caratteri utf-8
- [ ] scelta contraente da elenco
- [X] importo formato NNNNNNNNN.DD (non inizia per 0)
- [X] [warn] importo = 0
- [X] [warn] se >= 10B
- [X] date nel formato giusto ISO 8601 2020-02-31
- [X] [warn] date imprecise (anno a sole 2 cifre)
- [X] date > 2000 < 2100 (date in questo secolo)
- [ ] partecipanti non duplicati come cf
- [ ] raggruppamento 2+ membri
- [ ] 2+ aggiudicatari (no raggruppamento)
- [ ] ruoli dei raggruppamenti da lista
- [ ] [warn] 2+ mandataria, capogruppo

### multi campo singolo lotto
- [ ] [warn] almeno un lotto
- [X] data fine >= data inizio
- [ ] pa stessa tra partecipanti
- [X] [warn] importo liquidato >= 2* importo
- [ ] vincitore uguale a pa banditrice
- [ ] (later) soldi coerenti col tipo di procedura
- [ ] (later) nome azienda non coerente con la piva
- [ ] pagato ma nessun partecipante
- [ ] vincitori non coerenti col tipo di procedura / oggetto (difficile)
- [ ] l'aggiudicatario deve essere tra i partecipanti

### singolo campo multi lotto
- [ ] non mescolati CF e nomi azienda multilotto
- [ ] CIG non ripetute cross lotti tranne 0000000000
- [ ] [warn] più del 80% degli importi sono divisibili per 100 mod 0

### multi campo multi lotto
- [ ] [warn] due lotti uguali forse copy-paste
- [ ] [warn] importo che è una data o una partita iva del file










--
