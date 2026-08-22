import { test } from "node:test";
import assert from "node:assert/strict";
import { pendelSchritt, pendelGroessen, istRuhig, glatt } from "../js/pendel.js";

const groessen = { ...pendelGroessen(460), daempfung: 2.4 };

test("freies Pendel klingt zur Senkrechten ab", () => {
  let z = { theta: 0.3, thetaP: 0 };
  for (let t = 0; t < 5; t += 0.016) z = pendelSchritt(z, groessen, 0.016);
  assert.ok(istRuhig(z), `nicht ruhig: ${JSON.stringify(z)}`);
});

test("Beschleunigung des Hakens nach rechts lässt das Band nach links zurückhängen", () => {
  let z = { theta: 0, thetaP: 0 };
  for (let t = 0; t < 0.2; t += 0.016) z = pendelSchritt(z, { ...groessen, ax: 3000 }, 0.016);
  assert.ok(z.theta < -0.01, `theta: ${z.theta}`); // physikalisch negativ = Unterkante nach links
});

test("Glättung beginnt und endet in Ruhe", () => {
  assert.equal(glatt(0).e, 0);
  assert.equal(glatt(1).e, 1);
  assert.equal(glatt(0).e1, 0);
  assert.equal(glatt(1).e1, 0);
});
