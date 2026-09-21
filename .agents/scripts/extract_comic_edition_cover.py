from pathlib import Path

import pymupdf


SOURCE = Path("attached_assets/bd_1789925584680.pdf")
OUTPUT = Path("artifacts/rgg-website/public/images/cover-english-comic.png")

document = pymupdf.open(SOURCE)
page = document[0]

# The uploaded artwork is a full print wrap. The front cover is the panel
# to the right of the spine, cropped just inside the outer bleed.
front_cover = page.get_pixmap(
    matrix=pymupdf.Matrix(3, 3),
    clip=pymupdf.Rect(718, 15, 1325, 960),
    alpha=False,
)
front_cover.save(OUTPUT)

print(f"Saved {OUTPUT} at {front_cover.width}x{front_cover.height}")