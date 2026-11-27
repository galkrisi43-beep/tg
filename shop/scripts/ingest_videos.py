#!/usr/bin/env python3
"""Rebuild data/videos.json from carousel folders.

New folders under CAROUSELS_DIR (with products.txt + *_product.jpg)
are picked up automatically, newest date first. Existing hand-written
Hebrew titles/descriptions in data/title_overrides.json are kept.
New products get a short title/description split from the Hebrew line
in products.txt. Links are used as-is and must be s.click affiliate URLs.

Usage:
  CAROUSELS_DIR=/workspace/carousels SHOP_DIR=/workspace/pinibot/shop \\
    python3 ingest_videos.py
"""
from __future__ import annotations
import json, os, re
from pathlib import Path
from datetime import datetime
from PIL import Image, ImageOps

HERE = Path(__file__).resolve()
SHOP = Path(os.environ.get("SHOP_DIR") or HERE.parents[1])
CAR = Path(os.environ.get("CAROUSELS_DIR") or "/workspace/carousels")

FOLDER_DATE = re.compile(r"^(20\d{2})-(\d{2})-(\d{2})")
FOLDER_CAT = {
    "2026-11-22_tech": "gadgets",
    "2026-11-24_home": "kitchen",
    "bf2026_1": "car",
}
KEYWORD_CAT = [
    (r"רכב|מושב|אוורור|צמיג", "car"),
    (r"מטבח|ביצ|שמן|סיר|אייר|בלנדר|מקציף|כף מדידה|רשת נגד|תבלין|כיור", "kitchen"),
    (r"חתול|כלב|חיות", "pets"),
    (r"תספורת|עיסוי|טיפוח", "beauty"),
    (r"אוזנ|רכזת|מטען|כבל|סלפי|USB|גאדג|לפטופ|רמקול|בלוטוס|טלפון", "gadgets"),
    (r"מנורה|אור|שקיעה|גלקסיה|סבון|מקלחת|מוך|בקבוק חם|ארון", "home"),
    (r"ילד|צעצוע", "kids"),
    (r"כלי עבודה|מברג", "tools"),
]


def save_jpg(src, dest, max_side=800, quality=80):
    dest = Path(dest)
    dest.parent.mkdir(parents=True, exist_ok=True)
    im = Image.open(src)
    im = ImageOps.exif_transpose(im)
    if im.mode != "RGB":
        im = im.convert("RGB")
    w, h = im.size
    scale = max_side / max(w, h)
    if scale < 1:
        im = im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)
    im.save(dest, "JPEG", quality=quality, optimize=True, progressive=True)


def parse_products(text):
    blocks = re.split(r"\n\s*\n", text.strip())
    items = []
    for b in blocks[1:]:
        lines = [ln.strip() for ln in b.splitlines() if ln.strip()]
        if not lines:
            continue
        title = lines[0]
        price = orig = orders = rate = pid = link = None
        for ln in lines[1:]:
            m = re.search(r"מחיר נוכחי:\s*₪\s*([\d.]+)", ln)
            if m: price = float(m.group(1))
            m = re.search(r"לפני:\s*₪\s*([\d.]+)", ln)
            if m: orig = float(m.group(1))
            m = re.search(r"הזמנות:\s*([\d,]+)", ln)
            if m: orders = int(m.group(1).replace(",", ""))
            m = re.search(r"דירוג:\s*([\d.]+)", ln)
            if m: rate = float(m.group(1))
            m = re.search(r"מזהה:\s*(\d+)", ln)
            if m: pid = m.group(1)
            m = re.search(r"לינק אפיליאט:\s*(https://\S+)", ln)
            if m: link = m.group(1).rstrip(".,)")
        if title and price and link:
            disc = round((1 - price / orig) * 100) if orig and orig > price else None
            items.append({
                "id": pid, "raw_title": title, "price": price, "orig": orig,
                "discount": disc, "orders": orders or 0,
                "stars": round(rate / 20, 1) if rate else None, "link": link,
            })
    return items


def short_headline(caption_line, folder):
    line = caption_line.strip()
    line = re.sub(
        r"^([^\w\u0590-\u05FF]*)\s*מוצרים שהזמנתי מאלי אקספרס\s*",
        r"\1", line,
    ).strip()
    line = re.sub(r"^(\W+)(\S)", lambda m: m.group(1).replace(" ", "") + " " + m.group(2), line)
    if "חלק 2" in line and "·" not in line:
        line = line.replace("חלק 2", "· חלק 2")
    return line.strip()


def split_title_desc(title):
    m = re.match(r"^(.*?)\s*\((.+)\)\s*$", title.strip())
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return title.strip(), ""


def guess_cat(folder, title):
    if folder in FOLDER_CAT:
        return FOLDER_CAT[folder]
    for pat, cat in KEYWORD_CAT:
        if re.search(pat, title):
            return cat
    return "home"


def folder_date(name):
    m = FOLDER_DATE.match(name)
    if m:
        return f"{m.group(1)}-{m.group(2)}-{m.group(3)}", f"{int(m.group(3))}.{int(m.group(2))}"
    return None, None


def main():
    overrides = {}
    ovp = SHOP / "data" / "title_overrides.json"
    if ovp.exists():
        overrides = json.loads(ovp.read_text(encoding="utf-8"))

    groups = []
    skipped = []
    for d in sorted(CAR.iterdir()):
        if not d.is_dir() or not (d / "products.txt").exists():
            continue
        cap = (d / "caption.txt").read_text(encoding="utf-8").splitlines()[0] if (d / "caption.txt").exists() else d.name
        iso, label = folder_date(d.name)
        if not iso and d.name.startswith("bf"):
            label = "בלאק פריידיי"
        products = parse_products((d / "products.txt").read_text(encoding="utf-8"))
        imgs = sorted(d.glob("*_product.jpg"))
        out = []
        for i, p in enumerate(products):
            if "s.click.aliexpress.com" not in (p.get("link") or ""):
                skipped.append((d.name, p.get("id"), "not-s.click"))
                continue
            ov = overrides.get(p["id"]) or {}
            title = ov.get("title") or split_title_desc(p["raw_title"])[0]
            desc = ov.get("desc") or split_title_desc(p["raw_title"])[1]
            cat = ov.get("cat") or guess_cat(d.name, p["raw_title"])
            img_rel = None
            if i < len(imgs):
                img_rel = f"img/videos/{d.name}_{i}.jpg"
                save_jpg(imgs[i], SHOP / img_rel)
            out.append({
                "id": p["id"], "title": title, "desc": desc, "cat": cat,
                "price": p["price"], "orig": p["orig"], "discount": p["discount"],
                "orders": p["orders"], "stars": p["stars"],
                "image": img_rel, "link": p["link"],
            })
            if p["id"] not in overrides:
                overrides[p["id"]] = {"title": title, "desc": desc, "cat": cat}
        cover_rel = None
        if (d / "01_cover.jpg").exists():
            cover_rel = f"img/covers/{d.name}.jpg"
            save_jpg(d / "01_cover.jpg", SHOP / cover_rel, max_side=640, quality=78)
        groups.append({
            "id": d.name,
            "headline": short_headline(cap, d.name),
            "date": iso,
            "date_label": label,
            "cover": cover_rel,
            "products": out,
        })

    groups.sort(key=lambda g: g["date"] or "1970-01-01", reverse=True)
    (SHOP / "data").mkdir(exist_ok=True)
    payload = {
        "updated": datetime.now().strftime("%Y-%m-%d"),
        "groups": groups,
    }
    (SHOP / "data" / "videos.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    ovp.write_text(json.dumps(overrides, ensure_ascii=False, indent=2), encoding="utf-8")
    n = sum(len(g["products"]) for g in groups)
    print(f"videos.json: {len(groups)} groups, {n} products")
    if skipped:
        print("skipped (not s.click):", len(skipped))
        for s in skipped:
            print(" ", s)


if __name__ == "__main__":
    main()
