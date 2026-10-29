
/* =====================================================================
   data.js  —  THE ONLY FILE YOU NEED TO EDIT FOR MOST UPDATES
   ---------------------------------------------------------------------
   Everything the website shows (team info, matches, players, field)
   lives here. Change the text between the quotes "..." and save.
   Keep the commas and brackets exactly as they are.
   ===================================================================== */

/* ---------- 1. TEAM INFO ---------- */
const TEAM = {
  name: "Lycée Voltaire",      // Full team name (shown in the header)
  shortName: "SVS",                 // Short name (shown in the logo)
  motto: "Play together. Win together.",
  about: "",
  coach: "",                // Put "" if you have no coach
  // WhatsApp number for the "Challenge us" button.
  // Use country code, NO plus sign, NO spaces. Example Egypt: 201001234567
  whatsapp: "",
  email: "",
  instagram: ""                        // Full link, or "" to hide it
};

/* ---------- 2. MATCHES ----------
   Add one block { ... }, per match. Order does not matter —
   the website sorts them by date automatically.

   • Upcoming match: leave ourScore and theirScore as null
   • Finished match: put the numbers, e.g. ourScore: 3, theirScore: 1
   • date format is YYYY-MM-DD, time is 24-hour HH:MM            */
const MATCHES = [
  {
    date: "2026-11-03", time: "9:00 pm",
    opponent: "Albert Camus",
    location: "Ng university",
    ourScore: null, theirScore: null,
    notes: "Arrive Early.",
     availability: { "Player One": "yes", "Player Two": "no", "Player Three": "maybe" },
  opponentPlayers: ["Ali S.", "Karim A.", "Youssef M."],
  },
  {
    date: "2026-11-12", time: "16:00",
    opponent: "Grade 12 Eagles",
    location: "Their school field",
    ourScore: null, theirScore: null,
    notes: ""
  },
  {
    date: "2026-11-15", time: "15:30",
    opponent: "Grade 11 B",
    location: "Our school field",
    ourScore: null, theirScore: null,
    notes: "Great teamwork!"
  },
  {
    date: "2026-11-16", time: "15:30",
    opponent: "Grade 9 Sharks",
    location: "Our school field",
    ourScore: null, theirScore: null,
    notes: ""
  }
];

/* ---------- 3. PLAYERS ----------
   position must be one of: "Goalkeeper", "Defender", "Midfielder", "Forward"
   captain: true  → shows a "C" badge (only one player should have it) */
const PLAYERS = [
  { name: "Y. Tayel",   number: 99,  position: "Goalkeeper", captain: false },
  { name: "Omar", number: 99, position: "Goalkeeper", captain: false },
  { name: "A. Abdrabo",   number: 99,  position: "Defender",   captain: false },
  { name: "Y. Dabbous", number: 99,  position: "Defender",   captain: false },
  { name: "nnn",  number: 99,  position: "Defender",   captain: false },
  { name: "Player Five",  number: 99,  position: "Midfielder", captain: false  },
  { name: "Player Six",   number: 99, position: "Midfielder", captain: false },
  { name: "Player Seven", number: 99,  position: "Forward",    captain: false },
  { name: "Player Eight", number: 99,  position: "Forward",    captain: false }
];

/* ---------- 4. FIELD ---------- */
const FIELDS = {
  name: "ng field",
  address: "nnn",
  description: "nnn",
  surface: "nnn",
  size: "nnn",
  facilities: ["nnn", "nnn"],
  rules: [
    "nnn"
  ],
  // To show a map: open Google Maps → find your field → Share → "Embed a map"
  // → copy ONLY the link inside src="..." and paste it here. Leave "" to hide the map.
  mapEmbedUrl: "",
  // Normal Google Maps link for the "Get directions" button. "" to hide.
  mapLink: ""
};
