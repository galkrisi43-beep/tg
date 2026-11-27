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
  const state = { videos: [], hot: [], query: "", price: 0, page: "home", cat: null, failed: false };

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
  function openBuy(url, ev) {
    if (ev) ev.preventDefault();
    if (!isAffiliate(url)) return;
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && typeof tg.openLink === "function") tg.openLink(url);
    else window.open(url, "_blank", "noopener");
  }
  const BOT_URL = "https://t.me/Pinizolbot";
  const API_BASE = "https://84-13-70-240.sslip.io";
  function openBot(ev) {
    const tg = window.Telegram && window.Telegram.WebApp;
    if (tg && typeof tg.openTelegramLink === "function") {
      if (ev) ev.preventDefault();
      tg.openTelegramLink(BOT_URL);
    }
    // otherwise the href opens Telegram in a normal browser
  }
  function botCta(kind) {
    if (kind === "fallback") {
      return '<a class="bot-fallback" href="' + BOT_URL + '" data-bot="1">לא מצאתם? פיני יחפש לכם בכל אלי 🦝</a>';
    }
    if (kind === "secondary") {
      return '<a class="botcta botcta-sec" href="' + BOT_URL + '" data-bot="1">' +
        '<div class="botcta-title">או חפשו אצל פיני בטלגרם 🦝</div>' +
        '<div class="botcta-sub">מי שיש לו טלגרם יכול לחפש גם בבוט</div>' +
      "</a>";
    }
    return '<a class="botcta" href="' + BOT_URL + '" data-bot="1">' +
      '<div class="botcta-title">🔎 פיני יחפש לכם בכל אלי</div>' +
      '<div class="botcta-sub">כתבו מה שאתם מחפשים — בחינם</div>' +
    "</a>";
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function card(p) {
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
        '<div class="pic"><img src="' + esc(p.image) + '" alt="' + esc(p.title) + '">' + disc + "</div>" +
        '<div class="meta">' +
          '<div class="name">' + esc(p.title) + "</div>" +
          (p.desc ? '<div class="desc">' + esc(p.desc) + "</div>" : "") +
          '<div class="price"><span class="now">' + ils(p.price) + "</span>" + was + "</div>" +
          stats +
          '<button type="button" class="buy" data-link="' + esc(p.link) + '">לרכישה</button>' +
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
      btn.addEventListener("click", function (e) { openBuy(btn.getAttribute("data-link"), e); });
    });
    el.querySelectorAll("[data-bot]").forEach(function (a) {
      a.addEventListener("click", openBot);
    });
    el.querySelectorAll("[data-go]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        const go = a.getAttribute("data-go");
        if (go === "videos") { e.preventDefault(); nav("videos"); }
        else if (go === "home") { e.preventDefault(); nav("home"); }
        else if (go.indexOf("cat:") === 0) { e.preventDefault(); nav("cat", { cat: go.slice(4) }); }
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
  }

  function bindResults(el) {
    if (!el) return;
    el.querySelectorAll("[data-link]").forEach(function (btn) {
      btn.addEventListener("click", function (e) { openBuy(btn.getAttribute("data-link"), e); });
    });
    el.querySelectorAll("[data-bot]").forEach(function (a) {
      a.addEventListener("click", openBot);
    });
    el.querySelectorAll("[data-go]").forEach(function (a) {
      a.addEventListener("click", function (e) {
        const go = a.getAttribute("data-go");
        if (go === "videos") { e.preventDefault(); nav("videos"); }
        else if (go === "home") { e.preventDefault(); nav("home"); }
        else if (go.indexOf("cat:") === 0) { e.preventDefault(); nav("cat", { cat: go.slice(4) }); }
      });
    });
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
  }

  var aliAbort = null;
  var aliSeq = 0;

  function applyQuery(value, opts) {
    opts = opts || {};
    state.query = (value || "").trim();
    const url = urlFor(state.page, { cat: state.cat, query: state.query });
    history.replaceState({ page: state.page, cat: state.cat, query: state.query }, "", url);
    if (state.page === "home") {
      startAliSearch(state.query);
      return;
    }
    drawResults();
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
      drawResults();
      return;
    }
    const seq = ++aliSeq;
    state.aliStatus = "loading";
    state.aliProducts = [];
    drawResults();
    const ctl = new AbortController();
    aliAbort = ctl;
    const timer = setTimeout(function () { try { ctl.abort(); } catch (e) {} }, 50000);
    fetch(API_BASE + "/search?q=" + encodeURIComponent(q), {
      signal: ctl.signal,
      cache: "no-store",
      headers: { "Accept": "application/json" },
    })
      .then(function (r) {
        return r.json().then(function (data) { return { status: r.status, data: data || {} }; })
          .catch(function () { return { status: r.status, data: {} }; });
      })
      .then(function (pack) {
        if (seq !== aliSeq) return;
        const data = pack.data || {};
        if (!data.ok) {
          state.aliStatus = pack.status === 429 ? "rate" : "error";
          state.aliProducts = [];
          drawResults();
          return;
        }
        const list = (data.products || []).filter(function (p) {
          return p && isAffiliate(p.link);
        });
        state.aliProducts = list;
        state.aliStatus = list.length ? "ok" : "empty";
        drawResults();
      })
      .catch(function () {
        if (seq !== aliSeq) return;
        state.aliStatus = "error";
        state.aliProducts = [];
        drawResults();
      })
      .then(function () { clearTimeout(timer); }, function () { clearTimeout(timer); });
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
  function searchBar(placeholder) {
    return '<div class="search">' + ICONS.search +
      '<input id="q" type="search" enterkeyhint="search" placeholder="' + esc(placeholder || "מה אתם מחפשים?") +
      '" value="' + esc(state.query) + '" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></div>';
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

  function resultsHome() {
    const q = (state.query || "").trim();
    if (q.length >= 2) {
      if (state.aliStatus === "loading") {
        return '<div class="empty">מחפש בכל אלי אקספרס…</div>';
      }
      if (state.aliStatus === "error") {
        return '<div class="empty">החיפוש באתר לא הצליח כרגע.</div>' + botCta("fallback");
      }
      if (state.aliStatus === "rate") {
        return '<div class="empty">יותר מדי חיפושים ברגע זה. נסו שוב בעוד רגע, או חפשו בבוט.</div>' + botCta("fallback");
      }
      const vis = (state.aliProducts || []).filter(function (p) {
        return isAffiliate(p.link) && underPrice(p);
      });
      if (!vis.length) {
        if (state.price) {
          return '<div class="sec"><h2>תוצאות חיפוש</h2></div>' +
            '<div class="empty">אין תוצאות במחיר הזה. נסו טווח אחר.</div>';
        }
        return '<div class="empty">לא מצאנו מוצרים לחיפוש הזה.</div>' + botCta("fallback");
      }
      return '<div class="sec"><h2>תוצאות חיפוש</h2></div>' +
        '<div class="grid">' + vis.map(card).join("") + "</div>";
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
      html += '<div class="empty">לא מצאנו את זה בסרטונים.</div>' +
        botCta("fallback") +
        '<div class="empty"><a href="index.html" data-go="home">חזרה לחנות</a></div>';
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
    html += searchBar("מה אתם מחפשים?");
    html += botCta("secondary");
    html += priceChips();
    html += '<div id="results">' + resultsHome() + "</div>";
    return html;
  }

  function viewVideos() {
    let html = backHead("המוצרים מהסרטונים", "כל המוצרים מהסרטונים, מהחדש לישן", "index.html");
    html += searchBar("חיפוש במוצרים מהסרטונים…");
    html += priceChips();
    html += '<div id="results">' + resultsVideos() + "</div>";
    return html;
  }

  function viewCat() {
    const meta = CATS.filter(function (c) { return c.key === state.cat; })[0];
    const name = meta ? meta.name : "";
    let html = backHead(name, "מוצרים נבחרים", "index.html");
    html += catRow(state.cat);
    html += priceChips();
    html += '<div id="results">' + resultsCat() + "</div>";
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
        '<div class="err">משהו השתבש בטעינת המוצרים. אפשר לחזור לבוט ולחפש שם כרגיל — החנות לא משפיעה עליו.</div>';
      return;
    }
    let html = "";
    if (state.page === "videos") html = viewVideos();
    else if (state.page === "cat") html = viewCat();
    else html = viewHome();
    root.innerHTML = html;
    bind(root);
    window.scrollTo(0, 0);
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
