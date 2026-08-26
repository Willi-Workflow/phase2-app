#!/usr/bin/env python3
# Zählt die Bilder je Muster unter bilder/muster/ und schreibt das Ergebnis
# nach js/muster6-ansichten.js. Nach jeder Bildänderung einmal ausführen.
import json
import re
from pathlib import Path

hier = Path(__file__).parent
wurzel = hier / "bilder" / "muster"
zaehlung = {}
if wurzel.exists():
    for ordner in sorted(wurzel.iterdir()):
        if not ordner.is_dir():
            continue
        anzahl = len([d for d in ordner.iterdir() if re.fullmatch(r"\d+\.jpg", d.name)])
        if anzahl:
            zaehlung[ordner.name] = anzahl

inhalt = (
    "// Von zaehle-ansichten.py erzeugt: Bilderzahl je Muster unter\n"
    "// bilder/muster/<id>/. Nach jeder Bildänderung neu erzeugen.\n"
    f"export const ANSICHTEN = {json.dumps(zaehlung, indent=2)};\n"
)
(hier / "js" / "muster6-ansichten.js").write_text(inhalt)
print(f"{len(zaehlung)} Muster mit Bildern, {sum(zaehlung.values())} Bilder insgesamt")
