// Usage: node xpic.mjs <x-post-link> [outDir]
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const [link, outDir = "downloads"] = process.argv.slice(2);
const m = link?.match(/(?:x|twitter)\.com\/([^/?#]+)\/status\/(\d+)/i);
if (!m) {
  console.error("Usage: node xpic.mjs <x.com/user/status/id link> [outDir]");
  process.exit(1);
}
const [, user, id] = m;

async function fromFxTwitter() {
  const res = await fetch(`https://api.fxtwitter.com/${user}/status/${id}`);
  if (!res.ok) throw new Error(`fxtwitter ${res.status}`);
  const { tweet } = await res.json();
  const media = tweet.media?.all ?? [];
  return media.map((x) => (x.type === "photo" ? x.url : x.thumbnail_url)).filter(Boolean);
}

async function fromSyndication() {
  const token = ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, "");
  const res = await fetch(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&token=${token}`);
  if (!res.ok) throw new Error(`syndication ${res.status}`);
  const t = await res.json();
  return (t.mediaDetails ?? []).map((x) => x.media_url_https);
}

let urls;
try {
  urls = await fromFxTwitter();
} catch (e) {
  console.warn(`${e.message}, trying fallback...`);
  urls = await fromSyndication();
}
if (!urls.length) {
  console.error("No images found in that post.");
  process.exit(1);
}

await mkdir(outDir, { recursive: true });
for (const [i, u] of urls.entries()) {
  // pbs.twimg.com serves the original resolution with ?name=orig
  const full = u.includes("pbs.twimg.com") ? `${u.split("?")[0]}?name=orig` : u;
  const ext = path.extname(u.split("?")[0]) || ".jpg";
  const file = path.join(outDir, `${user}-${id}-${i + 1}${ext}`);
  const res = await fetch(full);
  if (!res.ok) throw new Error(`download failed ${res.status}: ${full}`);
  await writeFile(file, Buffer.from(await res.arrayBuffer()));
  console.log("saved", file);
}
