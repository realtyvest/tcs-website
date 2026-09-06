# MAP_TO_INVOICE_PROGRESS_BAR_STORY_LOCK

Pattern A — sticky + progress bar. Parent on `main`: `fa7a6ab` (labels already
correct). REPLACES the pin-scrub PIN_HOLD path (`ea1f6a3`); pin is not iterated.
Scope: `#map-to-invoice` island only. WT / `#spine` / hamburger / footer
untouched. Panel art current (OK).

## Pattern A
1. **Short pin** of the island (bar + stage) via ScrollTrigger — end `"+=140%"`
   (~1.4 viewports TOTAL for the whole story). NOT the old `+=300%` pin-scrub.
2. **Top:** a 4-step workflow **progress bar** — the story driver. Track + fill
   grow left→right; dots go incomplete → active → complete (completed stay lit).
3. **Below:** one panel (image + one short title line) — the **active step only**.
4. **One `gsap.timeline()`** owns BOTH the bar fill/lights AND the panel swap, so
   they share a single playhead and can never desync. `scrub: 0.5` ties timeline
   progress to scroll. Panel swap is SEQUENTIAL (hide outgoing over `FADE`, THEN
   show incoming) so at most one panel title shows mid-scrub.
5. Lit step is derived from the playhead (`syncStep`) on every update AND at each
   swap point (`tl.call`) — reverse-scrub restores the prior step.
6. **CLEAR_STATE** (`onLeave` `settleFinal`): full bar lit + Invoice same day
   panel only. Fit Call button below stays usable (`pinSpacing: true`, short
   distance).
7. **Optional snap** on coarse (mobile) pointers: quarter midpoints
   `[0.125, 0.375, 0.625, 0.875]` (t = .5/1.5/2.5/3.5) so a rest lands cleanly
   inside one state.
8. **Reduced motion:** static full lit bar + Invoice panel, no pin.

## Time budget (JS)
`STEP_DUR = 1`, `FADE = 0.16`, `TOTAL = 4`. Four equal quarters: step 0 in
`[0,1)`, 1 in `[1,2)`, 2 in `[2,3)`, 3 (INVOICE) holds `[3,4]`. The fill tween
(`scaleX 0→1`, `duration 4`) is the longest child, so it fixes the timeline
length and guarantees the trailing INVOICE hold.

## Exact labels (kept)
1. Annotated map (MAP)
2. Tally = marks (TALLY)
3. Ready to bill (BILL)
4. Invoice same day (INVOICE)

Breadcrumb (chrome route): `MAP → TALLY → BILL → INVOICE`.
OUT: Packet ready, Closeout, Submit, Mark the map, Verified quantities,
Invoice items.

## Guardrails honored
- Pin-scrub (PIN_HOLD / `ea1f6a3`) removed, not iterated.
- No WT / `#spine` / hamburger / footer changes. Panel art unchanged.
- Cache-bust `map-to-invoice.js` + `.css` → `?v=bar1`.
- `node --check` passes on the JS.

## Cites
- Cheatsheet — https://gsap.com/cheatsheet
- GSAP core + Timeline — https://gsap.com/docs/v3/GSAP/Timeline
- ScrollTrigger — https://gsap.com/docs/v3/Plugins/ScrollTrigger/ · https://gsap.com/scroll/
- Skills: `gsap-core` + `gsap-timeline` + `gsap-scrolltrigger`

Parent: `fa7a6ab`.
