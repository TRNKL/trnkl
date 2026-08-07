# Vendor-bestanden

Lokale kopieen van drie externe bestanden die eerder vanaf cdnjs.cloudflare.com
en cdn.jsdelivr.net werden geladen. Reden (7 augustus 2026): die verzoeken gaven
het IP-adres van elke bezoeker door aan een derde partij buiten de EU. Lokaal
gehost is trnkl.nl volledig first-party: geen enkel verzoek naar een ander domein.

| bestand | pakket | versie | licentie |
|---|---|---|---|
| d3-7.8.5.min.js | d3 (npm) | 7.8.5 | ISC, zie LICENSE-d3.txt |
| topojson-3.0.2.min.js | topojson (npm) | 3.0.2 | BSD-3-Clause, zie LICENSE-topojson.txt |
| world-atlas-2.0.2-countries-110m.json | world-atlas (npm) | 2.0.2 | ISC, zie LICENSE-world-atlas.txt |

Bijwerken: `npm pack <pakket>@<versie>`, uitpakken en het bestand uit `dist/`
hierheen kopieren onder dezelfde naam met het nieuwe versienummer, daarna de
verwijzingen in `flowcharts/flowtool-*.html` aanpassen.
