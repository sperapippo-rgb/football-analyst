(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const leagueSelect = $("league"), seasonSelect = $("season");
  const searchInput = $("search"), teamInput = $("team");
  const statusEl = $("status"), listEl = $("list");
  const countEl = $("count"), statsEl = $("stats");

  // Codici verificati direttamente nei dataset OpenFootball.
  const competitions = [
    ["en.1", "Inghilterra — Premier League"],
    ["en.2", "Inghilterra — Championship"],
    ["es.1", "Spagna — La Liga"],
    ["it.1", "Italia — Serie A"],
    ["de.1", "Germania — Bundesliga"],
    ["fr.1", "Francia — Ligue 1"],
    ["nl.1", "Paesi Bassi — Eredivisie"],
    ["pt.1", "Portogallo — Primeira Liga"]
  ];
  let allMatches = [], loadedLeague = "", loadedSeason = "";

  function setStatus(message, error = false) {
    statusEl.textContent = message;
    statusEl.className = error ? "status warn" : "status";
  }
  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, ch => ({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    })[ch]);
  }
  function fillCompetitions() {
    leagueSelect.innerHTML = "";
    competitions.forEach(([id, label]) => {
      const option = document.createElement("option");
      option.value = id; option.textContent = label;
      leagueSelect.appendChild(option);
    });
  }
  function scoreText(score) {
    if (!score || score === "-") return "N.D.";
    if (Array.isArray(score)) return score.join("–");
    if (typeof score === "string") return score;
    if (typeof score === "object" && Array.isArray(score.ft)) return score.ft.join("–");
    return "N.D.";
  }
  function htScore(match) {
    const ht = match.score?.ht ?? match.ht ?? match.half_time ?? null;
    if (Array.isArray(ht) && ht.length >= 2) return ht.map(Number);
    if (ht && typeof ht === "object") {
      const h = ht.home ?? ht[0], a = ht.away ?? ht[1];
      if (h != null && a != null) return [Number(h), Number(a)];
    }
    return null;
  }
  function matchDate(match) {
    const raw = match.date || match.datetime || match.kickoff || "";
    if (!raw) return "Data N.D.";
    const date = new Date(raw);
    return Number.isNaN(date.getTime()) ? String(raw) :
      date.toLocaleDateString("it-IT", {dateStyle:"medium"});
  }
  function normalizeMatches(data) {
    const source = Array.isArray(data) ? data : (data.matches || data.fixtures || []);
    return source.map(m => ({
      date: matchDate(m),
      home: String(m.team1 || m.home || m.home_team || "Casa N.D."),
      away: String(m.team2 || m.away || m.away_team || "Trasferta N.D."),
      ft: scoreText(m.score || m.result || m.ft),
      ht: htScore(m)
    }));
  }
  async function loadMatches() {
    const league = leagueSelect.value, season = seasonSelect.value;
    const url = `https://raw.githubusercontent.com/openfootball/football.json/master/${season}/${league}.json`;
    setStatus("Ricerca dati pubblici in corso…");
    listEl.textContent = "Caricamento…";
    try {
      const response = await fetch(url, {cache:"no-store"});
      if (!response.ok) throw new Error(`Dataset non disponibile (HTTP ${response.status}).`);
      const data = await response.json(), matches = normalizeMatches(data);
      if (!matches.length) throw new Error("Il dataset non contiene partite.");
      allMatches = matches; loadedLeague = league; loadedSeason = season;
      setStatus(`Caricati ${matches.length} incontri. Fonte: OpenFootball.`);
      renderMatches(); renderStats();
    } catch (error) {
      allMatches = []; loadedLeague = ""; loadedSeason = "";
      listEl.innerHTML = `<div class="empty">${escapeHtml(error.message)}<br>Prova un'altra stagione o competizione.</div>`;
      countEl.textContent = "";
      statsEl.innerHTML = '<div class="empty">N.D. — nessun dataset caricato.</div>';
      setStatus("Dati non disponibili per questa selezione. Nessuna statistica è stata inventata.", true);
    }
  }
  function renderMatches() {
    const q = searchInput.value.trim().toLocaleLowerCase("it");
    const filtered = allMatches.filter(m => !q ||
      m.home.toLocaleLowerCase("it").includes(q) ||
      m.away.toLocaleLowerCase("it").includes(q));
    countEl.textContent = `(${filtered.length})`;
    if (!filtered.length) {
      listEl.innerHTML = '<div class="empty">Nessuna partita corrispondente alla ricerca.</div>';
      return;
    }
    listEl.innerHTML = filtered.map(m => {
      const ht = m.ht ? `${m.ht[0]}–${m.ht[1]}` : "N.D.";
      return `<article class="match"><div class="top"><span>${escapeHtml(m.date)}</span><span>1°T: ${escapeHtml(ht)}</span></div><div class="teams"><span>${escapeHtml(m.home)}</span><span class="score">${escapeHtml(m.ft)}</span><span>${escapeHtml(m.away)}</span></div></article>`;
    }).join("");
  }
  function renderStats() {
    const name = teamInput.value.trim().toLocaleLowerCase("it");
    if (!name || !allMatches.length) {
      statsEl.innerHTML = '<div class="empty">Inserisci il nome di una squadra presente nel dataset caricato.</div>';
      return;
    }
    const played = allMatches.filter(m =>
      m.home.toLocaleLowerCase("it").includes(name) ||
      m.away.toLocaleLowerCase("it").includes(name));
    const withHt = played.filter(m => m.ht);
    if (!played.length) {
      statsEl.innerHTML = '<div class="empty">Squadra non trovata nei dati caricati.</div>';
      return;
    }
    let scored=0, conceded=0, ahead=0, level=0, behind=0;
    withHt.forEach(m => {
      const isHome = m.home.toLocaleLowerCase("it").includes(name);
      const own = m.ht[isHome ? 0 : 1], opp = m.ht[isHome ? 1 : 0];
      if (own > 0) scored++; if (opp > 0) conceded++;
      if (own > opp) ahead++; else if (own === opp) level++; else behind++;
    });
    const pct = n => withHt.length ? `${(100*n/withHt.length).toFixed(1)}%` : "N.D.";
    statsEl.innerHTML = `<p class="status">Campionato: ${escapeHtml(loadedLeague)} · Stagione: ${escapeHtml(loadedSeason)} · Partite trovate: ${played.length}</p>
      <div class="grid">
      <div class="metric"><b>${withHt.length}/${played.length}</b><small>Partite con risultato 1°T</small></div>
      <div class="metric"><b>${pct(scored)}</b><small>Segna almeno un gol 1°T</small></div>
      <div class="metric"><b>${pct(conceded)}</b><small>Subisce almeno un gol 1°T</small></div>
      <div class="metric"><b>${pct(ahead)}</b><small>In vantaggio all'intervallo</small></div>
      <div class="metric"><b>${pct(level)}</b><small>Parità all'intervallo</small></div>
      <div class="metric"><b>${pct(behind)}</b><small>In svantaggio all'intervallo</small></div></div>
      <p class="status">Frequenze descrittive del campione caricato, non probabilità predette. Il campione non coincide necessariamente con le ultime 5/10 partite.</p>`;
  }
  document.querySelectorAll("[data-tab]").forEach(button => button.addEventListener("click", () => {
    document.querySelectorAll("[data-tab]").forEach(b => b.classList.toggle("active", b === button));
    ["matches","analysis","sources"].forEach(id => $(id).classList.toggle("hidden", id !== button.dataset.tab));
  }));
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