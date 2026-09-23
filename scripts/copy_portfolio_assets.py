from pathlib import Path
import shutil

source = Path(r"C:\Users\Administrator\Desktop\华\作品图")
destination = Path(__file__).resolve().parents[1] / "public" / "media" / "portfolio"
destination.mkdir(parents=True, exist_ok=True)

files = sorted(
    (path for path in source.iterdir() if path.suffix.lower() in {".jpg", ".jpeg", ".png"}),
    key=lambda path: path.name.casefold(),
)
rows = []
for index, path in enumerate(files, start=1):
    target_name = f"asset-{index:02d}{path.suffix.lower()}"
    shutil.copy2(path, destination / target_name)
    rows.append(f"{index:02d}\t{target_name}\t{path.name}")

print("\n".join(rows))
