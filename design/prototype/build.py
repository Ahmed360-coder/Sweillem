"""Rebuild sweillem-prototype.html from src.html and assets/*.webp (images are inlined as data URIs)."""
import base64, json, pathlib
here = pathlib.Path(__file__).parent
imgs = {p.stem: 'data:image/webp;base64,' + base64.b64encode(p.read_bytes()).decode() for p in sorted((here / 'assets').glob('*.webp'))}
src = (here / 'src.html').read_text()
(here / 'sweillem-prototype.html').write_text(src.replace('{{IMAGES}}', json.dumps(imgs)))
print('built', len(imgs), 'images')
