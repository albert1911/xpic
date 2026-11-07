// Cloudflare Worker: lets xpic (and only xpic) download images from hosts that don't send CORS headers.
// Usage: GET https://<your-worker>.workers.dev/?url=<encoded image url>

const ORIGINS = ["https://albert1911.github.io"]; // pages allowed to use this proxy
const HOSTS = /^([\w-]+\.)*(redd\.it|xhscdn\.com|rednotecdn\.com)$/; // images it may fetch

export default {
  async fetch(req) {
    const origin = req.headers.get("Origin") || "";
    if (!ORIGINS.includes(origin)) return new Response("forbidden", { status: 403 });
    const cors = { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
    if (req.method === "OPTIONS") return new Response(null, { headers: { ...cors, "Access-Control-Allow-Methods": "GET" } });

    let target;
    try { target = new URL(new URL(req.url).searchParams.get("url")); }
    catch { return new Response("bad url", { status: 400, headers: cors }); }
    if (target.protocol !== "https:" || !HOSTS.test(target.hostname)) {
      return new Response("host not allowed", { status: 403, headers: cors });
    }

    const r = await fetch(target, { headers: { "User-Agent": "Mozilla/5.0" } });
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, "Content-Type": r.headers.get("Content-Type") || "application/octet-stream", "Cache-Control": "public, max-age=86400" },
    });
  },
};
