"""Rebuild sweillem-prototype.html from src.html and assets/*.webp|*.svg (images are inlined as data URIs)."""
import base64, json, pathlib
here = pathlib.Path(__file__).parent
MIME = {'.webp': 'image/webp', '.svg': 'image/svg+xml'}
imgs = {p.stem: f'data:{MIME[p.suffix]};base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((here / 'assets').iterdir()) if p.suffix in MIME}
src = (here / 'src.html').read_text()
(here / 'sweillem-prototype.html').write_text(src.replace('{{IMAGES}}', json.dumps(imgs)))
print('built', len(imgs), 'images')
