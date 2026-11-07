// Cloudflare Worker: lets xpic (and only xpic) download images from hosts that don't send CORS headers.
// Usage: GET https://<your-worker>.workers.dev/?url=<encoded image url>

const ORIGINS = ["https://albert1911.github.io"]; // pages allowed to use this proxy
const HOSTS = /^([\w-]+\.)*(redd\.it|xhscdn\.com|rednotecdn\.com|sinaimg\.cn|bilibili\.com)$/; // images (and bilibili's public post data) it may fetch
const BILI_OK = (h, p) => // the only bilibili.com requests allowed: the post-data API, or the public opus page
  (h === "api.bilibili.com" && p === "/x/polymer/web-dynamic/v1/detail") || (h === "www.bilibili.com" && /^\/opus\/\d+\/?$/.test(p));

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

    const bili = /bilibili\.com$/.test(target.hostname);
    if (bili && !BILI_OK(target.hostname, target.pathname)) {
      return new Response("path not allowed", { status: 403, headers: cors });
    }
    const headers = { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36" };
    if (bili) {
      headers.Referer = "https://www.bilibili.com/";
      headers.Accept = target.hostname === "api.bilibili.com" ? "application/json, text/plain, */*" : "text/html,application/xhtml+xml";
      headers["Accept-Language"] = "en-US,en;q=0.9";
    }
    if (/sinaimg\.cn$/.test(target.hostname)) headers.Referer = "https://weibo.com/"; // Weibo images 403 without it
    const r = await fetch(target, { headers });
    return new Response(r.body, {
      status: r.status,
      headers: { ...cors, "Content-Type": r.headers.get("Content-Type") || "application/octet-stream", "Cache-Control": "public, max-age=86400" },
    });
  },
};
