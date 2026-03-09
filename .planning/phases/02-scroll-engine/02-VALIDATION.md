---
phase: 2
slug: scroll-engine
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright 1.58.2 |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test tests/scroll.spec.ts --project=chromium` |
| **Full suite command** | `npx playwright test --project=chromium` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test tests/scroll.spec.ts --project=chromium`
- **After every plan wave:** Run `npx playwright test --project=chromium`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 02-01-01 | 01 | 1 | FOUND-02 | e2e | `npx playwright test tests/scroll.spec.ts -g "smooth scroll" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-01-02 | 01 | 1 | FOUND-03 | e2e | `npx playwright test tests/scroll.spec.ts -g "no rerender" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-01-03 | 01 | 1 | SCRL-01 | e2e | `npx playwright test tests/scroll.spec.ts -g "section order" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-01-04 | 01 | 1 | SCRL-02 | e2e | `npx playwright test tests/scroll.spec.ts -g "progress" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-01-05 | 01 | 1 | SCRL-03 | e2e | `npx playwright test tests/scroll.spec.ts -g "pin" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-02-01 | 02 | 2 | SCRL-04 | e2e | `npx playwright test tests/scroll.spec.ts -g "variable" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-02-02 | 02 | 2 | SCRL-05 | e2e | `npx playwright test tests/scroll.spec.ts -g "membrane" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-02-03 | 02 | 2 | PERF-02 | e2e | `npx playwright test tests/scroll.spec.ts -g "lazy" --project=chromium` | ❌ W0 | ⬜ pending |
| 02-02-04 | 02 | 2 | PERF-03 | manual-only | N/A — requires R3F Canvas (Phase 3) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/scroll.spec.ts` — e2e stubs for FOUND-02, FOUND-03, SCRL-01 through SCRL-05, PERF-02
- [ ] Test helpers for programmatic scroll simulation (`page.mouse.wheel()`, `page.evaluate(() => window.scrollTo())`)
- [ ] Playwright installed and configured (verify `playwright.config.ts` exists)

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Adaptive DPR via PerformanceMonitor | PERF-03 | Requires R3F Canvas (Phase 3) | Deferred — verify in Phase 3 after R3F integration |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
