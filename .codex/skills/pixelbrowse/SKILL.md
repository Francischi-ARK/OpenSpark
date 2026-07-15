---
name: pixelbrowse
description: |
  Screenshot and visually read any web page or document using pixelshot.
  Use instead of fetching raw HTML when you need to see what a page looks like,
  read visual content (charts, diagrams, infographics), check layouts, or verify UI.
  Triggers: "look at this page", "screenshot", "what does this site look like",
  "check the UI", "read this visually", "view this URL", viewing web content,
  "pixelbrowse", "pixelshot".
---

# PixelBrowse — Screenshot-based Web Reading

Use `pixelshot` to capture any URL or document as tiled JPEG images, then read the images visually.

Requires the `pixelshot` command on `PATH`. If missing, install it first:

```bash
uv tool install pixelrag   # preferred (isolated, on PATH)
# or: pipx install pixelrag
# or: pip install pixelrag
```

Then retry. Don't hunt for it inside project venvs.

## How to use

```bash
# Screenshot a URL (optimized for vision: 1568px tile height)
pixelshot <url> --output /tmp/pixelbrowse --tile-height 1568 --wait-network-idle

# Multiple URLs in parallel
pixelshot <url1> <url2> --output /tmp/pixelbrowse --tile-height 1568 --wait-network-idle --workers 4

# Wider viewport for desktop layouts
pixelshot <url> --output /tmp/pixelbrowse --tile-height 1568 --viewport-width 1280 --wait-network-idle

# Render a PDF
pixelshot document.pdf --output /tmp/pixelbrowse
```

IMPORTANT: Always use `--tile-height 1568` for screenshots you will read visually.
Vision models downscale images with a long edge above ~1568–2576px. The default
8192px tile height gets downscaled and text becomes unreadable.

IMPORTANT: Always use `--wait-network-idle` for URLs. Without it, JavaScript-heavy
pages (most modern sites / SPAs) are captured before they finish rendering and
come back blank or half-empty.

## Workflow

1. Run `pixelshot <url> --output /tmp/pixelbrowse --tile-height 1568 --wait-network-idle`
2. Read `/tmp/pixelbrowse/<domain>.png.tiles/tile_0000.jpg` directly with the Read tool (no need to `ls` — naming is deterministic)
3. If the page is long, also read `tile_0001.jpg`, `tile_0002.jpg`, etc.

Output path pattern: `/tmp/pixelbrowse/<sanitized-url>.png.tiles/tile_NNNN.jpg`

- `https://news.ycombinator.com` → `/tmp/pixelbrowse/news.ycombinator.com.png.tiles/tile_0000.jpg`
- `https://example.com/page` → `/tmp/pixelbrowse/example.com_page.png.tiles/tile_0000.jpg`

Do NOT run `ls` first — just read `tile_0000.jpg`. If it doesn't exist, the page had no content.

## Crop & Zoom

If text or details are too small, crop the region of interest and re-read at full resolution.
Pillow ships with pixelshot:

```bash
python3 -c "from PIL import Image; Image.open('<tile_path>').crop((x1, y1, x2, y2)).save('/tmp/pixelbrowse/crop.png')"
```

- Coordinates are pixels from the top-left of the tile
- Crop to roughly 800×800 or smaller for maximum clarity
- Read the cropped image with the Read tool like any other image

## Tips

- `tile_0000.jpg` is the top of the page; higher numbers go down
- Use `--viewport-width 1280` for desktop layouts; default 875 suits articles/mobile width
- Supports URLs (`http`/`https`), local HTML, PDFs, and images
- Backends: `--backend cdp` (default, fastest) or `--backend playwright`
