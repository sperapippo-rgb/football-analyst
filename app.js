(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const leagueSelect = $("league");
  const seasonSelect = $("season");
  const searchInput = $("search");
  const teamInput = $("team");
  const statusEl = $("status");
  const listEl = $("list");
  const countEl = $("count");
  const statsEl = $("stats");

  const competitions = [
    ["eng.1", "Inghilterra — Premier League"],
    ["eng.2", "Inghilterra — Championship"],
    ["esp.1", "Spagna — La Liga"],
    ["esp.2", "Spagna — Segunda División"],
    ["ita.1", "Italia — Serie A"],
    ["ita.2", "Italia — Serie B"],
    ["deu.1", "Germania — Bundesliga"],
    ["deu.2", "Germania — 2. Bundesliga"],
    ["fra.1", "Francia — Ligue 1"],
    ["fra.2", "Francia — Ligue 2"],
    ["ned.1", "Paesi Bassi — Eredivisie"],
    ["por.1", "Portogallo — Primeira Liga"],
    ["sco.1", "Scozia — Premiership"],
    ["usa.1", "USA — MLS"],
    ["bra.1", "Brasile — Série A"],
    ["arg.1", "Argentina — Primera División"],
    ["mex.1", "Messico — Liga MX"],
    ["jpn.1", "Giappone — J1 League"],
    ["aus.1", "Australia — A-League Men"]
  ];

  let allMatches = [];
  let loadedLeague = "";
  let loadedSeason = "";

  function setStatus(message, isError = false) {
    statusEl.textContent = message;
    statusEl.className = isError ? "status warn" : "status";
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[ch]);
  }

  function fillCompetitions() {
    leagueSelect.innerHTML = "";
    competitions.forEach(([id, label]) => {
      const option = document.createElement("option");
      option.value = id;
      option.textContent = label;
      leagueSelect.appendChild(option);
    });
  }

  function scoreText(score) {
    if (!score || score === "-") return "N.D.";
    if (typeof score === "string") return score;
    if (Array.isArray(score)) return score.join("–");
    if (typeof score === "object") {
      if (score.ft && Array.isArray(score.ft)) return score.ft.join("–");
      if (score.ft && typeof score.ft === "object") {
        const h = score.ft.home ?? score.ft[0];
        const a = score.ft.away ?? score.ft[1];
        if (h != null && a != null) return `${h}–${a}`;
      }
    }
    return "N.D.";
  }

  function htScore(match) {
    const score = match.score || {};
    const ht = score.ht ?? match.ht ?? match.half_time ?? null;
    if (Array.isArray(ht) && ht.length >= 2) return ht;
    if (ht && typeof ht === "object") {
      const h = ht.home ?? ht[0];
      const a = ht.away ?? ht[1];
      if (h != null && a != null) return [Number(h), Number(a)];
    }
    return null;
  }

  function matchDate(match) {
    const raw = match.date || match.datetime || match.kickoff || "";
    if (!raw) return "Data N.D.";
    const date = new Date(raw);
    return Number.isNaN(date.getTime())
      ? String(raw)
      : date.toLocaleString("it-IT", { dateStyle: "medium", timeStyle: "short" });
  }

  function teamNames(match) {
    const home = match.team1 || match.home || match.home_team || match.homeTeam || "Casa N.D.";
    const away = match.team2 || match.away || match.away_team || match.awayTeam || "Trasferta N.D.";
    return { home: String(home), away: String(away) };
  }

  function normalizeMatches(data) {
    const source = Array.isArray(data) ? data : (data.matches || data.fixtures || []);
    return source.map(m => ({
      raw: m,
      date: matchDate(m),
      ...teamNames(m),
      ft: scoreText(m.score || m.result || m.ft),
      ht: htScore(m)
    }));
  }

  async function loadMatches() {
    const league = leagueSelect.value;
    const season = seasonSelect.value;
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    setStatus("Ricerca dati pubblici in corso…");
    listEl.textContent = "Caricamento…";
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Dataset non disponibile (HTTP ${response.status}).`);
      const data = await response.json();
      const matches = normalizeMatches(data);
      if (!matches.length) throw new Error("Il file esiste ma non contiene partite riconoscibili.");
      allMatches = matches;
      loadedLeague = league;
      loadedSeason = season;
      setStatus(`Caricati ${matches.length} incontri. Fonte: OpenFootball. Dati disponibili secondo il dataset pubblicato.`);
      renderMatches();
      renderStats();
    } catch (error) {
      allMatches = [];
      loadedLeague = "";
      loadedSeason = "";
      listEl.innerHTML = `<div class="empty">${escapeHtml(error.message)}<br>Prova un'altra stagione o competizione. Non vengono creati dati sostitutivi.</div>`;
      countEl.textContent = "";
      statsEl.innerHTML = '<div class="empty">N.D. — nessun dataset caricato.</div>';
      setStatus("Dati non disponibili per la selezione scelta. Nessuna statistica è stata inventata.", true);
    }
  }

  function renderMatches() {
    const q = searchInput.value.trim().toLocaleLowerCase("it");
    const filtered = allMatches.filter(m =>
      !q || m.home.toLocaleLowerCase("it").includes(q) || m.away.toLocaleLowerCase("it").includes(q)
    );
    countEl.textContent = `(${filtered.length})`;
    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty">Nessuna partita corrispondente alla ricerca.</div>';
      return;
    }
    listEl.innerHTML = filtered.map(m => {
      const ht = m.ht ? `${m.ht[0]}–${m.ht[1]}` : "N.D.";
      return `<article class="match">
        <div class="top"><span>${escapeHtml(m.date)}</span><span>1°T: ${escapeHtml(ht)}</span></div>
        <div class="teams"><span>${escapeHtml(m.home)}</span><span class="score">${escapeHtml(m.ft)}</span><span>${escapeHtml(m.away)}</span></div>
      </article>`;
    }).join("");
  }

  function renderStats() {
    const name = teamInput.value.trim().toLocaleLowerCase("it");
    if (!name || !allMatches.length) {
      statsEl.innerHTML = '<div class="empty">Inserisci il nome di una squadra presente nel dataset caricato.</div>';
      return;
    }
    const played = allMatches.filter(m =>
      m.home.toLocaleLowerCase("it").includes(name) || m.away.toLocaleLowerCase("it").includes(name)
    );
    const withHt = played.filter(m => m.ht);
    if (!played.length) {
      statsEl.innerHTML = '<div class="empty">Squadra non trovata nei dati caricati.</div>';
      return;
    }
    let scored = 0, conceded = 0, ahead = 0, level = 0, behind = 0;
    withHt.forEach(m => {
      const isHome = m.home.toLocaleLowerCase("it").includes(name);
      const own = Number(m.ht[isHome ? 0 : 1]);
      const opp = Number(m.ht[isHome ? 1 : 0]);
      if (own > 0) scored++;
      if (opp > 0) conceded++;
      if (own > opp) ahead++;
      else if (own === opp) level++;
      else behind++;
    });
    const pct = n => withHt.length ? `${(100 * n / withHt.length).toFixed(1)}%` : "N.D.";
    statsEl.innerHTML = `
      <p class="status">Campionato: ${escapeHtml(loadedLeague)} · Stagione: ${escapeHtml(loadedSeason)} · Partite trovate: ${played.length}</p>
      <div class="grid">
        <div class="metric"><b>${withHt.length}/${played.length}</b><small>Partite con risultato 1°T</small></div>
        <div class="metric"><b>${pct(scored)}</b><small>Segna almeno un gol 1°T</small></div>
        <div class="metric"><b>${pct(conceded)}</b><small>Subisce almeno un gol 1°T</small></div>
        <div class="metric"><b>${pct(ahead)}</b><small>In vantaggio all'intervallo</small></div>
        <div class="metric"><b>${pct(level)}</b><small>Parità all'intervallo</small></div>
        <div class="metric"><b>${pct(behind)}</b><small>In svantaggio all'intervallo</small></div>
      </div>
      <p class="status">Queste sono frequenze descrittive del campione caricato, non probabilità predette. Se il dataset non fornisce i risultati all'intervallo, il dato resta N.D. Campione non necessariamente coincidente con le ultime 5/10 partite.</p>`;
  }

  document.querySelectorAll("[data-tab]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b === button));
      ["matches", "analysis", "sources"].forEach(id => $(id).classList.toggle("hidden", id !== button.dataset.tab));
    });
  });

  $("refresh").addEventListener("click", loadMatches);
  leagueSelect.addEventListener("change", loadMatches);
  seasonSelect.addEventListener("change", loadMatches);
  searchInput.addEventListener("input", renderMatches);
  teamInput.addEventListener("input", renderStats);

  fillCompetitions();
  loadMatches();

  if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }
})();