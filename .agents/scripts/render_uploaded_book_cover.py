from pathlib import Path

import pymupdf


SOURCE = Path(
    "attached_assets/3FCA26B9B7E8595156358344E6C488A9_1789923374161.pdf"
)
OUTPUT = Path(".agents/outputs/uploaded-book-cover-page.png")
FRONT_COVER_OUTPUT = Path(
    "artifacts/rgg-website/public/images/cover-english-hardcover.png"
)

document = pymupdf.open(SOURCE)
page = document[0]
pixmap = page.get_pixmap(matrix=pymupdf.Matrix(2, 2), alpha=False)
pixmap.save(OUTPUT)

print(f"Rendered {OUTPUT} at {pixmap.width}x{pixmap.height}")

# The uploaded artwork is a full print wrap: back, spine, then front.
# Crop the front panel inside the outer bleed so cards show only the cover.
front_cover = page.get_pixmap(
    matrix=pymupdf.Matrix(3, 3),
    clip=pymupdf.Rect(724, 8, 1242, 851),
    alpha=False,
)
front_cover.save(FRONT_COVER_OUTPUT)

print(
    f"Saved front cover {FRONT_COVER_OUTPUT} "
    f"at {front_cover.width}x{front_cover.height}"
)