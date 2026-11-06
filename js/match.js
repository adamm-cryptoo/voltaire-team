/* =====================================================================
   match.js  —  the full page for ONE match  (match.html?m=<id>)
   Uses helper functions from main.js (esc, formatDate, isFinished, ...).
   ===================================================================== */

const POS_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Forward"];

// Finds a player by name. Unknown names still show, just without number/position.
function findPlayer(name) {
  return PLAYERS.find(p => p.name === name) || { name: name, number: "", position: "", captain: false };
}

// Wraps content in a titled section. Returns "" when there is nothing to show.
function mdSection(title, html) {
  return html ? `<section class="md-section"><h2>${title}</h2>${html}</section>` : "";
}

/* ---------- Lineup drawn on a pitch ---------- */
function pitchHtml(m) {
  const starters = (m.lineup || []).map(findPlayer);
  if (!starters.length) return "";
  const row = list => list.length ? `<div class="pitch-row">` + list.map(p => `
      <button class="pitch-player" data-player="${esc(p.name)}">
        <span class="pitch-num">${esc(p.number)}</span>
        <span class="pitch-name">${esc(p.name)}${p.captain ? ` <span class="captain">C</span>` : ""}</span>
      </button>`).join("") + `</div>` : "";
  // Forwards at the top of the pitch, goalkeeper at the bottom
  const rows = POS_ORDER.slice().reverse().map(pos => row(starters.filter(p => p.position === pos))).join("");
  const others = row(starters.filter(p => !POS_ORDER.includes(p.position)));
  const label = m.formation ? `<p class="lead" style="margin-bottom:10px">Formation: <strong>${esc(m.formation)}</strong></p>` : "";
  return label + `<div class="pitch">${rows}${others}</div>`;
}

function benchHtml(m) {
  if (!m.bench || !m.bench.length) return "";
  return `<div class="chips">` + m.bench.map(n => {
    const p = findPlayer(n);
    return `<button class="chip bench-chip" data-player="${esc(n)}">${p.number !== "" ? esc(p.number) + " · " : ""}${esc(n)}</button>`;
  }).join("") + `</div>`;
}

/* ---------- Goals and cards in time order ---------- */
function eventsHtml(m) {
  const ev = [];
  (m.goals || []).forEach(g => ev.push({
    min: g.minute, icon: "⚽",
    text: g.scorer + (g.assist ? " (assist: " + g.assist + ")" : "")
  }));
  (m.cards || []).forEach(c => ev.push({
    min: c.minute, icon: c.type === "red" ? "🟥" : "🟨", text: c.player
  }));
  if (!ev.length) return "";
  const key = e => (e.min === undefined || e.min === null || e.min === "") ? 999 : Number(e.min);
  ev.sort((a, b) => key(a) - key(b));
  return `<ul class="timeline">` + ev.map(e =>
    `<li><span class="tl-min">${key(e) === 999 ? "–" : esc(e.min) + "'"}</span> ${e.icon} ${esc(e.text)}</li>`).join("") + `</ul>`;
}

/* ---------- Small info boxes at the top ---------- */
function infoHtml(m) {
  const items = [
    ["Field", m.location], ["Address", m.fieldAddress], ["Formation", m.formation],
    ["Referee", m.referee], ["Kick-off", m.time]
  ].filter(x => x[1] && x[1] !== "TBD");
  if (!items.length) return "";
  return `<div class="info-list">` + items.map(x =>
    `<div class="info-item"><div class="k">${x[0]}</div><div class="v">${esc(x[1])}</div></div>`).join("") + `</div>`;
}

function mapHtml(m) {
  const map = m.mapEmbedUrl
    ? `<div class="map-box"><iframe src="${esc(m.mapEmbedUrl)}" loading="lazy" title="Map of ${esc(m.location)}"
         allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe></div>` : "";
  const dir = m.mapLink
    ? `<p style="margin-top:14px"><a class="btn btn-green" href="${esc(m.mapLink)}" target="_blank" rel="noopener">🧭 Get directions</a></p>` : "";
  return map + dir;
}

/* ---------- The page ---------- */
function renderMatchPage() {
  const box = document.getElementById("match-detail");
  const key = new URLSearchParams(location.search).get("m");
  const m = MATCHES.find(x => matchKey(x) === key);
  if (!m) {
    box.innerHTML = `<a class="back" href="matches.html">← All matches</a>
      <p class="empty">We could not find this match. <a href="matches.html">Go back to the matches list</a>.</p>`;
    return;
  }
  document.title = TEAM.shortName + " vs " + m.opponent + " | " + TEAM.name;
  const done = isFinished(m);

  const head = `
    <a class="back" href="matches.html">← All matches</a>
    <section class="md-head card">
      <div class="match-date">${formatDate(m.date)} · ${esc(m.time)}</div>
      <div class="match-teams">
        <span class="team-a">${esc(TEAM.shortName)}</span>
        ${done ? `<div class="score">${m.ourScore} – ${m.theirScore}</div>` : `<div class="vs">VS</div>`}
        <span class="team-b">${esc(m.opponent)}</span>
      </div>
      ${cleanSheetHtml(m)}
      ${actionsHtml(m, false)}
    </section>`;

  const motm = m.motm
    ? `<p class="match-notes">🏆 Man of the Match: <button class="chip bench-chip" data-player="${esc(m.motm)}">${esc(m.motm)}</button></p>` : "";
  const report = (m.report ? `<p class="lead">${esc(m.report)}</p>` : "") + motm;
  const notes = m.notes ? `<p class="lead">${esc(m.notes)}</p>` : "";
  const opp = (m.opponentPlayers && m.opponentPlayers.length)
    ? `<div class="chips">` + m.opponentPlayers.map(n => `<span class="chip">${esc(n)}</span>`).join("") + `</div>` : "";
  const avail = (!done && m.availability)
    ? availabilityHtml(m).replace("<details", "<details open") : "";

  document.getElementById("match-detail").innerHTML =
    head + infoHtml(m) +
    mdSection("Match report", report) +
    mdSection("Goals and cards", eventsHtml(m)) +
    mdSection(esc(TEAM.shortName) + " starting lineup", pitchHtml(m)) +
    mdSection("Substitutes", benchHtml(m)) +
    mdSection("Availability", avail) +
    mdSection(esc(m.opponent) + " players", opp) +
    mdSection("Notes", notes) +
    mdSection("Location", mapHtml(m));
}
