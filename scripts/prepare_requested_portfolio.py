from pathlib import Path
import shutil
from PIL import Image, ImageOps

source = Path(r"C:\Users\Administrator\Desktop\华\作品图")
destination = Path(__file__).resolve().parents[1] / "public" / "media" / "portfolio"
destination.mkdir(parents=True, exist_ok=True)

names = [
    "微信图片_20260921153623_54_4.jpg", "2.jpg", "3.jpg",
    "ChatGPT Image 2026年8月12日 17_42_48.png", "5.jpg", "6.jpg",
    "ChatGPT Image 2026年9月22日 12_47_21.png", "untitled.35.jpg",
    "ChatGPT Image 2026年9月23日 12_28_42.png", "untitled.36.jpg",
    "untitled.43.jpg", "untitled.44.jpg", "黑皮诺最终.76.jpg",
    "黑皮诺最终.77.jpg", "黑皮诺最终.121.jpg",
    "可食用的艺术：豪士藜麦吐司-01.jpg", "可食用的艺术：豪士藜麦吐司-02.jpg",
    "可食用的艺术：豪士藜麦吐司-03.jpg", "牛肉干盒子.bip.84.jpg",
    "牛肉干盒子.bip.90.jpg", "微信图片_20260921153622_52_4.jpg",
    "微信图片_20260921153622_53_4.jpg", "1d4a5d1d-7c7e-45c4-ba4e-38a2220245ae.png",
    "ChatGPT Image 2026年9月21日 13_47_11.png",
    "ChatGPT Image 2026年9月22日 12_22_58.png",
    "ChatGPT Image 2026年9月22日 12_30_22.png",
    "ChatGPT Image 2026年9月22日 12_37_22.png", "牛肉干盒子.bip.89.jpg",
    "未命名-2026-0-1786546943941.png", "未命名-2026-0-1784082344609.png",
]

for index, name in enumerate(names, start=1):
    src = source / name
    if not src.exists():
        raise FileNotFoundError(src)
    target = destination / f"p{index:02d}{src.suffix.lower()}"
    shutil.copy2(src, target)
    with Image.open(src) as image:
        image = ImageOps.exif_transpose(image)
        image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
        for size, limit in [('thumb', 260), ('cover', 1100), ('detail', 2400)]:
            rendered = image.copy()
            rendered.thumbnail((limit, limit), Image.Resampling.LANCZOS)
            rendered.save(destination / f'p{index:02d}-{size}.webp', quality=88, method=4)

(destination / "requested-index.txt").write_text(
    "\n".join(f"p{index:02d}{Path(name).suffix.lower()}\t{name}" for index, name in enumerate(names, start=1)),
    encoding="utf-8",
)
print(f"copied {len(names)} requested images")
