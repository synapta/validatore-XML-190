Synapta XML to JSON Library
===========================
Questa libreria converte un file xml in una stringa json parsificabile. Supporta file corrotti con presenza di caratteri non corretti e file troncati.

Installazione
-------------
Nella cartella synapta_x2j, lanciare il comando **npm install**, oppure inserire il comando script postinstall **cd [RELATIVE_PATH]/synapta_x2j && npm install && cd [(../)+]** nel package.json del progetto che la utilizza.

Utilizzo
--------
Inserire
*var synapta_x2j = require('[RELATIVE_PATH]/synapta_x2j/build/Release/synapta_x2j.node');*
all'inizio dello script che la utilizza.

Per ottenere la stringa json, chiamare
*var jsonstring=synapta_x2j.convert([string FILEPATH],[boolean TOLOWER])*.
Il parametro TOLOWER non puo' essere null. Se falso, mantiene i tag come nell'originale, se true converte tutti i tag in lowercase.

