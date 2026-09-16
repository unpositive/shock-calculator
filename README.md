# Gas-dynamic calculator: shock waves · CJ detonation · deflagration

A verified, dependency-free web calculator for the Rankine–Hugoniot layer of a decision-support
system for explosion protection (combustion and detonation regimes of gas mixtures).

Source: https://github.com/unpositive/shock-calculator · Live: https://lysevych-calculator.netlify.app · UI: Ukrainian / English

## What it computes

| Tab | Input | Output |
|---|---|---|
| 1 Normal shock (u₁) | γ, p₁, ρ₁, T₁, u₁ | p₂, ρ₂, T₂, u₂, M₁, M₂ — requires M₁ > 1 |
| 2 Normal shock (p₂/p₁) | γ, p₁, ρ₁, T₁, p₂/p₁ | M₁, u₁, u₂, ρ₂, T₂, M₂ — requires p₂/p₁ > 1 |
| 3 CJ detonation | γ₁, γ₂, p₁, ρ₁, q, R₂ (detonation set) | D_CJ, p₂, ρ₂, T₂, u₂ = a₂ (closed form) |
| 4 Deflagration | γ₁, γ₂, p₁, ρ₁, q, u₁, R₂ (deflagration set) | u₂, δ = u₂/u₁ = ρ₁/ρ₂, p₂, ρ₂, T₂, M₂; the rejected second root |
| 5 Combustion regime | mixture + u₁, both parameter sets | weak deflagration / forbidden zone / CJ / overdriven detonation, u_CJ,def, D_CJ, p–v Hugoniot diagram |
| Mixtures & tables | embedded `mixtures_h2_v2.csv` (H₂/O₂, H₂/air) | Tables 1–3 of the paper with the equilibrium reference, Markdown/CSV export |

Every state is checked against mass, momentum and energy conservation; residuals (~10⁻¹⁶) are shown
next to the results, plus the sonic condition u₂² = γ₂p₂/ρ₂ for the CJ mode.

## Model, parameters and accuracy

One-dimensional stationary front, ideal gas, constant γ₁ (reactants) and γ₂ (products), heat release q.

The product parameters are not tabulated "effective" values: with q = h₁(T₁) − h₂(T₁) taken at the
equilibrium composition of the target state, the effective product heat capacity follows from the
enthalpy balance, c_p2 = [c_p1(T₁)·T₁ + h₂(T₂) − h₂(T₁)]/T₂, and γ₂ = c_p2/(c_p2 − R₂). The two
branches end at very different temperatures, so every mixture carries **two sets** of (q, γ₂, R₂):
from the constant-pressure flame state for deflagration, from the equilibrium CJ state for detonation.
Both are computed offline once (Cantera 3.2.0, `ohn.yaml` — the O/H/N submechanism of GRI-Mech 3.0);
at run time only closed-form algebra is evaluated.

With these parameters the closed form reproduces the equilibrium detonation velocity within 0.25 %,
the expansion ratio within 0.5 % and the deflagration product temperature within 0.1 %; the CJ
pressure is underestimated by 3–6 %. Fed instead with the lower heating value and a hand-picked γ₂,
the same formula misses the detonation velocity by up to 28 %.

The deflagration branch is solved directly from the quadratic in u₂; p₂ and ρ₂ follow from the
conservation laws. This avoids three errors found in the closed-form expressions of the source appendix:
a wrong coefficient in the explicit discriminant, the root-selection rule “u₂ > u₁” (both roots satisfy
it — the physical root is the one with subsonic products, M₂ < 1), and CJ-only pressure relations
applied to deflagration. Details are on the “About the model” tab.

## Structure and tests

- `index.html` — the whole application. The physics core is the `const gasdyn = …` block at the top
  of the script; the UI code follows the `UI` marker.
- `test.js` — headless check of the core (`node test.js`): conservation residuals, CJ sonic condition,
  regime classification, shock guards, and reference numbers from the paper's result tables.
- `netlify.toml` — static deploy config (no build step).

## Deploy

Static site. Netlify continuous deploy is configured from this repository (build command empty,
publish directory `.`); every push to `main` redeploys. Manual alternative: drag the folder onto
https://app.netlify.com/drop.

## Authors and license

Anton Lysevych (calculator, verification) with Viktor E. Volkov (scientific supervision).
MIT License — see `LICENSE`.
