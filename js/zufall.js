// Mischen mit einspeisbarem Zufall, geteilt von den Übungen.
export function mische(feld, rnd = Math.random) {
  const kopie = [...feld];
  for (let i = kopie.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [kopie[i], kopie[j]] = [kopie[j], kopie[i]];
  }
  return kopie;
}
