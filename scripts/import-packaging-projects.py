"""Create web-sized assets for the two supplied packaging projects."""
import argparse
import json
from pathlib import Path

from PIL import Image, ImageOps


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_root', type=Path, nargs='?', default=Path.home() / 'Desktop' / '华')
    args = parser.parse_args()
    groups = [
        ('wuliangye', '新建文件夹', ['1.jpg', '4.jpg', '3.jpg', '2.jpg', '5.jpg']),
        ('dairy', '新建文件夹 (2)', ['2.613.png', '3.614.png', '2.620.png', '4.628.jpg']),
    ]
    sources = [
        (f'{prefix}-{index:02d}', args.source_root / folder / name)
        for prefix, folder, names in groups
        for index, name in enumerate(names, start=1)
    ]
    for _, source in sources:
        if not source.is_file():
            raise FileNotFoundError(source)
    destination = Path(__file__).resolve().parents[1] / 'public' / 'media' / 'portfolio'
    destination.mkdir(parents=True, exist_ok=True)
    results = []
    for asset_id, source in sources:
        with Image.open(source) as original:
            profile = original.info.get('icc_profile')
            image = ImageOps.exif_transpose(original)
            image = image.convert('RGBA' if 'A' in image.getbands() else 'RGB')
            outputs = []
            for size, limit in [('thumb', 260), ('cover', 1100), ('detail', 2400)]:
                rendered = image.copy()
                rendered.thumbnail((limit, limit), Image.Resampling.LANCZOS)
                target = destination / f'{asset_id}-{size}.webp'
                options = {'quality': 88, 'method': 4}
                if profile:
                    options['icc_profile'] = profile
                rendered.save(target, **options)
                outputs.append({'file': target.name, 'dimensions': rendered.size, 'bytes': target.stat().st_size})
            results.append({'id': asset_id, 'source_bytes': source.stat().st_size, 'outputs': outputs})
    print(json.dumps(results, ensure_ascii=True, indent=2))


if __name__ == '__main__':
    main()
