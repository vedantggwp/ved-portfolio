---
phase: 03
slug: r3f-canvas-monolith-foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 03 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/r3f.spec.ts --project=chromium` |
| **Full suite command** | `npx playwright test --project=chromium` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/r3f.spec.ts --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 03-01-01 | 01 | 1 | FOUND-04 | e2e | `npx playwright test tests/r3f.spec.ts -g "canvas behind DOM" -x` | ❌ W0 | ⬜ pending |
| 03-01-02 | 01 | 1 | MONO-06 | e2e | `npx playwright test tests/r3f.spec.ts -g "lighting" -x` | ❌ W0 | ⬜ pending |
| 03-02-01 | 02 | 2 | MONO-01 | e2e (visual) | `npx playwright test tests/r3f.spec.ts -g "monolith visible" -x` | ❌ W0 | ⬜ pending |
| 03-02-02 | 02 | 2 | MONO-02 | e2e | `npx playwright test tests/r3f.spec.ts -g "scroll morph" -x` | ❌ W0 | ⬜ pending |
| 03-02-03 | 02 | 2 | MONO-03 | manual | Visual inspection | N/A | ⬜ pending |
| 03-02-04 | 02 | 2 | MONO-04 | e2e (screenshot) | `npx playwright test tests/r3f.spec.ts -g "fresnel glow" -x` | ❌ W0 | ⬜ pending |
| 03-02-05 | 02 | 2 | MONO-05 | manual | Subjective visual quality | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/r3f.spec.ts` — stubs for FOUND-04, MONO-01, MONO-02, MONO-04, MONO-06
- [ ] Tests verify: canvas element with correct z-index/positioning, WebGL context active, scroll triggers uniform changes (via exposed debug values on window)

*Note: Existing Playwright + scroll test infrastructure from Phase 2 covers framework install.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Imperceptible rotation | MONO-03 | Rotation too slow for automated detection | Observe monolith for 30s — should rotate almost imperceptibly |
| Final form suggests hidden geometry | MONO-05 | Subjective visual quality | Scroll to bottom — monolith should look complex but never "complete" |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
