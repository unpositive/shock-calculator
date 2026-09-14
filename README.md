# Gas-dynamic calculator (shock waves · CJ detonation · deflagration)

Single-file web calculator (`index.html`, no dependencies) for the Rankine–Hugoniot layer of a
decision-support system for explosion protection:

1. Normal shock from `u1` (requires M1 > 1)
2. Normal shock from `p2/p1` (requires p2/p1 > 1)
3. Chapman–Jouguet detonation (closed form, `u2 = a2`)
4. Deflagration / overdriven detonation from a given front velocity `u1` — quadratic in `u2` solved
   directly, physical root = subsonic products (M2 < 1); the rejected root is shown
5. Combustion regime classification: weak deflagration / forbidden zone / CJ / overdriven detonation,
   with `u_CJ,def`, `D_CJ` and a p–v Hugoniot diagram
6. Mixture library (`mixtures_h2.csv` embedded) and batch tables reproducing the paper's Tables 1–3

Every result is checked against mass, momentum and energy conservation (residuals shown, ~1e-16).
UI: Ukrainian / English toggle.

## Source of truth

The physics core (`const gasdyn = …` block in `index.html`) mirrors `paper/results_table.py`.
`node test.js` re-runs the core headlessly and compares with the numbers in `paper/results.md`.

## Deploy

Static site — no build step. Netlify: connect this folder (base directory `calculator`, publish `.`),
or drag the folder onto https://app.netlify.com/drop.
