# Project world

A 3D yard with one stop for each thread of the sweillem.net rebuild. You play in third person as a glazed SWEILLEM pipe or a clay roof tile. It is published as a Claude artifact and is not part of the website build.

- Two factories signed "SWEILLEM International Company": the clay pipe factory and the roof tile factory. Each has the production line inside (robot arms, engineers, kiln, smoke) with every product stamped SWEILLEM.
- Trucks carry the products from the factories to the port, where a crane loads a container ship, and to the airfield, where a cargo plane takes off.
- Menu settings: character (pipe or tile in terracotta, blue, black), quality (Ultra, High, Smooth), time of day (Sunset, Day, Night) and sound. Stamps collected at each stop are kept in the browser.
- `index.html` is the page body (the artifact host adds the doctype and head). three.js r128 loads from cdnjs.
- `img/` holds the screenshots each stop shows, resized to webp.
- To add a stop, add an entry to `STATIONS` in `index.html` and its pictures to `img/`.
