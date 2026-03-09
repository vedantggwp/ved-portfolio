---
phase: 4
slug: surface-layer
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 |
| **Config file** | playwright.config.ts |
| **Quick run command** | `npx playwright test tests/surface.spec.ts -x` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/surface.spec.ts -x`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 04-01-01 | 01 | 0 | SURF-01 | e2e stub | `npx playwright test tests/surface.spec.ts -g "provocation text visible" -x` | ❌ W0 | ⬜ pending |
| 04-01-02 | 01 | 0 | SURF-01 | e2e stub | `npx playwright test tests/surface.spec.ts -g "distinctive font" -x` | ❌ W0 | ⬜ pending |
| 04-01-03 | 01 | 0 | SURF-02 | e2e stub | `npx playwright test tests/surface.spec.ts -g "fade on scroll" -x` | ❌ W0 | ⬜ pending |
| 04-01-04 | 01 | 0 | SURF-03 | e2e stub | `npx playwright test tests/surface.spec.ts -g "no bio elements" -x` | ❌ W0 | ⬜ pending |
| 04-01-05 | 01 | 0 | A11Y-01 | e2e stub | `npx playwright test tests/surface.spec.ts -g "reduced motion" -x` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/surface.spec.ts` — stubs for SURF-01, SURF-02, SURF-03, A11Y-01
- [ ] No new framework install needed — Playwright already configured

*Existing infrastructure covers framework requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Text readability over monolith | SURF-01 | Subjective visual contrast assessment | 1. Load page 2. Verify warm ivory text is legible over dark monolith 3. Check text-shadow provides sufficient contrast |
| Parallax feels natural | SURF-02 | Subjective motion quality | 1. Scroll slowly through surface section 2. Verify text drift feels intentional, not jittery 3. Check no dropped frames in DevTools |
| Surface feels "intentionally sparse" | SURF-03 | Subjective design assessment | 1. Load page fresh 2. Assess if the surface communicates "lean in" not "here's my resume" |
| Font aesthetic match | SURF-01 | Subjective font selection | 1. View selected font at display size 2. Verify it matches precision/cinematic brief |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
