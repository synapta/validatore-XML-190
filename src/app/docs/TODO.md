# Appunti
## ERRORI
- richiesta troppo grossa
"POST /api/analyze/xml HTTP/1.1" 413 1069
PayloadTooLargeError: request entity too large
"
- errori nell'indentazione -> creano problemi nella gestione del tagging delle righe
(http://www.bologna.aci.it/avcp/00312900376/2015/indice.xml)
    - gestire i file monoriga (view-source:https://www.comune.poggibonsi.si.it/files/00097460521/2013/Z83082FC0B.xml)
- alle volte all'interno del tag hai del text, alle volte del CDATA, controllare se esistono altri tipi!
- se ho un errore più bloccante, quelli dopo non li valuto! es. se il dato manca è inutile che mi sforzi di controllare se è corretto!


## MIGLIORIE
- sarebbe carino invece che costruire l'html in modo poco leggibile per i messaggi, tu costruissi lo stesso div e poi ci inietti
la classe che è la roba che cambia nella struttura del div [AM]
- puoi aggiungere un parametro nell'url quando passi alla pagina di analisi dove ti indica l'url dell'xml cercato [AM]
- errori nell'ordine migliore
- trova un nome migliore per l'applicazione
- gestire meglio il messaggio che riguarda le righe mancanti
- footer con data e nome
- pagina/messaggio/alert con "informazioni sull'applicazione"
- quando sono sopra il testo dell'xml evidenziato perché c'è un errore vorrei poter andare a leggere qual era questo errore (link al messaggio, o in qualche modo il messaggio segue il testo)


## TODO
- scrivere i testi per gli approfondimenti
- aggiungere il controllo di mime type per i file prodotti con excel -> non facile, passano il mime type test
    - www.comunefosdinovo.it/download_2015_comune.xml?h=634ed9133d133968ddf82630d55c486868c2c7bb
    - http://www.bonificanurra.it/pubblicazioni/tabella7.xml
- se il lotto non ha alcun errore -> messaggio di successo!
- un po' di testing con link veri!
- aggiungi lista dei file di test da servire in modo comodo lato front end
- se la lista di lotti con errori è molto lunga magari servirebbe una preview e poi puoi allargare



## NOTE
- errore in console non dipende da me, credo --> https://github.com/Semantic-Org/Semantic-UI/issues/2146

## FATTI
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


## Lista test

### checklist nuovo test
- aggiunta funzione in test-functions.js
- aggiunta lista dei campi in test-list.js
- aggiunto il dizionario degli errori in error-dictionary.json
- aggiunto il nome della funzione in analyze.js

### singolo campo singolo lotto
- [X] non nullo su tutto tranne [warn] data fine, importo liquidato
- [X] cig valida algoritmo
- [X] [warn] almeno 1 partecipante
- [X] [warn] nessun aggiudicatario
- [X] [warn] ragonesocialeprop >=3 caratteri
- [X] [warn] oggetto con almeno 5 parole distinte (parola = cosa separata da spazi)
- [ ] [warn] più di 1000 partecipanti
- [ ] codfiscprop regex
- [ ] [warn] caratteri utf-8
- [ ] scelta contraente da elenco
- [ ] importo formato NNNNNNNNN.DD (non inizia per 0)
- [X] [warn] importo = 0
- [X] [warn] se >= 10B
- [ ] date nel formato giusto ISO 8601
- [ ] date > 2000 < 2100 (date in questo secolo)
- [ ] partecipanti non duplicati come cf
- [ ] raggruppamento 2+ membri
- [ ] 2+ aggiudicatari (no raggruppamento)
- [ ] ruoli dei raggruppamenti da lista
- [ ] [warn] 2+ mandataria, capogruppo

### multi campo singolo lotto
- [ ] [warn] almeno un lotto
- [ ] data fine >= data inizio
- [ ] pa stessa tra partecipanti
- [ ] [warn] importo liquidato <= 20% * importo + importo
- [ ] vincitore uguale a pa banditrice
- [ ] soldi coerenti col tipo di procedura
- [ ] nome azienda non coerente con la piva
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
