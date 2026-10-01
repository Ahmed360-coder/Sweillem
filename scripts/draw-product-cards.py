"""Draws the product card pictures that SWEILLEM has no drawing or photo for.

Each one is a schematic section in the style of the live site's own product
drawings (hatched clay, red seal), not to scale. Run from the repo root:
    python3 scripts/draw-product-cards.py public/images/products/cards
The four products with a live-site drawing use that drawing instead
(public/images/products/cards/*.webp, padded to 3:2).
"""
import math, os, sys
OUT = sys.argv[1]
FILL, HATCH, LINE, SEAL = "#efc397", "#c6a17e", "#70483a", "#d7262d"

def doc(title, body):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-50 0 900 600" role="img" aria-label="{title}">
<title>{title}</title>
<defs><pattern id="h" width="13" height="13" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="13" height="13" fill="{FILL}"/><line x1="0" y1="0" x2="0" y2="13" stroke="{HATCH}" stroke-width="3"/></pattern></defs>
<rect x="-50" width="900" height="600" fill="#fff"/>
<g stroke="{LINE}" stroke-width="4" stroke-linejoin="round" fill="url(#h)">
{body}
</g>
</svg>
'''

def P(pts):
    return "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

def cl(x1, y1, x2, y2):
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" fill="none" stroke-width="2" stroke-dasharray="26 7 4 7"/>'

def wall_half(L, r, t, socket=True, Ls=110, g=12, ts=22, sh=26):
    """Top wall of a pipe along +x from 0, axis y=0, outward = -y. Socket at x=0."""
    if socket:
        return P([(0, -(r+t+g+ts)), (Ls, -(r+t+g+ts)), (Ls+sh, -(r+t)), (L, -(r+t)), (L, -r),
                  (Ls, -r), (Ls, -(r+t+g)), (0, -(r+t+g))])
    return P([(0, -(r+t)), (L, -(r+t)), (L, -r), (0, -r)])

def seal(r, t, g=12, x=14, w=40):
    return f'<rect x="{x}" y="{-(r+t+g):.1f}" width="{w}" height="{g}" fill="{SEAL}" stroke-width="1.5"/>'

def pipe(L, r, t, socket=True):
    top = f'<path d="{wall_half(L, r, t, socket)}"/>' + (seal(r, t) if socket else "")
    return f'<g>{top}</g><g transform="scale(1,-1)">{top}</g>'

def at(x, y, inner, rot=0):
    return f'<g transform="translate({x},{y}) rotate({rot})">{inner}</g>'

out = {}

# Pipes: long pipe, socket left
r, t = 110, 34
out["pipes"] = doc("Vitrified clay pipe in section, socket end on the left",
    at(30, 300, pipe(740, r, t) + cl(-10, 0, 730, 0)))

# Short pieces: same section, short length, centred
out["short-pieces"] = doc("Short piece in section: a short length of pipe with a socket",
    at(200, 300, pipe(400, r, t) + cl(-10, 0, 410, 0)))

# Bends: socket straight, then 45 degree arc turning up
def bend():
    r, t, Ls, g, ts, sh = 92, 32, 120, 12, 22, 26
    Rb = 330; ang = math.radians(45)
    s = []
    # socket + short straight, top and bottom
    x2 = Ls + sh + 20
    for sgn in (-1, 1):
        s.append(f'<path d="{P([(0, sgn*(r+t+g+ts)), (Ls, sgn*(r+t+g+ts)), (Ls+sh, sgn*(r+t)), (x2, sgn*(r+t)), (x2, sgn*r), (Ls, sgn*r), (Ls, sgn*(r+t+g)), (0, sgn*(r+t+g))])}"/>')
        s.append(f'<rect x="14" y="{(-(r+t+g) if sgn<0 else r+t):.1f}" width="40" height="{g}" fill="{SEAL}" stroke-width="1.5"/>')
    # arc centre above
    cx, cy = x2, -Rb
    def ring(r1, r2):
        p = lambda R, a: (cx + R*math.sin(a), cy + R*math.cos(a))
        a0, a1 = 0, ang
        (x0, y0), (x1, y1) = p(r1, a0), p(r1, a1)
        (x3, y3), (x4, y4) = p(r2, a1), p(r2, a0)
        return f'<path d="M{x0:.1f} {y0:.1f} A{r1} {r1} 0 0 0 {x1:.1f} {y1:.1f} L{x3:.1f} {y3:.1f} A{r2} {r2} 0 0 1 {x4:.1f} {y4:.1f} Z"/>'
    s.append(ring(Rb - r - t, Rb - r))
    s.append(ring(Rb + r, Rb + r + t))
    # centre line arc
    ex, ey = cx + Rb*math.sin(ang), cy + Rb*math.cos(ang)
    s.append(f'<path d="M-10 0 L{x2} 0 A{Rb} {Rb} 0 0 0 {ex:.1f} {ey:.1f}" fill="none" stroke-width="2" stroke-dasharray="26 7 4 7"/>')
    return "".join(s)
out["bends"] = doc("Bend in section: a socket end and a 45 degree curve", at(70, 395, bend()))

# Junctions: main pipe with a 45 degree branch
def junction():
    r, t, L, bx, br, Lb = 78, 30, 680, 300, 62, 400
    k = math.sqrt(2)
    s = [f'<clipPath id="above"><rect x="-100" y="-600" width="1000" height="{600-(r+t)}"/></clipPath>']
    bt = f'<path d="{wall_half(Lb, br, t)}"/>' + seal(br, t)
    bb = f'<g transform="scale(1,-1)">{bt}</g>'
    s.append(f'<g clip-path="url(#above)"><g transform="translate({bx},0) rotate(-45) translate({Lb},0) scale(-1,1)">{bt}{bb}</g></g>')
    s.append(f'<g transform="scale(1,-1)"><path d="{wall_half(L, r, t)}"/>{seal(r, t)}</g>')
    xL, xLi = bx + (r+t) - k*br, bx + r - k*br
    xR, xRi = bx + (r+t) + k*br, bx + r + k*br
    s.append(f'<path d="{P([(0, -(r+t+12+22)), (110, -(r+t+12+22)), (136, -(r+t)), (xL, -(r+t)), (xLi, -r), (110, -r), (110, -(r+t+12)), (0, -(r+t+12))])}"/>{seal(r, t)}')
    s.append(f'<path d="{P([(xR, -(r+t)), (L, -(r+t)), (L, -r), (xRi, -r)])}"/>')
    s.append(cl(-10, 0, L+10, 0))
    s.append(f'<g transform="translate({bx},0) rotate(-45)">{cl(0, 0, Lb+10, 0)}</g>')
    return "".join(s)
out["junctions"] = doc("Junction in section: a main pipe with a 45 degree branch", at(60, 430, junction()))

# Jointing systems: spigot home in socket with seal, close-up
def joint():
    r, t, g, ts, Ls = 120, 36, 20, 32, 230
    s = []
    for sgn in (-1, 1):
        s.append(f'<path d="{P([(0, sgn*(r+t+g+ts)), (Ls, sgn*(r+t+g+ts)), (Ls+36, sgn*(r+t)), (440, sgn*(r+t)), (440, sgn*r), (Ls, sgn*r), (Ls, sgn*(r+t+g)), (0, sgn*(r+t+g))])}"/>')
        s.append(f'<path d="{P([(-340, sgn*(r+t)), (Ls-10, sgn*(r+t)), (Ls-10, sgn*r), (-340, sgn*r)])}"/>')
        y = -(r+t+g) if sgn < 0 else r+t
        s.append(f'<rect x="36" y="{y:.1f}" width="140" height="{g}" fill="{SEAL}" stroke-width="2"/>')
    s.append(cl(-350, 0, 450, 0))
    return "".join(s)
out["jointing-systems"] = doc("Joint in section: a spigot pushed home into a socket, sealed by a polyurethane ring", at(350, 300, joint()))

# Input clutch & end plugs: socket end closed by a plug
def plug():
    r, t, g, ts, Ls = 120, 36, 16, 30, 170
    s = []
    for sgn in (-1, 1):
        s.append(f'<path d="{P([(0, sgn*(r+t+g+ts)), (Ls, sgn*(r+t+g+ts)), (Ls+30, sgn*(r+t)), (420, sgn*(r+t)), (420, sgn*r), (Ls, sgn*r), (Ls, sgn*(r+t+g)), (0, sgn*(r+t+g))])}"/>')
    # plug: disc with a shoulder, sitting in the socket
    pr = r + t + 1
    s.append(f'<path d="{P([(-34, -(pr+g+ts-6)), (12, -(pr+g+ts-6)), (12, -pr), (Ls-10, -pr), (Ls-10, pr), (12, pr), (12, pr+g+ts-6), (-34, pr+g+ts-6)])}"/>')
    for sgn in (-1, 1):
        y = -(r+t+g) if sgn < 0 else r+t
        s.append(f'<rect x="30" y="{y:.1f}" width="90" height="{g}" fill="{SEAL}" stroke-width="1.5"/>')
    s.append(cl(-60, 0, 430, 0))
    return "".join(s)
out["input-clutch-end-plugs"] = doc("End plug in section: a clay plug sealed into the socket end of a pipe", at(250, 300, plug()))

os.makedirs(OUT, exist_ok=True)
for k, v in out.items():
    open(os.path.join(OUT, f"{k}.svg"), "w").write(v)
print(list(out))
