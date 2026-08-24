# Fremddateien

- `three.module.js` und `three.core.js`: three.js 0.180.0, MIT-Lizenz, bezogen am 24.08.2026 von
  https://unpkg.com/three@0.180.0/build/. Unverändert eingelegt, damit die App ohne Fremdserver läuft.
  `three.module.js` lädt `three.core.js` nach; beide Dateien gehören zusammen und müssen beide vorhanden sein.
  Nur `js/uebung1-lauf.js` führt sie ein.
- `three.core.js` wurde zusätzlich über den Spiegel https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.core.js
  bezogen und per sha256 byteidentisch gegen die unpkg-Fassung geprüft (eb077d24...).
- `GLTFLoader.js` und `BufferGeometryUtils.js`: three.js-Zusätze derselben Fassung 0.180.0, MIT-Lizenz,
  bezogen am 24.08.2026 von https://unpkg.com/three@0.180.0/examples/jsm/ (loaders beziehungsweise utils).
  Einzige Änderung: die Importpfade zeigen statt auf das Paket "three" auf `./three.module.js`
  beziehungsweise `./BufferGeometryUtils.js`, damit sie ohne Paketauflösung als einfache Module laufen.
  Nur `js/uebung1-lauf.js` führt den Lader ein; er lädt `modelle/flugzeug.glb`.
