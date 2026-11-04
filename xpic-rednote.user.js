// ==UserScript==
// @name         xpic: Red Note
// @namespace    xpic
// @version      1.0
// @description  Adds an "xpic" button on Red Note posts that sends the post's images to xpic.
// @match        https://www.rednote.com/*
// @match        https://www.xiaohongshu.com/*
// @grant        none
// ==/UserScript==

(function () {
  const XPIC = "https://albert1911.github.io/xpic/";

  const v = (x) => (x && x._value !== undefined ? x._value : x);

  function grab() {
    const id = (location.pathname.match(/[0-9a-f]{24}/) || [])[0] || "";
    let u = [];
    try {
      const n = v(window.__INITIAL_STATE__.note), m = v(n.noteDetailMap);
      const d = v(m[id] || m[v(n.currentNoteId)] || Object.values(m)[0]);
      u = v(d.note).imageList.map((i) => i.urlDefault || i.url || (i.infoList && i.infoList[0] && i.infoList[0].url));
    } catch (e) {}
    if (!u.length) u = [...document.querySelectorAll('meta[name="og:image"],meta[property="og:image"]')].map((m) => m.content);
    u = [...new Set(u.filter(Boolean).map((x) => x.replace(/^\/\//, "https://").replace(/^http:/, "https:")))];
    if (!u.length) return alert("xpic: no images found on this page");
    const p = new URLSearchParams();
    p.set("xhs", id || "note");
    u.forEach((x) => p.append("img", x));
    window.open(XPIC + "?" + p, "_blank");
  }

  const b = document.createElement("button");
  b.textContent = "xpic ⬇";
  b.style.cssText = "position:fixed;right:12px;bottom:90px;z-index:2147483647;padding:10px 14px;border:0;border-radius:20px;background:#111;color:#fff;font:600 14px sans-serif;box-shadow:0 2px 8px #0006";
  b.onclick = grab;
  document.documentElement.append(b);
})();
