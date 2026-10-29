
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
    date: "2026-11-4", time: "9:00 pm",
    opponent: "Albert Camus",
    location: "Ng University Field",
    ourScore: null, theirScore: null,
    notes: "Arrive Early.",
     availability: { "Y. Tayel": "No", "Omar": "Yes", "A. Abdrabo": "Yes", "Y. Dabbous": "Yes" },
  opponentPlayers: ["Mansour", "Ali", "Mohamed"],
  },
  {
    date: "2026-10-25", time: "9:00 pm",
    opponent: "MLS",
    location: "Ng Uni",
    ourScore: 8, theirScore: 5,
    notes: "",
     goals: [
        { scorer: "Y. Dabbous", assist: "A. Abdrabo"}],
  },
  {
    date: "TBD", time: "TBD",
    opponent: "TBD",
    location: "TBD",
    ourScore: null, theirScore: null,
    notes: ""
  },
  {
    date: "TBD", time: "TBD",
    opponent: "TBD",
    location: "TBD",
    ourScore: null, theirScore: null,
    notes: ""
  }
];

/* ---------- 3. PLAYERS ----------
   position must be one of: "Goalkeeper", "Defender", "Midfielder", "Forward"
   captain: true  → shows a "C" badge (only one player should have it) */
const PLAYERS = [
  { name: "Y. Tayel",   number: 1,  position: "Goalkeeper", captain: false },
  { name: "Omar", number: 16, position: "Goalkeeper", captain: false },
  { name: "A. Abdrabo",   number: 4,  position: "Defender",   captain: false },
  { name: "Y. Dabbous", number: 3,  position: "Defender",   captain: false },
  { name: "Zein Ezz",  number: 67 ,  position: "Defender",   captain: false },
  { name: "Yakan",  number: 11,  position: "Forward", captain: false  },
  { name: "Arabi",   number: 6 , position: "Midfielder", captain: false },
  { name: "Asser", number: 7,  position: "Forward",    captain: false },
  { name: "Selim", number: 8,  position: "Midfielder",    captain: false },
   { name: "Malek", number: 9, position: "Forward", captain: false },
   { name: "A. Kashef", number: 10, position: "Midfielder", captain: false },
   { name: "H. Nahas", number: 69, position: "Defender", captain: false },
   { name: "Z. Soliman", number: 12, position: "Defender", captain: false},
   { name: "H. Kortam", number: 2, position: "Defender", captain: false}
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
