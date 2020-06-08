# validatore-XML-190

Nell'ambito delle disposizioni per la prevenzione e la repressione della corruzione e dell'illegalità nella Pubblica Amministrazione, sono stati istituiti degli adempimenti di pubblicazione dati, di cui all'art.1, comma 32 Legge n.190/2012. In particolare una Pubblica Amministrazione è tenuta a pubblicare i metadati relativi ai suoi contratti in XML secondo lo schema descritto dall'ANAC in:

- http://www.anticorruzione.it/portal/rest/jcr/repository/collaboration/Digital%20Assets/anacdocs/Servizi/ServiziOnline/AdempimentoLegge190/Specifiche%20Tecniche%20Legge%20190%20v1.2_finale.pdf

Come strumento di validazione del suddetto XML, ANAC fornisce tre XML schema:

- http://dati.anticorruzione.it/schema/TypesL190.xsd
- http://dati.anticorruzione.it/schema/datasetAppaltiL190.xsd
- http://dati.anticorruzione.it/schema/datasetIndiceAppaltiL190.xsd

In seguito alla realizzazione del progetto [ContrattiPubblici.org](https://contrattipubblici.org) e di alcune [tesi sull'argomento](https://www.slideshare.net/synapta/analisi-della-qualit-dei-dati-di-contrattipubbliciorg) è emersa l'esigenza di un validatore che potesse superare il concetto di controllo dello schema, focalizzandosi sulla qualità del dato (seguendo alcune delle linee guida della ISO 25024).

## Per cominciare

Per installare le dipendenze eseguire

```
npm install
```
e assicurarsi di avere java installato

```
sudo apt-get update && apt-get upgrade
sudo apt-get install default-jdk

```

infine per lanciare il server

```
node server.js
```

Per validare un XML di test si può andare su http://localhost:8041/ e immettere nella buca il link http://localhost:8041/xml/test1

Per altri link di file XML da validare si può cercare nella lista ufficiale pubblicata qui: https://dati.anticorruzione.it/#/l190
