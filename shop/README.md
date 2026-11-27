# החנות של פיני

Static shop for GitHub Pages. Independent of the Telegram bot.

Live:
- Home: `https://galkrisi43-beep.github.io/tg/shop/`
- Videos (bio deep link): `https://galkrisi43-beep.github.io/tg/shop/videos.html`
  Also works: `?v=videos` or `#videos`

## Data

- `data/videos.json` — products from TikTok / carousel folders. Links are existing `s.click` affiliate URLs (tracking id `telegram`).
- `data/hot.json` — curated hot deals from our best-performing categories (car, kitchen, home, gadgets), high rating and order counts only.
- `data/title_overrides.json` — short Hebrew titles and descriptions; kept when ingest runs.

Every product shown has a short Hebrew title, a short description, an image, and an `s.click` affiliate link. Commission is never shown.

## Refresh

New carousels are picked up automatically by scanning `CAROUSELS_DIR`:

```
CAROUSELS_DIR=/workspace/carousels SHOP_DIR=/workspace/pinibot/shop \
  python3 scripts/ingest_videos.py
```

Then copy the `data/` and `img/videos/` (and covers) into this Pages folder and commit.

Hot deals (curated, not a raw dump):

```
PINIBOT_DIR=/workspace/pinibot SHOP_DIR=/workspace/pinibot/shop \
  python3 scripts/refresh_hot.py
```

`refresh_hot.py` should only keep items in car / kitchen / home / gadgets that meet the quality bar (rating, orders, discount), with hand-checked Hebrew titles.

A separate tracking id such as `store` is not created yet in the AliExpress portal (`store` / `bot` / `shop` are rejected by the API). Links currently use `telegram`. After Gal creates `store` in the portal, regenerate hot-deal links with that id; existing video links stay as they were created.

Do not add the Telegram menu button or change the TikTok bio until Gal reviews the test link.
