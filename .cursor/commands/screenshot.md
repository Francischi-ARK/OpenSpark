---
description: Screenshot a URL or document with pixelshot and read it visually
---

Screenshot and visually read: $ARGUMENTS

1. Ensure `pixelshot` is on PATH (`uv tool install pixelrag` if missing).
2. Run:
   ```bash
   pixelshot $ARGUMENTS --output /tmp/pixelbrowse --tile-height 1568 --wait-network-idle
   ```
3. Read `/tmp/pixelbrowse/<domain>.png.tiles/tile_0000.jpg` directly with the Read tool. Do not `ls`.
4. If text is too small, crop with Pillow:
   ```bash
   python3 -c "from PIL import Image; Image.open('<tile>').crop((x1,y1,x2,y2)).save('/tmp/pixelbrowse/crop.png')"
   ```
5. Report what you see.
