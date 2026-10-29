/* =====================================================================
   main.js  —  builds the pages using the information in data.js
   You usually do NOT need to edit this file.
   ===================================================================== */

/* ---------- Small helper functions ---------- */

// Turn "2026-11-05" into "Thu, 5 Nov 2026"
function formatDate(dateString) {
  // If it isn't a real date like 2026-11-05 (for example "TBD"), show it as written
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  const d = new Date(dateString + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });
}
// Safely put text into HTML (stops weird characters from breaking the page)
function esc(text) {
  const div = document.createElement("div");
  div.textContent = text == null ? "" : String(text);
  return div.innerHTML;
}

// A match is "finished" when both scores are numbers
function isFinished(m) {
  return typeof m.ourScore === "number" && typeof m.theirScore === "number";
}

// Link that opens WhatsApp with a ready-made message
function whatsappLink() {
  const msg = encodeURIComponent(
    "aayzeen match " + TEAM.name + "."
  );
  return "https://wa.me/" + TEAM.whatsapp + "?text=" + msg;
}

/* ---------- Header and footer (shared by every page) ---------- */
function buildHeader() {
  const pages = [
    { file: "index.html",   label: "Home" },
    { file: "matches.html", label: "Matches" },
    { file: "team.html",    label: "Team" },
    { file: "field.html",   label: "Field" }
  ];
  const current = location.pathname.split("/").pop() || "index.html";

  const links = pages.map(p =>
    `<a href="${p.file}" class="${p.file === current ? "active" : ""}">${p.label}</a>`
  ).join("");

  document.getElementById("site-header").innerHTML = `
    <div class="container header-inner">
      <a class="logo" href="index.html">
        <img class="logo-img" src="js/svsphoto.jpg" alt="${esc(TEAM.shortName)} logo">
      
        <span>${esc(TEAM.shortName)}</span>
      </a>
      <button class="menu-btn" id="menu-btn" aria-label="Open menu" aria-expanded="false">☰</button>
      <nav id="main-nav">${links}</nav>
    </div>`;

  const btn = document.getElementById("menu-btn");
  const nav = document.getElementById("main-nav");
  btn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
}

function buildFooter() {
  const insta = TEAM.instagram
    ? ` · <a href="${esc(TEAM.instagram)}" target="_blank" rel="noopener">Instagram</a>` : "";
  document.getElementById("site-footer").innerHTML = `
    <div class="container">
      <p><strong>${esc(TEAM.name)}</strong> — ${esc(TEAM.motto)}</p>
      <p><a href="${whatsappLink()}" target="_blank" rel="noopener">WhatsApp</a>
         · <a href="mailto:${esc(TEAM.email)}">${esc(TEAM.email)}</a>${insta}</p>
    </div>`;
}

function playerStats() {
  const stats = {};
  PLAYERS.forEach(p => stats[p.name] = { goals: 0, assists: 0, cleanSheets: 0 });
  pastMatches().forEach(m => {
    (m.goals || []).forEach(g => {
      if (stats[g.scorer]) stats[g.scorer].goals++;
      if (g.assist && stats[g.assist]) stats[g.assist].assists++;
    });
    if (m.theirScore === 0 && m.goalkeeper && stats[m.goalkeeper]) stats[m.goalkeeper].cleanSheets++;
  });
  return stats;
}
function teamCleanSheets() {
  return pastMatches().filter(m => m.theirScore === 0).length;
}

function goalsHtml(m) {
  if (!m.goals || !m.goals.length) return "";
  return `<div class="goals">` + m.goals.map(g =>
    `⚽ ${esc(g.scorer)}${g.assist ? ` <small>(assist: ${esc(g.assist)})</small>` : ""}`
  ).join("<br>") + `</div>`;
}
function cleanSheetHtml(m) {
  return isFinished(m) && m.theirScore === 0
    ? `<p class="match-notes">🧤 Clean sheet${m.goalkeeper ? " — " + esc(m.goalkeeper) : ""}</p>` : "";
}
function availabilityHtml(m) {
  if (!m.availability) return "";
  const label = { yes: "Available", no: "Not available", maybe: "Maybe", none: "No reply" };
  const yes = Object.values(m.availability).filter(v => v === "yes").length;
  const chips = PLAYERS.map(p => {
    const s = m.availability[p.name] || "none";
    return `<span class="chip ${s}" title="${label[s]}">${esc(p.name)}</span>`;
  }).join("");
  return `<details class="more"><summary>Availability (${yes}/${PLAYERS.length} confirmed)</summary><div class="chips">${chips}</div></details>`;
}
function opponentHtml(m) {
  if (!m.opponentPlayers || !m.opponentPlayers.length) return "";
  return `<details class="more"><summary>${esc(m.opponent)} players</summary><p>${m.opponentPlayers.map(n => esc(n)).join(" · ")}</p></details>`;
}

/* ---------- Match card (used on Home and Matches pages) ---------- */
function matchCard(m) {
  const done = isFinished(m);
  let resultBadge = "";
  let scoreHtml = `<div class="vs">VS</div>`;

  if (done) {
    const cls = m.ourScore > m.theirScore ? "win" : m.ourScore < m.theirScore ? "loss" : "draw";
    const word = cls === "win" ? "WIN" : cls === "loss" ? "LOSS" : "DRAW";
    resultBadge = `<span class="badge ${cls}">${word}</span>`;
    scoreHtml = `<div class="score">${m.ourScore} – ${m.theirScore}</div>`;
  }

  return `
    <article class="card match-card">
      <div class="match-top">
        <span class="match-date">${formatDate(m.date)} · ${esc(m.time)}</span>
        ${resultBadge}
      </div>
      <div class="match-teams">
        <span class="team-a">${esc(TEAM.shortName)}</span>
        ${scoreHtml}
        <span class="team-b">${esc(m.opponent)}</span>
      </div>
      <p class="match-place">📍 ${esc(m.location)}</p>
      ${m.notes ? `<p class="match-notes">${esc(m.notes)}</p>` : ""}${cleanSheetHtml(m)}${goalsHtml(m)}${availabilityHtml(m)}${opponentHtml(m)}
    </article>`;
}

function upcomingMatches() {
  return MATCHES.filter(m => !isFinished(m)).sort((a, b) => a.date.localeCompare(b.date));
}
function pastMatches() {
  return MATCHES.filter(isFinished).sort((a, b) => b.date.localeCompare(a.date));
}

/* ---------- HOME PAGE ---------- */
function renderHome() {
  document.getElementById("hero-title").textContent = TEAM.name;
  document.getElementById("hero-motto").textContent = TEAM.motto;
  document.getElementById("hero-challenge").href = whatsappLink();
 

  // Next match
  const next = upcomingMatches()[0];
  document.getElementById("next-match").innerHTML = next
    ? matchCard(next)
    : `<p class="empty">No match scheduled yet. Challenge us to set one up!</p>`;

  // Latest results (max 3)
  const recent = pastMatches().slice(0, 3);
  document.getElementById("recent-results").innerHTML = recent.length
    ? recent.map(matchCard).join("")
    : `<p class="empty">No results yet.</p>`;

  // Season stats
  const past = pastMatches();
  const wins = past.filter(m => m.ourScore > m.theirScore).length;
  const draws = past.filter(m => m.ourScore === m.theirScore).length;
  const losses = past.filter(m => m.ourScore < m.theirScore).length;
  const stats = [
    ["Played", past.length], ["Wins", wins], ["Draws", draws], ["Losses", losses], ["Clean sheets", teamCleanSheets()]
  ];
  document.getElementById("stats").innerHTML = stats.map(s =>
    `<div class="stat"><span class="stat-num">${s[1]}</span><span class="stat-label">${s[0]}</span></div>`
  ).join("");
}

/* ---------- MATCHES PAGE ---------- */
function renderMatches() {
  document.getElementById("challenge-btn").href = whatsappLink();

  const up = upcomingMatches();
  document.getElementById("upcoming-list").innerHTML = up.length
    ? up.map(matchCard).join("")
    : `<p class="empty">No upcoming matches yet.</p>`;

  const past = pastMatches();
  document.getElementById("past-list").innerHTML = past.length
    ? past.map(matchCard).join("")
    : `<p class="empty">No results yet.</p>`;
}

/* ---------- TEAM PAGE ---------- */
function renderTeam() {

  const groups = ["Goalkeeper", "Defender", "Midfielder", "Forward"];
  const plural = { Goalkeeper: "Goalkeepers", Defender: "Defenders", Midfielder: "Midfielders", Forward: "Forwards" };

  document.getElementById("players").innerHTML = groups.map(pos => {
    const list = PLAYERS.filter(p => p.position === pos).sort((a, b) => a.number - b.number);
    if (!list.length) return "";
    const cards = list.map(p => `
      <div class="card player">
        <div class="shirt">${esc(p.number)}</div>
        <div>
          <strong>${esc(p.name)}</strong>
          ${p.captain ? `<span class="captain" title="Captain">C</span>` : ""}
          <div class="player-pos">${esc(p.position)}</div>
        </div>
      </div>`).join("");
    return `<h3 class="group-title">${plural[pos]}</h3><div class="grid">${cards}</div>`;
  }).join("");
renderLeaders()
  
}

 function renderLeaders() {
  const st = playerStats();
  const fill = (id, key) => {
    const rows = PLAYERS.map(p => ({ name: p.name, n: st[p.name][key] }))
      .filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 5);
    document.getElementById(id).innerHTML = rows.length
      ? rows.map((x, i) => `<tr><td>${i + 1}. ${esc(x.name)}</td><td>${x.n}</td></tr>`).join("")
      : `<tr><td>No data yet</td><td></td></tr>`;
  };
  fill("top-scorers", "goals");
  fill("top-assists", "assists");
  fill("top-keepers", "cleanSheets");
}

/* ---------- FIELD PAGE ---------- */

function fieldCard(m) {
  const map = m.mapEmbedUrl
    ? `<div class="map-box"><iframe src="${esc(m.mapEmbedUrl)}" loading="lazy"
         title="Map of ${esc(m.location)}" allowfullscreen
         referrerpolicy="no-referrer-when-downgrade"></iframe></div>`
    : "";
  const directions = m.mapLink
    ? `<p style="margin-top:14px"><a class="btn btn-green" href="${esc(m.mapLink)}" target="_blank" rel="noopener">🧭 Get directions</a></p>`
    : "";
  return `
    <article class="card field-card">
      <span class="match-date">${formatDate(m.date)} · ${esc(m.time)}</span>
      <h3 class="field-title">📍 ${esc(m.location)}</h3>
      <p class="field-vs">${esc(TEAM.shortName)} vs ${esc(m.opponent)}</p>
      ${m.fieldAddress ? `<p class="match-place">${esc(m.fieldAddress)}</p>` : ""}
      ${map}${directions}
    </article>`;
}

function renderField() {
  const list = upcomingMatches();
  document.getElementById("field-list").innerHTML = list.length
    ? list.map(fieldCard).join("")
    : `<p class="empty">No upcoming matches yet, so there are no fields to show.</p>`;
}


/* ---------- Start everything when the page loads ---------- */
document.addEventListener("DOMContentLoaded", () => {
  buildHeader();
  buildFooter();
  const page = document.body.dataset.page;      // set in each HTML file
  if (page === "home") renderHome();
  if (page === "matches") renderMatches();
  if (page === "team") renderTeam();
  if (page === "field") renderField();
});
