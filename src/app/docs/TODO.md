ERRORI
- richiesta troppo grossa
"POST /api/analyze/xml HTTP/1.1" 413 1069
PayloadTooLargeError: request entity too large
"
- errori nell'indentazione -> creano problemi nella gestione del tagging delle righe
(http://www.bologna.aci.it/avcp/00312900376/2015/indice.xml)
    - gestire i file monoriga (view-source:https://www.comune.poggibonsi.si.it/files/00097460521/2013/Z83082FC0B.xml)
- alle volte all'interno del tag hai del text, alle volte del CDATA, controllare se esistono altri tipi!
- se ho un errore più bloccante, quelli dopo non li valuto! es. se il dato manca è inutile che mi sforzi di controllare se è corretto!


MIGLIORIE
- sarebbe carino invece che costruire l'html in modo poco leggibile per i messaggi, tu costruissi lo stesso div e poi ci inietti
la classe che è la roba che cambia nella struttura del div [AM]
- puoi aggiungere un parametro nell'url quando passi alla pagina di analisi dove ti indica l'url dell'xml cercato [AM]
- errori nell'ordine migliore
- trova un nome migliore per l'applicazione
- gestire meglio il messaggio che riguarda le righe mancanti
- footer con data e nome
- pagina/messaggio/alert con "informazioni sull'applicazione"
- quando sono sopra il testo dell'xml evidenziato perché c'è un errore vorrei poter andare a leggere qual era questo errore (link al messaggio, o in qualche modo il messaggio segue il testo)


TODO
- scrivere i testi per gli approfondimenti
- aggiungere il controllo di mime type per i file prodotti con excel -> non facile, passano il mime type test
    - www.comunefosdinovo.it/download_2015_comune.xml?h=634ed9133d133968ddf82630d55c486868c2c7bb
    - http://www.bonificanurra.it/pubblicazioni/tabella7.xml
- se il lotto non ha alcun errore -> messaggio di successo!
- un po' di testing con link veri!



NOTE
- errore in console non dipende da me, credo --> https://github.com/Semantic-Org/Semantic-UI/issues/2146

FATTI
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



- [X] non nullo su tutto tranne [warn] data fine, importo liquidato
- [X] cig valida algoritmo
- [X] [warn] almeno 1 partecipante
- [X] [warn] nessun aggiudicatario
- [X] [warn] ragonesocialeprop >=3 caratteri
- [ ] [warn] più di 1000 partecipanti
- [ ] codfiscprop regex
- [ ] [warn] oggetto con almeno 5 parole distinte (parola = cosa separata da spazi)
- [ ] [warn] caratteri utf-8
- [ ] [warn] due lotti uguali forse copy-paste
- [ ] scelta contraente da elenco
- [ ] partecipanti non duplicati come cf
- [ ] raggruppamento 2+ membri
- [ ] ruoli dei raggruppamenti da lista
- [ ] l'aggiudicatario deve essere tra i partecipanti
- [ ] 2+ aggiudicatari (no raggruppamento)
- [ ] importo formato NNNNNNNNN.DD (non inizia per 0)
- [ ] [warn] se >= 10B
- [ ] date nel formato giusto ISO 8601
- [ ] data fine >= data inizio
- [ ] pa stessa non tra partecipanti
- [ ] date > 2000 < 2100 (date in questo secolo)
- [ ] [warn] importo = 0
- [ ] [warn] almeno un lotto
- [ ] [warn] importo liquidato <= 20% * importo + importo
- [ ] non mescolati CF e nomi azienda multilotto
- [ ] CIG non ripetute cross lotti tranne 0000000000
- [ ] [warn] più del 80% degli importi sono divisibili per 100 mod 0
- [ ] [warn] importo che è una data o una partita iva del file
- [ ] [warn] 2+ mandataria, capogruppo
- [ ] soldi coerenti col tipo di procedura
- [ ] nome azienda non coerente con la piva
- [ ] pagato ma nessun partecipante
- [ ] vincitore uguale a pa banditrice
- [ ] vincitori non coerenti col tipo di procedura / oggetto (difficile)


--
