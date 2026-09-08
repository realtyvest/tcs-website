---
name: design
description: "TCS website design and motion entry point. Use for any visual, layout, animation, scroll, 3D, or design-system work on telecomcontractorsolutions.com (this repo). Routes to the installed skills (genjutsu cast/paint/design-audit, design-dna, motion-design, official gsap-*, threejs-*, css-native, canvas-generative) and enforces the site's house rules: static HTML on Hostinger, GSAP 3.12.5 from CDN, per-section assets, tokens, reduced-motion, cache-bust, commit tags. Triggers: /design, redesign a section, add motion, animate, scroll effect, hero backdrop, 3D, make it feel alive, design audit, match this reference, extract style from screenshot."
---

# /design: TCS website design + motion

Single entry point for design work on this repo. It does not replace the installed skills; it decides which ones to load, then applies the site's non-negotiable conventions on top.

## 1. Read the site before proposing anything

- Global tokens live in `index.html` under `:root` (navy `#0B1829`, navy-mid, navy-light, electric `#2A8EFF`, orange `#F26419` is a marker color only, muted `#8CA3BE`, text-light `#C3D2E4`, border rgba white 0.08).
- Fonts: Barlow Condensed (display) and Barlow (body) via Google Fonts.
- Every section owns a pair in `assets/`: `<section>.css` and `<section>.js`. Section CSS declares prefixed vars that fall back to globals (`--pth-navy: var(--navy, #0B1829)`). Follow that pattern for new sections.
- Existing motion modules to study before adding more: `assets/paths.js` (Pattern A: progress bar + one timeline + short pin), `assets/map-to-invoice.js`, `assets/workflow-transformation.js`, `assets/phase2-motion.js` (once-enter rises), `assets/homepage-spine.js` (IntersectionObserver only).
- `components/WorkflowTransformation.tsx` is a React reference only. The live site is vanilla HTML, CSS, and IIFE JS. Do not introduce a build step.

## 2. Route to the right skills

Load the skills below with the Skill tool. Load the row that matches, not everything.

| Request | Load |
|---|---|
| New look for a section or page, art direction, palette, type pairing | `paint` (genjutsu pipeline), `ui-ux-pro-max` is loaded by it |
| Match a reference screenshot, image, or URL | `design-dna` (extract JSON DNA, then generate), then `paint` if implementing |
| Add motion, micro-interaction, wow-factor to an existing section | `cast` (thesis first), plus `motion-design` (timing, easing, choreography) and `motion-principles` |
| Any GSAP code | Official `gsap-core`, `gsap-timeline`, `gsap-scrolltrigger`, `gsap-performance`; `gsap-plugins` only if a plugin is truly needed; `gsap-utils` for clamp/mapRange/snap |
| Motion with zero dependencies | `css-native` (scroll-driven CSS, @starting-style, View Transitions) |
| Hero or backdrop in 3D | `threejs-fundamentals` first, then `threejs-materials`, `threejs-lighting`, `threejs-shaders`, `threejs-postprocessing` as needed. `threejs-r3f` is React only; not for the live site |
| Generative or particle backdrop | `canvas-generative` |
| Before shipping anything visual | `design-audit`, plus `mobile-principles` and `desktop-principles` |

`framer-motion` is installed but React only. Do not use it on the live site.

## 3. House rules (these win over anything a loaded skill suggests)

**Stack**
- Static site on Hostinger. No bundler, no npm in the site, no framework.
- GSAP 3.12.5 and ScrollTrigger load from jsdelivr in the page. Do not add other GSAP plugins or libraries without asking Gil first. Do not add Three.js or Lottie without asking; if approved, load from a pinned CDN URL.
- Vanilla IIFE modules: `(function () { "use strict"; ... })();` with `gsap.registerPlugin(ScrollTrigger)` inside.

**Motion**
- Animate transform and opacity only. No layout properties.
- Respect `prefers-reduced-motion: reduce`: render the final state statically, no pin, no scrub.
- Coarse pointers (mobile): no pin or scrub unless the existing Pattern A already does it; prefer once-enter reveals armed by a real scroll event so they fire where Gil can see them.
- One `gsap.timeline()` per section owns every coordinated element so nothing desyncs. Settle to a clean final state on leave.
- Section enter animation should be obvious: from `y: 40, autoAlpha: 0`, duration at least 0.55s, stagger at least 0.08, `power2.out`.

**Copy inside visuals**
- No em dashes anywhere. No dollar signs in step titles. No "Closeout" step title. The CTA is "Fit Call" only.
- No backend tool names (Airtable, Make, N8N, Clay, Instantly, HeyReach) in anything a prospect sees.
- Do not touch the hero headline, the JNA and AVCC testimonials, or the five-pain-point structure without Gil's explicit request.

**Shipping**
- Bump the `?v=` cache-bust on every CSS or JS file you change, in every HTML file that includes it.
- Run `node --check` on every JS file touched.
- Commit format: `type(scope): short summary (TAG_NAME)`, for example `feat(paths): step fly-in (PATH_STEP_FLY_IN_REVISE)`. Scopes in use: home, paths, m2i, wt, spine, nav, site, cache.
- `.claude/skills` and `skills-lock.json` are versioned with the site (commit them). Do not commit `claude-anim-fire.md` or `.DS_Store`.
- Do not touch the hamburger nav unless asked.

## 4. Workflow

1. Restate the scope in one line and confirm which page and section. Ask one question at a time if anything is unclear.
2. Read the tokens and the nearest existing module (section 1).
3. Load the matching skills (section 2). If `cast` or `paint` is loaded, follow its gates; when it offers a preview, default to an Artifact.
4. Implement in `assets/<section>.css` and `assets/<section>.js`, wire them into the page with a fresh `?v=`.
5. Verify: `node --check`, reduced-motion path, a coarse-pointer viewport, no em dashes in new copy (`grep -c $'\xe2\x80\x94'` should print 0).
6. Run `design-audit` on the result.
7. Commit with the format above and print the SHA. Push only if Gil asked.
