# Project world

A walkable 3D yard with one stop for each thread of the sweillem.net rebuild. It is published as a Claude artifact and is not part of the website build.

- `index.html` is the page body (the artifact host adds the doctype and head). three.js r128 loads from cdnjs.
- `img/` holds the screenshots each stop shows, resized to webp.
- To add a stop, add an entry to `STATIONS` in `index.html` and its pictures to `img/`.
