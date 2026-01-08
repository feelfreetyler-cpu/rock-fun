import "dotenv/config";
import sharp from "sharp";
import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY; // use service role locally ONLY
const supabase = createClient(url, key);

const BUCKET = "rock-photos";

// 5 pins: Empire Beach + Petoskey area
const seeds = [
  { rock_type: "Petoskey", note: "Found near shoreline — classic pattern.", lat: 44.8137, lng: -86.0603 }, // Empire
  { rock_type: "Agate", note: "Small orange banding.", lat: 44.7619, lng: -86.0212 }, // near Empire
  { rock_type: "Quartz", note: "Clear quartz chunk.", lat: 45.3739, lng: -84.9553 }, // Petoskey
  { rock_type: "Copper", note: "Copper-looking nugget!", lat: 45.3747, lng: -84.9521 }, // Petoskey
  { rock_type: "Other", note: "Weird textured stone.", lat: 45.4020, lng: -84.9138 }, // Petoskey area
];

const colors = {
  Petoskey: "#2563EB",
  Quartz: "#16A34A",
  Copper: "#D97706",
  Agate: "#F97316",
  Other: "#6B7280",
};

async function makePng(text, hex) {
  const svg = `
  <svg width="900" height="900" xmlns="http://www.w3.org/2000/svg">
    <rect width="900" height="900" fill="${hex}"/>
    <text x="50%" y="48%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="72" fill="white" font-weight="700">${text}</text>
    <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
      font-family="Arial" font-size="28" fill="white" opacity="0.9">Seed Photo</text>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

async function run() {
  console.log("Seeding…");

  // Use a single shared seed user so everyone sees pins.
  // Create a fake UUID for user_id (not tied to auth); because RLS blocks anon insert,
  // we insert using service role key, which bypasses RLS.
  const seedUserId = "00000000-0000-0000-0000-000000000001";

  for (let i = 0; i < seeds.length; i++) {
    const s = seeds[i];
    const buf = await makePng(s.rock_type, colors[s.rock_type]);
    const path = `seed/${s.rock_type}-${i}.png`;

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, buf, {
      contentType: "image/png",
      upsert: true,
    });
    if (upErr) throw upErr;

    const { error: insErr } = await supabase.from("finds").insert({
      user_id: seedUserId,
      rock_type: s.rock_type,
      note: s.note,
      photo_path: path,
      lat: s.lat,
      lng: s.lng,
    });
    if (insErr) throw insErr;

    console.log("Inserted", s.rock_type, path);
  }

  console.log("Done.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
