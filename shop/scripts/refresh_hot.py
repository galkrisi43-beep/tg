#!/usr/bin/env python3
"""Rebuild data/hot.json from the AliExpress API — curated, not a raw dump.

Only car / kitchen / home / gadgets (our best-performing categories).
Quality bar: rating >= 4.6, at least a few hundred orders, a real discount,
price under ₪100. Drops obvious junk (dollhouse, spare bulbs, Tesla-only
high-ticket parts). Hebrew titles come from data/hot_overrides.json when
present; new items are listed for a short Hebrew pass before publishing.

Does not push to GitHub. Does not print secrets. Commission is never stored.

Usage:
  PINIBOT_DIR=/workspace/pinibot SHOP_DIR=/workspace/pinibot/shop python3 refresh_hot.py
"""
from __future__ import annotations
import json, os, sys, re, urllib.request
from pathlib import Path
from datetime import datetime
from zoneinfo import ZoneInfo
from io import BytesIO

HERE = Path(__file__).resolve()
for c in [Path(os.environ.get("PINIBOT_DIR") or ""), Path("/opt/pinibot"), Path("/workspace/pinibot"), HERE.parents[2]]:
    if c and (c / "search.py").exists():
        sys.path.insert(0, str(c))
        break
SHOP = Path(os.environ.get("SHOP_DIR") or HERE.parents[1])

import load_env
load_env.load()
import search
from PIL import Image, ImageOps

QUERIES = {
    "car": ["car accessories interior", "car phone holder organizer", "car seat gap filler", "car led light interior"],
    "kitchen": ["kitchen gadgets organizer", "kitchen tools", "kitchen storage"],
    "home": ["home organizer storage", "bathroom organizer", "led night light"],
    "gadgets": ["phone accessories gadget", "wireless charger earbuds", "phone holder stand"],
}
QUOTA = {"car": 6, "kitchen": 5, "home": 4, "gadgets": 5}
MIN_STARS, MIN_ORDERS, MIN_DISC, MAX_PRICE = 4.6, 400, 12, 100
DROP = re.compile(r"dollhouse|miniature cola|tesla model|t5 led bulb|w5w|license plate|iron sheet|light stick|pokemon|pikachu", re.I)
TRACKING = "telegram"  # 'store' / 'bot' are not created in the portal yet


def unique(items):
    seen, out = set(), []
    for p in items:
        if not p:
            continue
        if not p.get("id") and p.get("product_id"):
            p = search.norm(p)
        i = str(p.get("id") or "")
        if not i or i in seen or not p.get("price") or not p.get("title"):
            continue
        seen.add(i)
        out.append(p)
    return out


def stars(p):
    r = p.get("rate")
    return round(r / 20, 1) if r else 0


def disc(p):
    o, pr = p.get("orig"), p.get("price")
    if o and pr and o > pr:
        return round((1 - pr / o) * 100)
    return 0


def ok(p):
    if p["price"] > MAX_PRICE:
        return False
    if stars(p) < MIN_STARS:
        return False
    if (p.get("orders") or 0) < MIN_ORDERS:
        return False
    if disc(p) < MIN_DISC:
        return False
    if DROP.search(p.get("title") or ""):
        return False
    return True


def save_img(url, dest, max_side=800, quality=80):
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=15) as r:
        data = r.read()
    im = Image.open(BytesIO(data))
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)


def main():
    overrides = {}
    ovp = SHOP / "data" / "hot_overrides.json"
    if ovp.exists():
        overrides = json.loads(ovp.read_text(encoding="utf-8"))

    picked = []
    seen = set()
    needs_hebrew = []
    for cat, kws in QUERIES.items():
        items = []
        for kw in kws:
            try:
                items.extend(search.query_hot(keyword=kw, sort="LAST_VOLUME_DESC", size=20) or [])
            except Exception as e:
                print("query fail", cat, type(e).__name__)
        items = unique(items)
        good = [p for p in items if ok(p)]
        good.sort(key=lambda p: (p.get("orders") or 0) * (1 + disc(p) / 100), reverse=True)
        n = 0
        for p in good:
            if p["id"] in seen:
                continue
            seen.add(p["id"])
            p["_cat"] = cat
            picked.append(p)
            n += 1
            if n >= QUOTA[cat]:
                break
        print(f"{cat}: {n} kept from {len(good)} passing / {len(items)} pooled")

    kept = search.ensure_short_links(picked)
    search._hebrew_titles(kept)
    hot = []
    for p in kept:
        link = p.get("link") or ""
        if not (search.is_affiliate_link(link) and "s.click.aliexpress.com" in link):
            print("drop, no s.click", p.get("id"))
            continue
        ov = overrides.get(p["id"]) or {}
        title = ov.get("title")
        desc = ov.get("desc")
        if not title:
            # do not ship a raw long English/Chinese API title
            needs_hebrew.append({"id": p["id"], "cat": p.get("_cat"), "api_title": (p.get("title") or "")[:120],
                                 "price": p.get("price"), "orders": p.get("orders")})
            continue
        rel = f"img/hot/{p['id'][-10:]}.jpg"
        try:
            if p.get("image"):
                save_img(p["image"], SHOP / rel)
                image = rel
            else:
                continue
        except Exception as e:
            print("img fail", p["id"], type(e).__name__)
            continue
        hot.append({
            "id": p["id"], "cat": p.get("_cat") or ov.get("cat"),
            "title": title, "desc": desc or "",
            "price": p["price"],
            "orig": p["orig"] if p.get("orig") and p["orig"] > p["price"] else None,
            "discount": disc(p),
            "orders": p.get("orders") or 0,
            "stars": stars(p),
            "image": image,
            "link": link,
        })

    now = datetime.now(ZoneInfo("Asia/Jerusalem")).strftime("%Y-%m-%d %H:%M")
    (SHOP / "data").mkdir(exist_ok=True)
    (SHOP / "data" / "hot.json").write_text(
        json.dumps({"updated": now, "tracking_id": TRACKING, "products": hot}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print("wrote hot.json", len(hot), "tracking=", TRACKING)
    if needs_hebrew:
        (SHOP / "data" / "hot_needs_hebrew.json").write_text(
            json.dumps(needs_hebrew, ensure_ascii=False, indent=2), encoding="utf-8")
        print("needs Hebrew titles before publish:", len(needs_hebrew))


if __name__ == "__main__":
    main()
