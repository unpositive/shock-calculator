// Headless check of the calculator core (run: node test.js).
// References: paper/mixtures_h2_v2.csv — equilibrium values computed with Cantera 3.2.0 on
// ohn.yaml (O/H/N submechanism of GRI-Mech 3.0); see paper/reference-data-methods.md.
const fs = require('fs');
const html = fs.readFileSync(__dirname + '/index.html', 'utf8');
const core = html.slice(html.indexOf('const gasdyn = (() => {'), html.indexOf('if (typeof module'));
const g = new Function(core + '; return gasdyn;')();
const mixText = html.slice(html.indexOf('let mixtures = ['), html.indexOf('];', html.indexOf('let mixtures = [')) + 2);
const mixtures = new Function(mixText + '; return mixtures;')();

let fail = 0;
const check = (name, cond) => { if (!cond) { fail++; console.log('FAIL', name); } };

check('library size', mixtures.length === 11);
for (const m of mixtures) {
  const {gamma1:g1, p1, rho1:r1, u1} = m;
  // --- detonation branch, detonation parameter set
  const cj = g.cjDetonation(g1, m.gamma2_det, p1, r1, m.q_det, m.R2_det);
  check(m.mix+' CJ ok', cj.ok);
  check(m.mix+' CJ residual', g.residuals(g1, m.gamma2_det, p1, r1, cj.u1, m.q_det, cj.p2, cj.r2, cj.u2).max < 1e-12);
  check(m.mix+' CJ sonic', Math.abs(cj.u2*cj.u2 - m.gamma2_det*cj.p2/cj.r2)/(cj.u2*cj.u2) < 1e-12);
  check(m.mix+' D vs equilibrium within 0.3%', Math.abs(cj.u1/m.D_CJ_eq - 1) < 0.003);
  check(m.mix+' p_CJ vs equilibrium within 7%', Math.abs(cj.p2/m.p_CJ_eq - 1) < 0.07);
  check(m.mix+' T_CJ vs equilibrium within 2%', Math.abs(cj.T2/m.T_CJ_eq - 1) < 0.02);
  // --- deflagration branch, deflagration parameter set
  const d = g.combustionFromU1(g1, m.gamma2_def, p1, r1, m.q_def, u1, m.R2_def);
  check(m.mix+' deflagration ok', d.ok);
  check(m.mix+' deflagration residual', g.residuals(g1, m.gamma2_def, p1, r1, u1, m.q_def, d.p2, d.r2, d.u2).max < 1e-10);
  check(m.mix+' subsonic products', d.M2 < 1);
  check(m.mix+' both roots u2>u1', d.u2 > u1 && d.root2.u2 > u1);
  check(m.mix+' rejected root unphysical', d.root2.p2 < 0 || d.root2.M2 > 1 || isNaN(d.root2.M2));
  check(m.mix+' delta vs equilibrium within 1%', Math.abs(d.delta/m.delta_eq - 1) < 0.01);
  check(m.mix+' T2 vs adiabatic flame within 0.5%', Math.abs(d.T2/m.T_ad - 1) < 0.005);
  check(m.mix+' pressure drop below 1%', d.p2/p1 > 0.98 && d.p2/p1 <= 1);
  // --- two-set regime classification
  const R = g.classify(m, u1);
  check(m.mix+' regime at S_L is weak deflagration', R.ok && R.kind === 'weak_def' && R.set === 'def');
  check(m.mix+' bounds ordered', R.uDef > u1 && R.uDef < R.cj.D);
  check(m.mix+' forbidden zone', g.classify(m, (R.uDef + R.cj.D)/2).kind === 'forbidden');
  check(m.mix+' CJ detonation point', g.classify(m, R.cj.D).kind === 'cj_det');
  check(m.mix+' overdriven detonation', g.classify(m, R.cj.D*1.3).kind === 'strong_det');
  check(m.mix+' overdriven products subsonic', g.classify(m, R.cj.D*1.3).state.M2 < 1);
}
// --- shock guards and a textbook shock
check('shock guard M1<=1', g.normalShockFromU1(1.4,101325,1.225,293,200).ok === false);
check('shock guard pr<=1', g.normalShockFromPr(1.4,101325,1.225,293,0.9).ok === false);
const s = g.normalShockFromU1(1.4,101325,1.225,293,680);
check('shock p2/p1', Math.abs(s.p2/101325 - 4.4919) < 1e-3);
check('shock M2<1', s.M2 < 1);

console.log(fail ? `${fail} check(s) failed` : `all checks passed (${mixtures.length} mixtures)`);
process.exit(fail ? 1 : 0);
