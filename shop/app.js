(function () {
  "use strict";

  const CATS = [
    { key: "car", name: "רכב", svg: "car" },
    { key: "kitchen", name: "מטבח", svg: "bag" },
    { key: "home", name: "בית", svg: "home" },
    { key: "gadgets", name: "גאדג'טים", svg: "phone" },
    { key: "kids", name: "ילדים", svg: "kids" },
    { key: "beauty", name: "טיפוח", svg: "beauty" },
    { key: "pets", name: "חיות מחמד", svg: "paw" },
    { key: "tools", name: "כלים", svg: "tools" },
  ];
  const ICONS = {
    bag: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 11h16l-1.2 9.2A2 2 0 0 1 16.8 22H7.2a2 2 0 0 1-2-1.8L4 11z" stroke="currentColor" stroke-width="1.8"/><path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    home: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 11.5 12 4l8 7.5V20a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 20v-8.5z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M10 21.5v-6h4v6" stroke="currentColor" stroke-width="1.8"/></svg>',
    car: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 13l2.2-5.2A2 2 0 0 1 7.1 7h9.8a2 2 0 0 1 1.9.8L21 13v6H3v-6z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><circle cx="7.5" cy="16.5" r="1.5" fill="currentColor"/><circle cx="16.5" cy="16.5" r="1.5" fill="currentColor"/><path d="M3 13h18" stroke="currentColor" stroke-width="1.8"/></svg>',
    phone: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="7" y="3" width="10" height="18" rx="2" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="18" r="1" fill="currentColor"/></svg>',
    kids: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="8" cy="9" r="2.2" stroke="currentColor" stroke-width="1.7"/><circle cx="16" cy="9" r="2.2" stroke="currentColor" stroke-width="1.7"/><path d="M4.5 18c.6-3 2.8-4.5 5.5-4.5.9 0 1.7.2 2.4.5M12 14c.7-.3 1.5-.5 2.4-.5 2.7 0 4.9 1.5 5.6 4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    beauty: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M8 10.5c0-2.5 1.5-4.5 4-4.5s4 2 4 4.5c0 3.2-4 6.5-4 6.5S8 13.7 8 10.5z" stroke="currentColor" stroke-width="1.8"/><path d="M9 3.5c.8 1.2.9 2.4.4 3.4M15 3.5c-.8 1.2-.9 2.4-.4 3.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    paw: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="6.5" cy="8" r="1.7" fill="currentColor"/><circle cx="17.5" cy="8" r="1.7" fill="currentColor"/><circle cx="4.8" cy="13" r="1.7" fill="currentColor"/><circle cx="19.2" cy="13" r="1.7" fill="currentColor"/><ellipse cx="12" cy="15.2" rx="4.2" ry="3.4" stroke="currentColor" stroke-width="1.7"/></svg>',
    tools: '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M14 4.5l2.2 2.2-8.5 8.5-2.2.3.3-2.2L14 4.5z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M4 20h7M16.5 10.5l2 2 2.2-2.2a1.6 1.6 0 0 0 0-2.3L19 6.3" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>',
    search: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="6.5" stroke="#A09080" stroke-width="2"/><path d="M16 16l5 5" stroke="#A09080" stroke-width="2" stroke-linecap="round"/></svg>',
    back: '<svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M6 3l6 5-6 5" stroke="#2A2118" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  };

  const root = document.getElementById("app");
  const state = { videos: [], hot: [], query: "", price: 0, page: "home", cat: null, failed: false, sort: "", aliStatus: "idle", aliProducts: [], aliReply: "", aliKind: "", lastSearchQuery: "" };

  function ils(n) {
    if (n == null || n === "") return "";
    return "₪" + Number(n).toFixed(2);
  }
  function num(n) {
    return Number(n || 0).toLocaleString("en-US");
  }
  function isAffiliate(url) {
    return typeof url === "string" && url.indexOf("s.click.aliexpress.com") !== -1;
  }
  const resolveCache = {};
  const resolvePending = {};
  function isAndroid() { return /Android/i.test(navigator.userAgent || ""); }
  function isIOS() { return /iPhone|iPad|iPod/i.test(navigator.userAgent || ""); }
  function inAppName() {
    const ua = navigator.userAgent || "";
    if (/BytedanceWebview|TikTok|musical_ly/i.test(ua)) return "tiktok";
    if (/Barcelona/i.test(ua)) return "threads";
    if (/Instagram/i.test(ua)) return "instagram";
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
    return "";
  }
  function isInAppBrowser() {
    const ua = navigator.userAgent || "";
    return !!inAppName()
      || /Line\/|Snapchat|Twitter|Pinterest|MicroMessenger/i.test(ua)
      || (/Android/i.test(ua) && /; wv\)/.test(ua));
  }
  function isTrapInApp() {
    return /tiktok|instagram|facebook|threads/.test(inAppName());
  }
  function intentUrl(url, packageName) {
    const raw = String(url || "");
    const path = raw.replace(/^https?:\/\//i, "");
    return "intent://" + path + "#Intent;scheme=https;package=" + packageName +
      ";S.browser_fallback_url=" + encodeURIComponent(raw) + ";end";
  }
  function aliIntent(url) { return intentUrl(url, "com.alibaba.aliexpresshd"); }
  function chromeIntent(url) { return intentUrl(url, "com.android.chrome"); }
  function safariEscapeUrl(url) {
    return String(url || "").replace(/^https:\/\//i, "x-safari-https://").replace(/^http:\/\//i, "x-safari-http://");
  }
  function instagramEscapeUrl(url) {
    return "instagram://extbrowser/?url=" + encodeURIComponent(url);
  }
  function shopPageUrl() {
    try { return location.href.split("#")[0]; } catch (e) { return ""; }
  }
  function hasAffParams(url) {
    return /aff_|aff_fcid|aff_short_key|aff_platform|aff_trace_key|albch=|dp=|sk=/.test(String(url || ""));
  }
  function isLaunchHref(h) {
    h = String(h || "");
    return /^(intent:|x-safari-|instagram:\/\/extbrowser)/i.test(h)
      || /^https:\/\/([a-z0-9-]+\.)*aliexpress\.(com|us|ru)\//i.test(h);
  }
  function launchHref(dest) {
    dest = String(dest || "");
    if (!dest) return dest;
    if (isAndroid()) return aliIntent(dest);
    if (isIOS() && isTrapInApp()) {
      if (inAppName() === "instagram") return instagramEscapeUrl(dest);
      return safariEscapeUrl(dest);
    }
    return dest;
  }
  function escapeHref(url) {
    url = url || shopPageUrl();
    if (isAndroid()) return chromeIntent(url);
    if (inAppName() === "instagram") return instagramEscapeUrl(url);
    if (isIOS()) return safariEscapeUrl(url);
    return url;
  }
  function setBuyHref(a, dest) {
    if (!a || !dest) return;
    const href = launchHref(dest);
    a.setAttribute("href", href);
    a.setAttribute("rel", "noopener");
    if (!isAndroid() && !isIOS()) a.setAttribute("target", "_blank");
    else a.removeAttribute("target");
  }
  function prefetchResolve(url, cb) {
    if (!url || !isAffiliate(url)) { if (cb) cb(null); return; }
    if (resolveCache[url]) { if (cb) cb(resolveCache[url]); return; }
    if (resolvePending[url]) { if (cb) resolvePending[url].push(cb); return; }
    resolvePending[url] = cb ? [cb] : [];
    const opts = { headers: trackHeaders(), credentials: "include" };
    fetch(API_BASE + "/resolve?url=" + encodeURIComponent(url), opts)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        const dest = (d && d.ok && d.aff && d.final) ? d.final : null;
        if (dest) resolveCache[url] = dest;
        const waits = resolvePending[url] || [];
        delete resolvePending[url];
        waits.forEach(function (fn) { try { fn(dest); } catch (e) {} });
      })
      .catch(function () {
        const waits = resolvePending[url] || [];
        delete resolvePending[url];
        waits.forEach(function (fn) { try { fn(null); } catch (e) {} });
      });
  }
  function copyText(text) {
    if (!text) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {});
      return;
    }
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    } catch (e) {}
  }
  function escapeCopyUrl(productUrl) {
    return productUrl && /^https?:/i.test(productUrl) ? productUrl : shopPageUrl();
  }
  function showEscapeBanner(productUrl) {
    if (!isTrapInApp()) return;
    let bar = document.getElementById("escape-banner");
    const app = inAppName();
    const host = app === "instagram" ? "אינסטגרם" : (app === "facebook" ? "פייסבוק" : "טיקטוק");
    const cta = isAndroid() ? "פתחו בכרום" : "פתחו בספארי";
    const href = escapeHref(shopPageUrl());
    const copyUrl = escapeCopyUrl(productUrl);
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "escape-banner";
      bar.className = "escape-banner";
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    document.body.classList.add("has-escape-banner");
    bar.innerHTML =
      '<div class="escape-banner-inner">' +
        "<strong>פותחים את " + host + " בדפדפן פנימי, ומשם אי אפשר להיכנס לאפליקציית אלי אקספרס</strong>" +
        "<p>בלי האפליקציה זה נראה חשוד, ורוב האנשים לא קונים. לחצו כאן כדי לעבור לדפדפן האמיתי — משם «לרכישה» פותח את האפליקציה.</p>" +
        '<div class="escape-actions"><a class="escape-cta" id="escape-cta" rel="noopener">' + cta + "</a>" +
        '<button type="button" class="escape-copy" data-act="copy">העתיקו קישור</button></div>' +
        '<p class="escape-alt">אם זה לא נפתח: לחצו על ⋯ למעלה ובחרו «לפתוח בדפדפן»</p>' +
      "</div>";
    const ctaEl = document.getElementById("escape-cta");
    if (ctaEl) ctaEl.setAttribute("href", href);
    bar.setAttribute("data-copy", copyUrl);
    requestAnimationFrame(function () {
      const h = bar.offsetHeight || 210;
      document.body.style.setProperty("--escape-h", h + "px");
    });
    if (!bar._bound) {
      bar._bound = true;
      window.addEventListener("resize", function () {
        if (bar && !bar.hidden) document.body.style.setProperty("--escape-h", (bar.offsetHeight || 210) + "px");
      });
      bar.addEventListener("click", function (e) {
        const act = (e.target && e.target.getAttribute && e.target.getAttribute("data-act")) || "";
        if (act === "copy") {
          e.preventDefault();
          copyText(bar.getAttribute("data-copy") || shopPageUrl());
          const b = e.target;
          const prev = b.textContent;
          b.textContent = "הקישור הועתק";
          setTimeout(function () { b.textContent = prev; }, 1600);
        }
      });
    }
  }
  function showOpenAppPrompt(dest) {
    let bar = document.getElementById("open-hint");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "open-hint";
      bar.className = "open-hint";
      document.body.appendChild(bar);
    }
    bar.hidden = false;
    bar.innerHTML =
      "<p>הקישור מוכן. לחצו כדי לפתוח את אפליקציית אלי אקספרס.</p>" +
      '<div class="open-hint-row">' +
      '<a class="open-hint-btn" id="open-app-cta" rel="noopener">פתחו באפליקציה</a>' +
      '<button type="button" class="open-hint-btn ghost" data-act="close">סגור</button>' +
      "</div>";
    const a = document.getElementById("open-app-cta");
    if (a) {
      setBuyHref(a, dest);
    }
    if (!bar._bound) {
      bar._bound = true;
      bar.addEventListener("click", function (e) {
        if (e.target && e.target.getAttribute && e.target.getAttribute("data-act") === "close") {
          bar.hidden = true;
        }
      });
    }
  }
  function armEscapeFallback(url) {
    setTimeout(function () {
      if (document.visibilityState === "visible" && isTrapInApp()) showEscapeBanner(url);
    }, 1300);
  }
  function launchAli(dest, fallback) {
    const start = dest || fallback;
    if (!start) return;
    if (isAndroid()) {
      window.location.href = aliIntent(start);
      setTimeout(function () {
        if (document.visibilityState === "visible") {
          window.location.href = chromeIntent(start);
        }
      }, 900);
      return;
    }
    if (isIOS() && isTrapInApp()) {
      showEscapeBanner(start);
      window.location.href = launchHref(start);
      return;
    }
    window.location.href = start;
  }
  function openBuy(url, ev) {
    if (!isAffiliate(url)) {
      if (ev) ev.preventDefault();
      return;
    }
    const btn = ev && ev.currentTarget;
    track({
      kind: "buy",
      product_id: btn && btn.getAttribute("data-id"),
      title: btn && btn.getAttribute("data-title"),
      price: btn && btn.getAttribute("data-price"),
      section: (btn && btn.getAttribute("data-section")) || "search",
    });
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && typeof tg.openLink === "function") {
      if (ev) ev.preventDefault();
      const go = function (dest) { try { tg.openLink(dest, { try_instant_view: false }); } catch (e) { launchAli(dest, url); } };
      if (resolveCache[url]) return go(resolveCache[url]);
      prefetchResolve(url, function (dest) { go(dest || url); });
      return;
    }
    const dest = resolveCache[url];
    if (dest && btn) setBuyHref(btn, dest);
    const href = (btn && btn.getAttribute("href")) || "";
    if (dest && isLaunchHref(href)) {
      armEscapeFallback(dest);
      return;
    }
    if (ev) ev.preventDefault();
    if (isTrapInApp() && !dest) {
      showEscapeBanner(url);
      prefetchResolve(url, function (d) { if (d) showEscapeBanner(d); });
      return;
    }
    if (dest) {
      launchAli(dest, url);
      return;
    }
    showOpenAppPrompt(url);
    const cta = document.getElementById("open-app-cta");
    if (cta) cta.textContent = "מכין את הקישור…";
    prefetchResolve(url, function (d) {
      const ready = d || url;
      if (cta) {
        setBuyHref(cta, ready);
        cta.textContent = "פתחו באפליקציה";
      }
    });
  }
  function maybeEscapeInApp() {
    if (!isTrapInApp()) return;
    showEscapeBanner();
    try {
      if (sessionStorage.getItem("pini_escape_tried") === "1") return;
      sessionStorage.setItem("pini_escape_tried", "1");
    } catch (e) {}
    // Don't auto-navigate on localhost (tests / local preview).
    const host = (location.hostname || "");
    if (host === "127.0.0.1" || host === "localhost") return;
    // Auto-try once. TikTok often ignores this without a tap; the banner is the reliable path.
    const href = escapeHref(shopPageUrl());
    if (isAndroid()) {
      const fr = document.createElement("iframe");
      fr.style.display = "none";
      fr.src = href;
      document.body.appendChild(fr);
      setTimeout(function () { try { fr.remove(); } catch (e) {} }, 2000);
    } else if (isIOS()) {
      try { window.location.href = href; } catch (e) {}
    }
  }
  window.__piniLinks = {
    intentUrl: intentUrl,
    aliIntent: aliIntent,
    chromeIntent: chromeIntent,
    safariEscapeUrl: safariEscapeUrl,
    instagramEscapeUrl: instagramEscapeUrl,
    launchHref: launchHref,
    escapeHref: escapeHref,
    hasAffParams: hasAffParams,
    isTrapInApp: isTrapInApp,
    inAppName: inAppName,
  };
  const API_BASE = "https://84-13-70-240.sslip.io";
  function isShopTest() {
    try {
      if (/[?&]ctest=1/.test(location.search || "")) {
        try { localStorage.setItem("pini_ctest", "1"); } catch (e) {}
      }
      return localStorage.getItem("pini_ctest") === "1";
    } catch (e) {
      return /[?&]ctest=1/.test(location.search || "");
    }
  }
  function deviceType() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "") ? "mobile" : "desktop";
  }
  function inappType() {
    const ua = navigator.userAgent || "";
    if (/BytedanceWebview|TikTok|musical_ly/i.test(ua)) return "tiktok";
    if (/Instagram/i.test(ua)) return "instagram";
    if (/Telegram/i.test(ua)) return "telegram";
    if (/FBAN|FBAV|FB_IAB/i.test(ua)) return "facebook";
    if (/WhatsApp/i.test(ua)) return "whatsapp";
    if (/; wv\)/.test(ua)) return "other";
    return "none";
  }
  function trafficSource() {
    try {
      const saved = sessionStorage.getItem("pini_src");
      if (saved) return saved;
    } catch (e) {}
    let ref = "";
    try { ref = document.referrer || ""; } catch (e) {}
    let utm = "", frm = "";
    try {
      const p = new URLSearchParams(location.search);
      utm = (p.get("utm_source") || "").toLowerCase();
      frm = (p.get("from") || "").toLowerCase();
    } catch (e) {}
    const inn = inappType();
    const blob = (utm + " " + frm + " " + ref + " " + inn).toLowerCase();
    let src = "direct";
    if (utm === "tiktok" || frm === "tt" || /tiktok|musical_ly/.test(blob) || inn === "tiktok") src = "tiktok";
    else if (utm === "instagram" || /instagram/.test(blob) || inn === "instagram") src = "instagram";
    else if (utm === "telegram" || /t\.me|telegram/.test(blob) || inn === "telegram") src = "telegram";
    else if (utm === "whatsapp" || /whatsapp|wa\.me/.test(blob) || inn === "whatsapp") src = "whatsapp";
    else if (ref) src = "other";
    try { sessionStorage.setItem("pini_src", src); } catch (e) {}
    return src;
  }
  function trackHeaders(extra) {
    const h = Object.assign({
      "Accept": "application/json",
      "X-Pini-Source": trafficSource(),
      "X-Pini-Device": deviceType(),
      "X-Pini-Inapp": inappType(),
    }, extra || {});
    if (isShopTest()) h["X-Pini-Test"] = "1";
    return h;
  }
  function track(ev) {
    if (isShopTest() || !ev) return;
    ev.source = ev.source || trafficSource();
    ev.device = ev.device || deviceType();
    ev.inapp = ev.inapp || inappType();
    try {
      fetch(API_BASE + "/event", {
        method: "POST",
        headers: trackHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ events: [ev] }),
        keepalive: true,
        mode: "cors",
        credentials: "include",
      }).catch(function () {});
    } catch (e) {}
  }
  const SUGGESTS = ["מנורת שקיעה", "מעמד לטלפון לרכב", "אוזניות", "בקבוק מים"];
  const FINDER_EXAMPLES = ["כבל HDMI 1.5 מטר", "מתנה לאמא עד 100", "מה כדאי לקנות לרכב"];
  const SEARCH_STEPS = ["פיני מחפש…", "מסנן מוכרים גרועים…", "בוחר את הטובים ביותר…"];
  const PLACEHOLDER = "img/placeholder.svg";
  function isAliUrl(s) {
    return /aliexpress\.|s\.click\.aliexpress|a\.aliexpress/i.test(s || "");
  }
  function thumbUrl(url) {
    let u = String(url || "").trim();
    if (!u) return PLACEHOLDER;
    if (u.indexOf("//") === 0) u = "https:" + u;
    if (u.indexOf("http://") === 0) u = "https://" + u.slice(7);
    if (/aliexpress-media\.com|ae-pic-|alicdn\.com/.test(u) && u.indexOf("_220x220") === -1 && u.indexOf("_350x350") === -1) {
      u = u.replace(/(\.(?:jpe?g|png|webp))(?:\?.*)?$/i, "$1_220x220.jpg");
    }
    return u;
  }
  function imgTag(src, alt, cls) {
    const url = thumbUrl(src);
    return '<img class="' + (cls || "") + '" src="' + esc(url) + '" alt="' + esc(alt || "") +
      '" referrerpolicy="no-referrer" decoding="async" loading="eager" onerror="this.onerror=null;this.src=\'' + PLACEHOLDER + '\';">';
  }
  function suggestions() {
    return '<div class="suggest"><div class="suggest-label">נסו למשל</div>' +
      SUGGESTS.map(function (s) {
        return '<button type="button" class="chip" data-q="' + esc(s) + '">' + esc(s) + "</button>";
      }).join("") + "</div>";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cardSection(opts) {
    if (opts && opts.section) return opts.section;
    if (state.aliKind === "advice") return "advice";
    if (state.page === "videos") return "videos";
    if (state.aliKind === "photo" || state.aliKind === "similar" || (state.query && state.aliStatus && state.aliStatus !== "idle")) return "search";
    return "hot";
  }
  function card(p, opts) {
    if (!p || !isAffiliate(p.link)) return "";
    const disc = p.discount && p.discount >= 8
      ? '<div class="badge" dir="ltr">-' + p.discount + "%</div>"
      : "";
    const was = p.orig ? '<span class="was">' + ils(p.orig) + "</span>" : "";
    let stats = "";
    if (p.stars) {
      stats = '<div class="stats"><span class="star">★</span> ' + p.stars;
      if (p.orders) stats += " · " + num(p.orders) + " הזמנות";
      stats += "</div>";
    } else if (p.orders) {
      stats = '<div class="stats">' + num(p.orders) + " הזמנות</div>";
    }
    return (
      '<article class="card">' +
        '<div class="pic">' + imgTag(p.image, p.title) + disc + "</div>" +
        '<div class="meta">' +
          '<div class="name">' + esc(p.title) + "</div>" +
          (p.desc ? '<div class="desc">' + esc(p.desc) + "</div>" : "") +
          '<div class="price"><span class="now">' + ils(p.price) + "</span>" + was + "</div>" +
          stats +
          '<a class="buy" data-link="' + esc(p.link) +
            '" href="' + esc(p.link) +
            '" data-id="' + esc(p.id || "") +
            '" data-title="' + esc(p.title || "") +
            '" data-price="' + esc(p.price == null ? "" : p.price) +
            '" data-section="' + esc(cardSection(opts)) +
            '" rel="noopener">לרכישה</a>' +
          (opts && opts.similar && p.id ? '<button type="button" class="more" data-similar="' + esc(p.id) + '">עוד כאלה</button>' : "") +
        "</div>" +
      "</article>"
    );
  }

  function underPrice(p) {
    if (!state.price) return true;
    return Number(p.price) <= state.price;
  }
  function matchesQuery(p, q) {
    q = String(q || "").trim().toLowerCase();
    if (!q) return true;
    const blob = ((p.title || "") + " " + (p.desc || "")).toLowerCase();
    return blob.indexOf(q) !== -1;
  }
  function allProducts() {
    const out = [];
    state.videos.forEach(function (g) {
      (g.products || []).forEach(function (p) { out.push(p); });
    });
    (state.hot || []).forEach(function (p) { out.push(p); });
    return out;
  }
  function uniqueById(list) {
    const seen = {}, out = [];
    list.forEach(function (p) {
      if (!p || !p.id || seen[p.id]) return;
      seen[p.id] = 1;
      out.push(p);
    });
    return out;
  }
  function catsWithItems() {
    const have = {};
    allProducts().forEach(function (p) { if (p.cat) have[p.cat] = 1; });
    return CATS.filter(function (c) { return have[c.key]; });
  }

  function bind(el) {
    el.querySelectorAll("[data-link]").forEach(function (btn) {
      const url = btn.getAttribute("data-link");
      setBuyHref(btn, resolveCache[url] || url);
      prefetchResolve(url, function (dest) { if (dest) setBuyHref(btn, dest); });
      btn.addEventListener("pointerdown", function () { prefetchResolve(url); }, { passive: true });
      btn.addEventListener("click", function (e) { openBuy(url, e); });
    });
    el.querySelectorAll("[data-go]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        const go = a.getAttribute("data-go");
        if (go === "videos") { e.preventDefault(); nav("videos"); }
        else if (go === "home") { e.preventDefault(); nav("home"); }
        else if (go.indexOf("cat:") === 0) { e.preventDefault(); nav("cat", { cat: go.slice(4) }); }
      });
    });
    el.querySelectorAll("[data-group]").forEach(function (a) {
      a.addEventListener("click", function () {
        track({ kind: "group", group: a.getAttribute("data-group") });
      });
    });
    bindSearch(el.querySelector("#q"));
    el.querySelectorAll("[data-price]").forEach(function (c) {
      c.addEventListener("click", function () {
        state.price = Number(c.getAttribute("data-price")) || 0;
        syncChips();
        drawResults();
      });
    });
    bindExtras(el);
  }

  function bindResults(el) {
    if (!el) return;
    el.querySelectorAll("[data-link]").forEach(function (btn) {
      const url = btn.getAttribute("data-link");
      setBuyHref(btn, resolveCache[url] || url);
      prefetchResolve(url, function (dest) { if (dest) setBuyHref(btn, dest); });
      btn.addEventListener("pointerdown", function () { prefetchResolve(url); }, { passive: true });
      btn.addEventListener("click", function (e) { openBuy(url, e); });
    });
    el.querySelectorAll("[data-go]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        const go = a.getAttribute("data-go");
        if (go === "videos") { e.preventDefault(); nav("videos"); }
        else if (go === "home") { e.preventDefault(); nav("home"); }
        else if (go.indexOf("cat:") === 0) { e.preventDefault(); nav("cat", { cat: go.slice(4) }); }
      });
    });
    bindExtras(el);
  }

  function bindExtras(el) {
    if (!el) return;
    el.querySelectorAll("[data-q]").forEach(function (b) {
      b.addEventListener("click", function () {
        const q = b.getAttribute("data-q") || "";
        const inp = document.getElementById("q");
        if (inp) inp.value = q;
        state.sort = "";
        applyQuery(q, { fromTyping: false });
      });
    });
    el.querySelectorAll("[data-sort]").forEach(function (b) {
      b.addEventListener("click", function () {
        state.sort = b.getAttribute("data-sort") || "";
        startAliSearch(state.query);
      });
    });
    el.querySelectorAll("[data-similar]").forEach(function (b) {
      b.addEventListener("click", function () {
        const id = b.getAttribute("data-similar");
        if (id) startSimilar(id);
      });
    });
    const file = el.querySelector("#photo");
    if (file && file.getAttribute("data-bound") !== "1") {
      file.setAttribute("data-bound", "1");
      file.addEventListener("change", function () {
        if (file.files && file.files[0]) startPhoto(file.files[0]);
        file.value = "";
      });
    }
  }

  var searchTimer = null;

  function bindSearch(inp) {
    if (!inp || inp.getAttribute("data-bound") === "1") return;
    inp.setAttribute("data-bound", "1");
    inp.addEventListener("input", function () {
      // Keep the typed value as-is (don't write back or trim the field).
      state.query = inp.value;
      clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        applyQuery(inp.value, { fromTyping: true });
      }, state.page === "home" ? 500 : 200);
    });
    function submit() {
      clearTimeout(searchTimer);
      applyQuery(inp.value, { fromTyping: true });
      inp.blur();
    }
    inp.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submit();
      }
    });
    inp.addEventListener("search", function () {
      submit();
    });
    inp.addEventListener("focus", function () { stopPlaceholder(); });
    inp.addEventListener("blur", function () {
      if (!(inp.value || "").trim()) startPlaceholder();
    });
  }

  var aliAbort = null;
  var aliSeq = 0;

  function applyQuery(value, opts) {
    opts = opts || {};
    state.query = (value || "").trim();
    state.sort = opts.keepSort ? state.sort : "";
    const url = urlFor(state.page, { cat: state.cat, query: state.query });
    history.replaceState({ page: state.page, cat: state.cat, query: state.query }, "", url);
    if (state.page === "home") {
      startAliSearch(state.query);
      return;
    }
    drawResults();
  }

  var aliAbort = null;
  var aliSeq = 0;
  var progressTimer = null;

  function setProgress(seq) {
    var step = 0;
    if (progressTimer) clearInterval(progressTimer);
    progressTimer = setInterval(function () {
      if (seq !== aliSeq) { clearInterval(progressTimer); return; }
      step += 1;
      const box = document.getElementById("results");
      if (!box || state.aliStatus !== "loading") { clearInterval(progressTimer); return; }
      const el = box.querySelector("#search-step");
      if (el) el.textContent = SEARCH_STEPS[step % SEARCH_STEPS.length];
    }, 2200);
  }

  function startAliSearch(q) {
    if (aliAbort) {
      try { aliAbort.abort(); } catch (e) {}
      aliAbort = null;
    }
    q = (q || "").trim();
    if (q.length < 2) {
      state.aliStatus = "idle";
      state.aliProducts = [];
      state.aliReply = "";
      state.aliKind = "";
      drawResults();
      return;
    }
    const seq = ++aliSeq;
    state.aliStatus = "loading";
    state.aliProducts = [];
    state.aliReply = "";
    drawResults();
    setProgress(seq);
    const ctl = new AbortController();
    aliAbort = ctl;
    const timer = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 50000);
    let path;
    if (isAliUrl(q)) {
      path = "/link?url=" + encodeURIComponent(q);
    } else {
      path = "/search?q=" + encodeURIComponent(q);
      if (state.sort) path += "&sort=" + encodeURIComponent(state.sort);
      if (state.lastSearchQuery && state.lastSearchQuery !== q) {
        path += "&prev=" + encodeURIComponent(state.lastSearchQuery);
      }
    }
    fetch(API_BASE + path, {
      signal: ctl.signal,
      cache: "no-store",
      credentials: "include",
      headers: trackHeaders(),
    })
      .then(function (r) {
        return r.json().then(function (data) { return { status: r.status, data: data || {} }; })
          .catch(function () { return { status: r.status, data: {} }; });
      })
      .then(function (pack) {
        if (seq !== aliSeq) return;
        const data = pack.data || {};
        if (data.ok === false && pack.status === 429) {
          state.aliStatus = "rate";
          state.aliProducts = [];
          state.aliReply = "";
          drawResults();
          return;
        }
        if (data.ok === false && !(data.products || []).length) {
          state.aliStatus = (data.error === "not_found" || data.error === "bad_link" || data.error === "not_a_product_link") ? "empty" : "error";
          state.aliProducts = [];
          state.aliReply = "";
          drawResults();
          return;
        }
        const list = (data.products || []).filter(function (p) {
          return p && isAffiliate(p.link);
        });
        state.aliProducts = list;
        state.aliReply = data.reply || "";
        state.aliKind = data.kind || "search";
        if (data.kind !== "offtopic" && (data.understood || data.q || q)) {
          state.lastSearchQuery = data.understood || data.q || q;
        }
        if (data.kind === "offtopic") state.aliStatus = "advice";
        else state.aliStatus = list.length ? "ok" : "empty";
        drawResults();
      })
      .catch(function () {
        if (seq !== aliSeq) return;
        state.aliStatus = "error";
        state.aliProducts = [];
        state.aliReply = "";
        drawResults();
      })
      .then(function () { clearTimeout(timer); if (progressTimer) clearInterval(progressTimer); },
            function () { clearTimeout(timer); if (progressTimer) clearInterval(progressTimer); });
  }

  function startSimilar(id) {
    const seq = ++aliSeq;
    if (aliAbort) { try { aliAbort.abort(); } catch (e) {} }
    state.aliStatus = "loading";
    state.aliReply = "";
    drawResults();
    setProgress(seq);
    const have = (state.aliProducts || []).map(function (p) { return p.id; }).filter(Boolean);
    fetch(API_BASE + "/similar?id=" + encodeURIComponent(id) + (have.length ? "&exclude=" + encodeURIComponent(have.join(",")) : ""), {
      cache: "no-store",
      credentials: "include",
      headers: trackHeaders(),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (seq !== aliSeq) return;
        const list = ((data && data.products) || []).filter(function (p) { return p && isAffiliate(p.link); });
        state.aliProducts = list;
        state.aliKind = "similar";
        state.aliReply = list.length ? "עוד מוצרים בסגנון הזה:" : "";
        state.aliStatus = list.length ? "ok" : "empty";
        drawResults();
      })
      .catch(function () {
        if (seq !== aliSeq) return;
        state.aliStatus = "error";
        drawResults();
      })
      .then(function () { if (progressTimer) clearInterval(progressTimer); });
  }

  function startPhoto(file) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      state.aliStatus = "error";
      state.aliReply = "התמונה כבדה מדי. נסו צילום עד 5MB.";
      state.aliProducts = [];
      drawResults();
      return;
    }
    const seq = ++aliSeq;
    state.aliStatus = "loading";
    state.aliReply = "";
    state.query = "";
    state.lastSearchQuery = "";
    const inp = document.getElementById("q");
    if (inp) inp.value = "";
    drawResults();
    setProgress(seq);
    resizeImage(file).then(function (dataUrl) {
      if (seq !== aliSeq) return;
      return fetch(API_BASE + "/photo", {
        method: "POST",
        cache: "no-store",
        credentials: "include",
        headers: trackHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ image: dataUrl, mime: "image/jpeg" }),
      }).then(function (r) { return r.json().then(function (data) { return { status: r.status, data: data || {} }; }); });
    }).then(function (pack) {
      if (seq !== aliSeq || !pack) return;
      const data = pack.data || {};
      const list = (data.products || []).filter(function (p) { return p && isAffiliate(p.link); });
      state.aliProducts = list;
      state.aliReply = data.reply || data.understood || "";
      state.aliKind = "photo";
      state.aliStatus = list.length ? "ok" : (data.reply ? "advice" : "empty");
      drawResults();
    }).catch(function () {
      if (seq !== aliSeq) return;
      state.aliStatus = "error";
      state.aliReply = "לא הצלחתי לקרוא את התמונה. נסו צילום חד יותר, או כתבו מה אתם מחפשים.";
      drawResults();
    }).then(function () { if (progressTimer) clearInterval(progressTimer); });
  }

  function resizeImage(file) {
    return new Promise(function (resolve, reject) {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = function () {
        const max = 1280;
        let w = img.width, h = img.height;
        if (Math.max(w, h) > max) {
          const s = max / Math.max(w, h);
          w = Math.round(w * s);
          h = Math.round(h * s);
        }
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        c.getContext("2d").drawImage(img, 0, 0, w, h);
        URL.revokeObjectURL(url);
        resolve(c.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("bad image"));
      };
      img.src = url;
    });
  }

  function syncChips() {
    document.querySelectorAll("[data-price]").forEach(function (c) {
      const on = Number(state.price) === Number(c.getAttribute("data-price"));
      c.classList.toggle("on", on);
    });
  }

  function priceChips() {
    const opts = [[0, "הכל"], [30, "עד ₪30"], [50, "עד ₪50"], [100, "עד ₪100"]];
    return '<div class="filters">' + opts.map(function (o) {
      const on = Number(state.price) === o[0] ? " on" : "";
      return '<button type="button" class="chip' + on + '" data-price="' + o[0] + '">' + o[1] + "</button>";
    }).join("") + "</div>";
  }
  function catRow(selected) {
    const list = catsWithItems();
    if (!list.length) return "";
    return '<div class="cats">' + list.map(function (c) {
      const on = selected === c.key ? " sel" : "";
      return '<button type="button" class="cat' + on + '" data-go="cat:' + c.key + '"><div class="bubble">' +
        ICONS[c.svg] + "</div><label>" + esc(c.name) + "</label></button>";
    }).join("") + "</div>";
  }
  function skelCard() {
    return '<div class="skel-card" aria-hidden="true"><div class="skel-pic"></div><div class="skel-line"></div><div class="skel-line short"></div><div class="skel-btn"></div></div>';
  }

  function searchingHTML() {
    return '<div class="searching" role="status" aria-live="polite" aria-busy="true">' +
      '<div class="searching-hero">' +
        '<div class="searching-face">' +
          '<img src="img/pini.jpg" alt="">' +
          '<span class="searching-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        "</div>" +
        '<p class="searching-lead">פיני סורק את כל אלי אקספרס בשבילך, זה לוקח כמה שניות…</p>' +
        '<p class="searching-step" id="search-step">' + SEARCH_STEPS[0] + "</p>" +
      "</div>" +
      '<div class="skel-grid">' + skelCard() + skelCard() + skelCard() + skelCard() + "</div>" +
    "</div>";
  }

  function finderBlock() {
    const chips = FINDER_EXAMPLES.map(function (s) {
      return '<button type="button" class="chip finder-chip" data-q="' + esc(s) + '">' + esc(s) + "</button>";
    }).join("");
    return '<section class="finder" aria-label="הבוט של פיני">' +
      '<h2 class="finder-title">🦝 פיני ימצא לך כל מוצר באלי אקספרס</h2>' +
      '<p class="finder-sub">רק כתבו מה אתם צריכים, והוא יביא את הכי טובים במחיר הכי שווה</p>' +
      searchBar(FINDER_EXAMPLES[0], { photo: true, help: false }) +
      '<div class="finder-chips">' + chips + "</div>" +
      '<p class="search-help">אפשר גם להדביק קישור מאלי, או לצלם מוצר.</p>' +
    "</section>";
  }

  var placeTimer = null;
  var placeIdx = 0;
  var placeChar = 0;
  var placeDeleting = false;

  function stopPlaceholder() {
    if (placeTimer) { clearTimeout(placeTimer); placeTimer = null; }
  }

  function startPlaceholder() {
    stopPlaceholder();
    const inp = document.getElementById("q");
    if (!inp || state.page !== "home") return;
    if ((inp.value || "").length || document.activeElement === inp) return;
    function tick() {
      const field = document.getElementById("q");
      if (!field || (field.value || "").length || document.activeElement === field) return;
      const word = FINDER_EXAMPLES[placeIdx % FINDER_EXAMPLES.length];
      if (!placeDeleting) {
        placeChar += 1;
        field.placeholder = word.slice(0, placeChar);
        if (placeChar >= word.length) {
          placeDeleting = true;
          placeTimer = setTimeout(tick, 1800);
          return;
        }
        placeTimer = setTimeout(tick, 70);
      } else {
        placeChar -= 1;
        field.placeholder = word.slice(0, Math.max(0, placeChar));
        if (placeChar <= 0) {
          placeDeleting = false;
          placeIdx = (placeIdx + 1) % FINDER_EXAMPLES.length;
          placeTimer = setTimeout(tick, 320);
          return;
        }
        placeTimer = setTimeout(tick, 40);
      }
    }
    placeTimer = setTimeout(tick, 500);
  }

  function searchBar(placeholder, opts) {
    opts = opts || {};
    let html = '<div class="search">' + ICONS.search +
      '<input id="q" type="search" enterkeyhint="search" placeholder="' + esc(placeholder || "מה אתם מחפשים?") +
      '" value="' + esc(state.query) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">';
    if (opts.photo) {
      html += '<div class="tools"><label class="iconbtn" for="photo" title="חיפוש לפי תמונה" aria-label="חיפוש לפי תמונה">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M4 7.5h3l1.2-2h7.6L17 7.5h3A1.5 1.5 0 0 1 21.5 9v9A1.5 1.5 0 0 1 20 19.5H4A1.5 1.5 0 0 1 2.5 18V9A1.5 1.5 0 0 1 4 7.5z" stroke="currentColor" stroke-width="1.7"/><circle cx="12" cy="13.2" r="3.2" stroke="currentColor" stroke-width="1.7"/></svg>' +
        '</label><input id="photo" type="file" accept="image/*" capture="environment" hidden></div>';
    }
    html += "</div>";
    if (opts.help) {
      html += '<div class="search-help">כתבו מה אתם מחפשים, הדביקו קישור מאלי, או צלמו מוצר. אפשר גם תקציב, למשל «מנורה עד 50».</div>';
    }
    return html;
  }

  function groupsFooter() {
    const wa = "https://chat.whatsapp.com/JEhehJTm0lXJl5LZw6cHCM";
    const ch = "https://t.me/pinideals";
    const gr = "https://t.me/pinitheraccoon";
    const icoWa = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12.04 2c-5.5 0-10 4.48-10 10 0 1.77.46 3.45 1.28 4.92L2 22l5.25-1.38A9.96 9.96 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-9.99-10zm0 18.2c-1.64 0-3.22-.44-4.6-1.26l-.33-.2-3.11.82.83-3.04-.22-.35A8.16 8.16 0 0 1 3.84 12c0-4.52 3.68-8.2 8.2-8.2 4.52 0 8.2 3.68 8.2 8.2 0 4.52-3.68 8.2-8.2 8.2zm4.5-6.14c-.25-.12-1.46-.72-1.68-.8-.23-.08-.4-.12-.56.12-.17.25-.64.8-.79.96-.15.17-.29.19-.54.06-.25-.12-1.04-.38-1.98-1.22-.73-.65-1.23-1.45-1.37-1.7-.15-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.12-.56-1.35-.77-1.85-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.9 2.4 1.02 2.56.12.17 1.77 2.7 4.29 3.79.6.26 1.07.41 1.44.53.6.19 1.15.16 1.58.1.48-.07 1.46-.6 1.67-1.17.21-.58.21-1.07.15-1.17-.06-.1-.23-.16-.48-.29z"/></svg>';
    const icoTg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M21.5 4.3 18.9 20c-.2.9-.7 1.1-1.5.7l-4.1-3-2 1.9c-.2.2-.4.4-.8.4l.3-4.3 7.8-7c.3-.3-.1-.5-.5-.2l-9.6 6-4.1-1.3c-.9-.3-.9-.9.2-1.3l16-6.2c.8-.3 1.4.2 1.2 1.2z"/></svg>';
    return '<div class="groups">' +
      '<p>רוצים דילים ישר לטלפון? הצטרפו לקבוצות</p>' +
      '<div class="groups-row">' +
        '<a href="' + wa + '" target="_blank" rel="noopener" data-group="wa">'+ icoWa + 'וואטסאפ</a>' +
        '<a href="' + ch + '" target="_blank" rel="noopener" data-group="tg_channel">'+ icoTg + 'ערוץ טלגרם</a>' +
        '<a href="' + gr + '" target="_blank" rel="noopener" data-group="tg_group">'+ icoTg + 'קבוצת טלגרם</a>' +
      "</div></div>";
  }

  function header(home) {
    if (home) {
      return '<div class="top"><img src="img/pini.jpg" alt="פיני"><div>' +
        "החנות של פיני".replace(/^/, "<h1>") + "</h1>" +
        "<p>דילים מהסרטונים, מחיר בשקלים</p></div></div>";
    }
    return "";
  }
  function backHead(title, sub, href) {
    return '<div class="backrow"><a class="back" href="' + esc(href || "index.html") + '" data-go="home" aria-label="חזרה">' +
      ICONS.back + "</a><div><h1>" + esc(title) + "</h1>" +
      (sub ? "<p>" + esc(sub) + "</p>" : "") + "</div></div>";
  }
  function gridOrEmpty(items, emptyHtml) {
    const vis = items.filter(underPrice);
    if (!vis.length) return emptyHtml || '<div class="empty">לא מצאנו מוצרים במחיר הזה.</div>';
    return '<div class="grid">' + vis.map(card).join("") + "</div>";
  }

  function sortChips() {
    const opts = [["", "רלוונטי"], ["price", "הכי זול"], ["orders", "הכי נמכר"], ["rate", "הכי מדורג"]];
    return '<div class="sorts">' + opts.map(function (o) {
      return '<button type="button" class="chip' + ((state.sort || "") === o[0] ? " on" : "") +
        '" data-sort="' + o[0] + '">' + o[1] + "</button>";
    }).join("") + "</div>";
  }

  function resultsHome() {
    const q = (state.query || "").trim();
    const searching = q.length >= 2 || state.aliKind === "photo" || state.aliKind === "similar" || state.aliStatus === "loading";
    if (searching) {
      if (state.aliStatus === "loading") {
        return searchingHTML();
      }
      if (state.aliStatus === "error") {
        return '<div class="empty">' + esc(state.aliReply || "החיפוש באתר לא הצליח כרגע. נסו שוב בעוד רגע.") + "</div>" + suggestions();
      }
      if (state.aliStatus === "rate") {
        return '<div class="empty">יותר מדי חיפושים ברגע זה. נסו שוב בעוד רגע.</div>' + suggestions();
      }
      const reply = state.aliReply ? '<div class="reply">' + esc(state.aliReply) + "</div>" : "";
      const vis = (state.aliProducts || []).filter(function (p) {
        return isAffiliate(p.link) && underPrice(p);
      });
      if (state.aliStatus === "advice" && !vis.length) {
        return reply + suggestions();
      }
      if (!vis.length) {
        if (state.price) {
          return '<div class="sec"><h2>תוצאות חיפוש</h2></div>' +
            '<div class="empty">אין תוצאות במחיר הזה. נסו טווח אחר.</div>';
        }
        return reply + '<div class="empty">לא מצאנו מוצרים לחיפוש הזה. נסו מילה אחרת, או בחרו אחת מההצעות.</div>' + suggestions();
      }
      const title = state.aliKind === "similar" ? "עוד כאלה" : (state.aliKind === "photo" ? "מוצרים דומים לתמונה" : "תוצאות חיפוש");
      return reply + '<div class="sec"><h2>' + title + "</h2></div>" +
        (state.aliKind === "photo" || state.aliKind === "similar" || isAliUrl(q) ? "" : sortChips()) +
        '<div class="grid">' + vis.map(function (p) { return card(p, { similar: true }); }).join("") + "</div>";
    }
    let html = '<div class="sec"><h2>דילים חמים</h2></div>';
    html += gridOrEmpty((state.hot || []), '<div class="empty">אין דילים חמים להצגה כרגע.</div>');
    const cats = catsWithItems();
    if (cats.length) {
      html += '<div class="sec" style="margin-top:22px"><h2>קטגוריות</h2></div>';
      html += catRow(null);
    }
    return html;
  }

  function resultsVideos() {
    const q = (state.query || "").trim();
    let html = "";
    let shown = 0;
    (state.videos || []).forEach(function (g) {
      const items = (g.products || []).filter(function (p) { return matchesQuery(p, q) && underPrice(p); });
      if (!items.length) return;
      shown += items.length;
      const when = g.date_label ? g.date_label : "";
      html += '<section class="group"><div class="ghead"><h2>' + esc(g.headline) + "</h2>" +
        (when ? '<div class="when">' + esc(when) + "</div>" : "") + "</div>";
      html += '<div class="grid">' + items.map(card).join("") + "</div></section>";
    });
    if (!shown) {
      html += '<div class="empty">לא מצאנו את זה בסרטונים. נסו מילה אחרת, או חפשו בכל אלי בדף הבית.</div>' +
        '<div class="empty"><a href="index.html" data-go="home">לחפש בכל אלי בחנות</a></div>';
    }
    return html;
  }

  function resultsCat() {
    const items = uniqueById(allProducts().filter(function (p) {
      return p.cat === state.cat;
    }));
    return gridOrEmpty(items, '<div class="empty">אין עדיין מוצרים בקטגוריה הזו.<br><a href="videos.html" data-go="videos">למוצרים מהסרטונים</a></div>');
  }

  function resultsHTML() {
    if (state.page === "videos") return resultsVideos();
    if (state.page === "cat") return resultsCat();
    return resultsHome();
  }

  function viewHome() {
    const latest = state.videos[0];
    const thumbs = ((latest && latest.products) || []).slice(0, 5).map(function (p) {
      return p.image ? '<img src="' + esc(p.image) + '" alt="">' : "";
    }).join("");
    let html = header(true);
    html += '<a class="hero" href="videos.html" data-go="videos">' +
      '<div class="thumbs">' + thumbs + "</div>" +
      '<div class="label">הכי קל להתחיל מכאן</div>' +
      "📺 המוצרים מהסרטונים".replace(/^/, "<h2>") + "</h2>" +
      '<div class="sub">כל המוצרים מהטיקטוק, לפי סרטון. מהחדש לישן.</div>' +
      '<div class="go">לכל המוצרים מהסרטונים ←</div>' +
    "</a>";
    html += finderBlock();
    html += priceChips();
    html += '<div id="results">' + resultsHome() + "</div>";
    html += groupsFooter();
    return html;
  }

  function viewVideos() {
    let html = backHead("המוצרים מהסרטונים", "כל המוצרים מהסרטונים, מהחדש לישן", "index.html");
    html += searchBar("חיפוש במוצרים מהסרטונים…");
    html += priceChips();
    html += '<div id="results">' + resultsVideos() + "</div>";
    html += groupsFooter();
    return html;
  }

  function viewCat() {
    const meta = CATS.filter(function (c) { return c.key === state.cat; })[0];
    const name = meta ? meta.name : "";
    let html = backHead(name, "מוצרים נבחרים", "index.html");
    html += catRow(state.cat);
    html += priceChips();
    html += '<div id="results">' + resultsCat() + "</div>";
    html += groupsFooter();
    return html;
  }

  function drawResults() {
    const box = document.getElementById("results");
    if (!box) {
      draw();
      return;
    }
    box.innerHTML = resultsHTML();
    bindResults(box);
  }

  function draw() {
    if (state.failed && !state.videos.length && !state.hot.length) {
      root.innerHTML = header(true) +
        '<div class="err">משהו השתבש בטעינת המוצרים. רעננו את העמוד, או חפשו למעלה בכל אלי.</div>';
      return;
    }
    let html = "";
    if (state.page === "videos") html = viewVideos();
    else if (state.page === "cat") html = viewCat();
    else html = viewHome();
    root.innerHTML = html;
    bind(root);
    window.scrollTo(0, 0);
    if (state.page === "home" && !(state.query || "").trim()) startPlaceholder();
    track({ kind: "page", page: state.page === "videos" ? "videos" : (state.page === "cat" ? "cat" : "home") });
  }

  function urlFor(page, opts) {
    opts = opts || {};
    const path = page === "videos" ? "videos.html" : "index.html";
    const params = [];
    if (page === "cat" && opts.cat) params.push("c=" + encodeURIComponent(opts.cat));
    if (opts.query) params.push("q=" + encodeURIComponent(opts.query));
    return params.length ? path + "?" + params.join("&") : path;
  }
  function nav(page, opts) {
    opts = opts || {};
    state.page = page;
    if (opts.query != null) state.query = opts.query;
    if (page === "cat") state.cat = opts.cat;
    else if (page !== "cat") state.cat = null;
    if (page === "home") state.query = opts.query || "";
    const url = urlFor(state.page, { cat: state.cat, query: state.query });
    if (opts.replace) history.replaceState({ page: page, cat: state.cat, query: state.query }, "", url);
    else history.pushState({ page: page, cat: state.cat, query: state.query }, "", url);
    draw();
  }

  function parseEntry() {
    const q = new URLSearchParams(location.search);
    const path = (location.pathname || "").toLowerCase();
    const hash = (location.hash || "").replace(/^#/, "").toLowerCase();
    if (q.get("q")) state.query = q.get("q");
    if (q.get("v") === "videos" || q.get("section") === "videos" || hash === "videos" ||
        /videos\.html$/.test(path) || /\/videos\/?$/.test(path)) {
      state.page = "videos";
      return;
    }
    if (q.get("c")) { state.page = "cat"; state.cat = q.get("c"); return; }
    if (hash.indexOf("cat=") === 0) { state.page = "cat"; state.cat = hash.slice(4); return; }
    state.page = "home";
  }

  function initTg() {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (!tg) return;
    try {
      tg.ready();
      if (tg.expand) tg.expand();
      if (tg.setHeaderColor) tg.setHeaderColor("#FFF8F1");
      if (tg.setBackgroundColor) tg.setBackgroundColor("#F7EFE4");
    } catch (e) {}
  }

  function loadJSON(url) {
    return fetch(url, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error("http");
      return r.json();
    });
  }

  parseEntry();
  initTg();
  Promise.all([
    loadJSON("data/videos.json").catch(function () { state.failed = true; return { groups: [] }; }),
    loadJSON("data/hot.json").catch(function () { state.failed = true; return { products: [] }; }),
  ]).then(function (pair) {
    state.videos = (pair[0] && pair[0].groups) || [];
    state.hot = (pair[1] && pair[1].products) || [];
    if (!state.videos.length && !state.hot.length) state.failed = true;
    draw();
    maybeEscapeInApp();
    if (state.page === "home" && (state.query || "").trim().length >= 2) {
      startAliSearch(state.query);
    }
  });
  window.addEventListener("popstate", function (e) {
    if (e.state && e.state.page) {
      state.page = e.state.page;
      state.cat = e.state.cat || null;
      state.query = e.state.query || "";
      draw();
    } else {
      parseEntry();
      draw();
    }
    if (state.page === "home" && (state.query || "").trim().length >= 2) {
      startAliSearch(state.query);
    }
  });
})();
