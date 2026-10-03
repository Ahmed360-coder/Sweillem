# Project world

A 3D yard with one stop for each thread of the sweillem.net rebuild. You walk through it in third person as a glazed SWEILLEM pipe or a clay roof tile, each with legs and arms. There are no game modes. It is published as a Claude artifact and is not part of the website build.

- Layout: the visitor yard with the stops is in the middle. The clay pipe factory and the roof tile factory stand side by side to the north, with loading docks at the back. A logistics road behind them leads north to the seaport and east to the air cargo airport.
- Both factories are large sawtooth-roof halls signed "SWEILLEM International Company" with the factory name over the door, an office block, silos and a full production line inside (hopper, press and robot, dryer, glaze booth, 20 m kiln with chimney and smoke, overhead crane, engineers). Every product is stamped SWEILLEM.
- Seaport: two berths with container ships, ship-to-shore cranes that load them with a terminal tractor, a container yard, an RTG crane, tugs and a lighthouse. Ships leave and come back.
- Airport: three four-engine SWEILLEM freighters at stands, each loaded by a high loader from a dolly train. They push back, taxi, take off, fly a circuit and land again.
- Trucks run from the factory docks to the port and the airport.
- Owner portrait: put a photo at `img/owner.webp` and it appears on both factory fronts. Without the file nothing is shown.
- Menu settings: character (pipe or tile in terracotta, blue, black), quality (Ultra, High, Smooth), time of day (Sunset, Day, Night) and sound.
- `index.html` is the page body (the artifact host adds the doctype and head). three.js r128 loads from cdnjs.
- `img/` holds the screenshots each stop shows, resized to webp.
- To add a stop, add an entry to `STATIONS` in `index.html` and its pictures to `img/`.
