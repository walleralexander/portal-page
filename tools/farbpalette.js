#!/usr/bin/env node
// Erzeugt public/farbpalette.json (Farbname -> Hex) aus dem Verbindungsverzeichnis.
// Quelle: /workplace/vmcv-alleverbindungen/verbindungen.yaml (farbpalette).
// Aufruf: node tools/farbpalette.js [pfad/zu/verbindungen.yaml]
// Neu ausfuehren, wenn im Verzeichnis Farben dazukommen.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const src = process.argv[2] || '/workplace/vmcv-alleverbindungen/verbindungen.yaml';
const root = path.join(__dirname, '..');

// js-yaml ist als Browser-Bundle in public/vendor, kein npm noetig
const ctx = { window: {} };
ctx.window = ctx;
vm.runInNewContext(fs.readFileSync(path.join(root, 'public/vendor/js-yaml.min.js'), 'utf8'), ctx);

const data = ctx.jsyaml.load(fs.readFileSync(src, 'utf8'));
const palette = Object.fromEntries(
    Object.entries(data.farbpalette).sort().map(([name, v]) => [name, v.hex])
);
fs.writeFileSync(path.join(root, 'public/farbpalette.json'), JSON.stringify(palette, null, 2) + '\n');
console.log(`farbpalette.json: ${Object.keys(palette).length} Farben aus ${src}`);
