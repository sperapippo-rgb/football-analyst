FOOTBALL ANALYST 3.1 — PROTOTIPO 0.2 (SOLO FONTI GRATUITE)

Questa è una Progressive Web App (PWA) per analisi del primo tempo.

VINCOLO ECONOMICO
- Costo previsto per API e dati: 0 euro.
- Nessun piano a pagamento o prova con rinnovo automatico.
- Nessuna carta di credito richiesta per le fonti selezionate.

FONTI GRATUITE PREVISTE
1) Open-Matchday (GitHub): CSV pubblici aggiornati quotidianamente; risultati, punteggi HT, minuti dei gol e alcune statistiche per circa 75 competizioni. Copertura variabile.
2) API-Football Free: 100 richieste/giorno secondo la pagina ufficiale; registrazione gratuita e API key facoltativa. Non necessaria alla prima versione.
3) StatsBomb Open Data: eventi e formazioni storiche per competizioni selezionate, non live.
4) OpenLigaDB: API comunitaria per le competizioni supportate.
5) FootyStats: consultazione manuale delle statistiche liberamente visibili; non si presume accesso gratuito all'API.

LIMITAZIONI IMPORTANTI
- Nessuna fonte gratuita copre tutti i campionati e tutti gli indicatori richiesti dal Protocollo 3.1.
- xG, tiri 0-15, formazioni, assenze e split 1T possono mancare: in tal caso N.D.
- Le frequenze storiche non sono probabilità previste. Il verdetto resta NO BET se manca un modello supportato e dati sufficienti.
- L'app attuale è un prototipo: non è ancora collegata automaticamente ai feed.

INSTALLAZIONE
Per installarla come PWA serve pubblicarla su un hosting HTTPS (ad esempio GitHub Pages, gratuito) e poi usare Chrome Android > menu > Aggiungi a schermata Home / Installa app.

FILE
- index.html: interfaccia
- manifest.webmanifest: manifest PWA
- sw.js: service worker

Uso personale. Esportare regolarmente l'archivio JSON.
