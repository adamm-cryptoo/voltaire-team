/* =====================================================================
   main.js  —  builds the pages using the information in data.js
   You usually do NOT need to edit this file.
   ===================================================================== */

/* ---------- Small helper functions ---------- */

// Turn "2026-11-05" into "Thu, 5 Nov 2026"
// Turns "2026-11-4" or "2026-11-04" into "2026-11-04". Anything else (like "TBD") gives null.
function normDate(dateString) {
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(String(dateString).trim());
  return m ? `${m[1]}-${m[2].padStart(2, "0")}-${m[3].padStart(2, "0")}` : null;
}

// Turn "2026-11-05" into "Thu, 5 Nov 2026"
function formatDate(dateString) {
  const iso = normDate(dateString);
  if (!iso) return dateString;               // e.g. "TBD": show it as written
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric"
  });
}

// Sorting key: real dates sort by date, "TBD" goes last
function dateKey(m) {
  return normDate(m.date) || "9999-99-99";
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
            <nav id="main-nav">${links}<button class="theme-btn" id="theme-btn" aria-label="Toggle dark mode">🌙</button></nav>
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
function statusOf(m, name) {
  const s = String((m.availability || {})[name] || "").trim().toLowerCase();
  return ["yes", "no", "maybe"].includes(s) ? s : "none";
}
function availabilityHtml(m) {
  if (!m.availability) return "";
  const label = { yes: "Available", no: "Not available", maybe: "Maybe", none: "No reply" };
  const yes = PLAYERS.filter(p => statusOf(m, p.name) === "yes").length;
  const chips = PLAYERS.map(p => {
    const s = statusOf(m, p.name);
    return `<span class="chip ${s}" title="${label[s]}">${esc(p.name)}</span>`;
  }).join("");
  return `<details class="more"><summary>Availability (${yes}/${PLAYERS.length} confirmed)</summary><div class="chips">${chips}</div></details>`;
}
function opponentHtml(m) {
  if (!m.opponentPlayers || !m.opponentPlayers.length) return "";
  return `<details class="more"><summary>${esc(m.opponent)} players</summary><p>${m.opponentPlayers.map(n => esc(n)).join(" · ")}</p></details>`;
}

/* ---------- Kick-off time (used by countdown and calendar) ---------- */
function kickoff(m) {
  const iso = normDate(m.date);
  if (!iso) return null;                                   // "TBD" gives null
  const t = /^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i.exec(String(m.time).trim());
  if (!t) return null;
  let h = +t[1];
  const min = +(t[2] || 0), ap = (t[3] || "").toLowerCase();
  if (ap === "pm" && h < 12) h += 12;
  if (ap === "am" && h === 12) h = 0;
  const [y, mo, d] = iso.split("-").map(Number);
  return new Date(y, mo - 1, d, h, min);
}

/* ---------- Buttons on each match card ---------- */
function actionsHtml(m) {
  const i = MATCHES.indexOf(m);
  const cal = !isFinished(m) && kickoff(m)
    ? `<button class="btn-mini" data-ics="${i}">📅 Add to calendar</button>` : "";
  return `<div class="actions">${cal}<button class="btn-mini" data-share="${i}">📤 Share</button></div>`;
}

function downloadICS(m) {
  const k = kickoff(m);
  if (!k) return;
  const f = d => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const safe = s => String(s).replace(/[,;]/g, "\\$&");
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Team//EN", "BEGIN:VEVENT",
    "UID:" + f(k) + "@team", "DTSTAMP:" + f(new Date()),
    "DTSTART:" + f(k), "DTEND:" + f(new Date(k.getTime() + 90 * 60000)),
    "SUMMARY:" + safe(TEAM.shortName + " vs " + m.opponent),
    "LOCATION:" + safe(m.location), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  a.download = "match.ics";
  a.click();
}

function shareMatch(m) {
  const text = isFinished(m)
    ? `${TEAM.shortName} ${m.ourScore} - ${m.theirScore} ${m.opponent}`
    : `${TEAM.shortName} vs ${m.opponent} - ${formatDate(m.date)} ${m.time}, ${m.location}`;
  const url = location.href.split("#")[0];
  if (navigator.share) navigator.share({ title: TEAM.name, text, url }).catch(() => {});
  else window.open("https://wa.me/?text=" + encodeURIComponent(text + "\n" + url), "_blank", "noopener");
}

/* ---------- Countdown (Home page) ---------- */
function startCountdown() {
  const box = document.getElementById("countdown");
  if (!box) return;
  const next = upcomingMatches().find(m => { const k = kickoff(m); return k && k > new Date(); });
  if (!next) { box.style.display = "none"; return; }
  const target = kickoff(next);
  function tick() {
    let s = Math.max(0, Math.floor((target - new Date()) / 1000));
    const days = Math.floor(s / 86400); s %= 86400;
    const hrs = Math.floor(s / 3600);   s %= 3600;
    const mins = Math.floor(s / 60);    s %= 60;
    box.innerHTML = `<div class="cd-label">Next match vs ${esc(next.opponent)} in</div>
      <div class="cd-boxes">` +
      [[days, "days"], [hrs, "hours"], [mins, "min"], [s, "sec"]]
        .map(x => `<div><b>${x[0]}</b><span>${x[1]}</span></div>`).join("") + `</div>`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- Challenge form (Matches page) ---------- */
function setupChallengeForm() {
  const f = document.getElementById("challenge-form");
  if (!f) return;
  f.addEventListener("submit", e => {
    e.preventDefault();
    const d = new FormData(f);
    const lines = [
      `Hi! We'd like to play a match against ${TEAM.name}.`,
      `Team: ${d.get("team")}`,
      `Grade / school: ${d.get("school")}`,
      d.get("date")  ? `Preferred date: ${d.get("date")}` : "",
      d.get("place") ? `Field: ${d.get("place")}` : "",
      d.get("msg")   ? `Message: ${d.get("msg")}` : ""
    ].filter(Boolean);
    window.open("https://wa.me/" + TEAM.whatsapp + "?text=" + encodeURIComponent(lines.join("\n")),
                "_blank", "noopener");
  });
}

/* ---------- Result filters (Matches page) ---------- */
function setupResultFilters() {
  const bar = document.getElementById("result-filters");
  const list = document.getElementById("past-list");
  if (!bar || !list) return;
  const opts = [["all", "All"], ["win", "Wins"], ["draw", "Draws"], ["loss", "Losses"]];
  bar.innerHTML = opts.map(o =>
    `<button class="chip-btn${o[0] === "all" ? " on" : ""}" data-f="${o[0]}">${o[1]}</button>`).join("");
  const outcome = m => m.ourScore > m.theirScore ? "win" : m.ourScore < m.theirScore ? "loss" : "draw";
  bar.addEventListener("click", e => {
    const b = e.target.closest("[data-f]");
    if (!b) return;
    bar.querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b));
    const rows = pastMatches().filter(m => b.dataset.f === "all" || outcome(m) === b.dataset.f);
    list.innerHTML = rows.length ? rows.map(matchCard).join("") : `<p class="empty">No matches here.</p>`;
  });
}

/* ---------- Player search and pop-up (Team page) ---------- */
function setupPlayerSearch() {
  const s = document.getElementById("player-search");
  if (!s) return;
  s.addEventListener("input", () => {
    const q = s.value.trim().toLowerCase();
    document.querySelectorAll(".player").forEach(c => {
      c.style.display = c.textContent.toLowerCase().includes(q) ? "" : "none";
    });
  });
}

function showPlayer(name) {
  const p = PLAYERS.find(x => x.name === name);
  if (!p) return;
  const s = playerStats()[p.name];
  const ov = document.createElement("div");
  ov.className = "modal";
  ov.innerHTML = `<div class="modal-box" role="dialog" aria-modal="true">
      <button class="modal-x" aria-label="Close">×</button>
      <div class="shirt big">${esc(p.number)}</div>
      <h3>${esc(p.name)}${p.captain ? " (C)" : ""}</h3>
      <p>${esc(p.position)}</p>
      <div class="modal-stats">
        <div><b>${s.goals}</b><span>Goals</span></div>
        <div><b>${s.assists}</b><span>Assists</span></div>
        <div><b>${s.cleanSheets}</b><span>Clean sheets</span></div>
      </div></div>`;
  ov.addEventListener("click", e => { if (e.target === ov || e.target.closest(".modal-x")) ov.remove(); });
  document.body.appendChild(ov);
}

/* ---------- Dark mode ---------- */
function applyTheme(dark) {
  document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  const b = document.getElementById("theme-btn");
  if (b) b.textContent = dark ? "☀️" : "🌙";
}
function setupTheme() {
  let saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}
  applyTheme(saved ? saved === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.getElementById("theme-btn").addEventListener("click", () => {
    const dark = document.documentElement.getAttribute("data-theme") !== "dark";
    applyTheme(dark);
    try { localStorage.setItem("theme", dark ? "dark" : "light"); } catch (e) {}
  });
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
        ${actionsHtml(m)}
    </article>`;
}

function upcomingMatches() {
  return MATCHES.filter(m => !isFinished(m)).sort((a, b) => dateKey(a).localeCompare(dateKey(b)));
}
function pastMatches() {
  return MATCHES.filter(isFinished).sort((a, b) => dateKey(b).localeCompare(dateKey(a)));
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
   startCountdown();
}

/* ---------- MATCHES PAGE ---------- */
function renderMatches() {
 

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
           <div class="card player" data-player="${esc(p.name)}">
        <div class="shirt">${esc(p.number)}</div>
        <div>
          <strong>${esc(p.name)}</strong>
          ${p.captain ? `<span class="captain" title="Captain">C</span>` : ""}
          <div class="player-pos">${esc(p.position)}</div>
        </div>
      </div>`).join("");
    return `<h3 class="group-title">${plural[pos]}</h3><div class="grid">${cards}</div>`;
  }).join("");
renderLeaders();
   setUpPlayerSearch();
  
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
  setupTheme();
  buildFooter();
  const page = document.body.dataset.page;
  if (page === "home") renderHome();
  if (page === "matches") renderMatches();
  if (page === "team") renderTeam();
  if (page === "field") renderField();
});

document.addEventListener("click", e => {
  const ics = e.target.closest("[data-ics]");
  if (ics) return downloadICS(MATCHES[+ics.dataset.ics]);
  const sh = e.target.closest("[data-share]");
  if (sh) return shareMatch(MATCHES[+sh.dataset.share]);
  const pl = e.target.closest("[data-player]");
  if (pl) return showPlayer(pl.dataset.player);
});
document.addEventListener("keydown", e => {
  if (e.key === "Escape") document.querySelectorAll(".modal").forEach(m => m.remove());
});
