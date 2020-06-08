var dict = {
    "indice_w_errori" : { title: "File di tipo indice", type: "warning",
        text: `Questo file è un dataset di tipo "Indice". Questa applicazione non analizza ulteriormente questo tipo di file, ad ogni modo sono elencati gli errori che riguardano la validazione dello schema XSD di riferimento per gli indici. Per sfruttare le piene potenzialità dell'applicazione immettere un url ad un file XML della Legge 190 del tipo "Appalto", ovvero di un file che riguarda singoli lotti. Consultare la fonte <a href="http://www.anticorruzione.it/portal/public/classic/Servizi/ServiziOnline/DichiarazioneAdempLegge190">ANAC</a> per ulteriori informazioni.`},
    "has_comments" : { title: "Sono presenti dei commenti", type: "warning",
        text: HTMLEncode(`È richiesto dalle linee guida di non usare commenti nel file (indicati da "<!-- testo del commento-->"), per la visualizzazione dell'analisi sono stati eliminati.`) },
    "indice_no_errori" : { title: "File di tipo indice", type: "warning",
        text: `Questo file è un dataset di tipo "Indice". Sebbene non ci siano errori di validazione dello schema XSD di riferimento per gli indici, questa applicazione non analizza ulteriormente questo tipo di file. Per sfruttare le piene potenzialità dell'applicazione immettere un url ad un file XML della Legge 190 del tipo "Appalto", ovvero di un file che riguarda singoli lotti. Consultare la fonte <a href="http://www.anticorruzione.it/portal/public/classic/Servizi/ServiziOnline/DichiarazioneAdempLegge190">ANAC</a> per ulteriori informazioni.`},
    "successo" : { title: "Successo!", type: "positive",
        text: "L'analisi è andata a buon fine e non sono stati trovati errori. <br>Si può procedere con una nuova analisi."},
    "vuoto" : { title: "File vuoto!", type: "error",
        text: HTMLEncode(`Il file supera i controlli di validazione dell'XSD ma non c'è neppure un lotto! Controllare il contenuto del tag "<data>" ed aggiungere la lista di lotti.`)}
}
