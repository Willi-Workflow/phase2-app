// Reine Pendelrechnung: Pendel mit bewegtem Aufhängepunkt, halbimplizit integriert.
// theta ist der physikalische Winkel gegen die Senkrechte (Bild-CSS-Winkel = -theta in Grad).

export const ANHEFT = { flugdauer: 500, bogen: 10, daempfung: 2.4, hebel: 0.71, schwere: 1.5 };

export function pendelGroessen(hoehePx, { hebel, schwere } = ANHEFT) {
  const pxProMeter = hoehePx / 0.30; // das Band entspricht etwa 30 cm Stoff
  return { g: 9.81 * pxProMeter * schwere, L: Math.max(40, hoehePx * hebel) };
}

export function pendelSchritt(zustand, { g, L, daempfung, ax = 0, ay = 0 }, dt, teilschritte = 4) {
  let { theta, thetaP } = zustand;
  const h = dt / teilschritte;
  for (let i = 0; i < teilschritte; i++) {
    const beschleunigung = -((g + ay) * Math.sin(theta) + ax * Math.cos(theta)) / L - daempfung * thetaP;
    thetaP += beschleunigung * h;
    theta += thetaP * h;
  }
  return { theta, thetaP };
}

export function istRuhig({ theta, thetaP }) {
  return Math.abs(theta) < 0.003 && Math.abs(thetaP) < 0.02;
}

// Glättung des Bahnfortschritts samt erster und zweiter Ableitung
export function glatt(s) {
  if (s < 0.5) return { e: 4 * s * s * s, e1: 12 * s * s, e2: 24 * s };
  const m = -2 * s + 2;
  return { e: 1 - (m * m * m) / 2, e1: 3 * m * m, e2: -12 * m };
}
