from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
import zipfile

root = Path(__file__).resolve().parents[1]
out = root / 'public' / 'media'
out.mkdir(parents=True, exist_ok=True)
source = Path('C:/Users/Administrator/Desktop/华')
z = zipfile.ZipFile(source / '洪泽华简历_重排版.docx')
(out / 'portrait.png').write_bytes(z.read('word/media/image1.png'))
files = list((source / '作品图').glob('*'))
sheet = Image.new('RGB', (1000, ((len(files)+3)//4)*190), '#eee')
draw = ImageDraw.Draw(sheet)
for i, p in enumerate(files):
    im = Image.open(p).convert('RGB')
    im.thumbnail((240, 160))
    x, y = (i%4)*250, (i//4)*190
    sheet.paste(im, (x,y))
    draw.text((x+8,y+164), str(i)+' / '+p.stem.encode('ascii','ignore').decode()[:25],fill='black')
sheet.save(root/'asset-contact-sheet.jpg')
(root/'asset-index.txt').write_text('\n'.join(f'{i}: {p.name}' for i,p in enumerate(files)),encoding='utf-8')
