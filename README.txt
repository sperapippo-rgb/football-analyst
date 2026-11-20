FOOTBALL ANALYST — VERSIONE 0.1

CONTENUTO
index.html, app.js, manifest.webmanifest, sw.js, icon.svg, README.txt.

INSTALLAZIONE
1. Estrai lo ZIP.
2. Carica tutti i file nella root del repository GitHub.
3. In GitHub: Settings > Pages > Deploy from a branch > main > /(root).
4. Apri il sito pubblicato con Chrome Android.
5. Menu Chrome > Installa app oppure Aggiungi a schermata Home.

DATI
Fonte iniziale: repository pubblico https://github.com/openfootball/football.json
L'app tenta di leggere i JSON pubblici per stagione e campionato. Non usa API key o servizi a pagamento. La disponibilità dipende dai file pubblicati; se un file manca, l'app mostra un errore.
Controllare sempre licenza e condizioni aggiornate nel repository originale.

LIMITI
- Elenco iniziale di competizioni, non copertura mondiale completa.
- Nessun catalogo femminile verificato in questa versione.
- Dati all'intervallo solo se presenti nel dataset; altrimenti N.D.
- Statistiche storiche descrittive, non probabilità predette.
- Non sono ancora presenti split completi casa/trasferta, indicatori 0-15', modello predittivo o pronostici.
- Interfaccia PWA in cache; i dati richiedono connessione Internet.
- Verificare sempre i dati con una seconda fonte.

VERSIONE 0.1 — 20/11/2026
