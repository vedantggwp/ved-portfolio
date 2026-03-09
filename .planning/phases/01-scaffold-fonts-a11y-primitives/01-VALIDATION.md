---
phase: 1
slug: scaffold-fonts-a11y-primitives
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-09
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (latest) |
| **Config file** | none — Wave 0 installs |
| **Quick run command** | `npx playwright test --grep @smoke` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test --grep @smoke`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-01-01 | 01 | 1 | FOUND-01 | smoke | `npx playwright test tests/scaffold.spec.ts --grep "dark background and fonts"` | ❌ W0 | ⬜ pending |
| 01-01-02 | 01 | 1 | FOUND-06 | smoke | `npx playwright test tests/scaffold.spec.ts --grep "SSR safe"` | ❌ W0 | ⬜ pending |
| 01-02-01 | 02 | 1 | FOUND-05 | e2e | `npx playwright test tests/a11y.spec.ts --grep "reduced motion"` | ❌ W0 | ⬜ pending |
| 01-02-02 | 02 | 1 | A11Y-01 | e2e | `npx playwright test tests/a11y.spec.ts --grep "no animations"` | ❌ W0 | ⬜ pending |
| 01-02-03 | 02 | 1 | A11Y-02 | e2e | `npx playwright test tests/a11y.spec.ts --grep "keyboard navigation"` | ❌ W0 | ⬜ pending |
| 01-02-04 | 02 | 1 | A11Y-03 | e2e | `npx playwright test tests/a11y.spec.ts --grep "ARIA landmarks"` | ❌ W0 | ⬜ pending |
| 01-02-05 | 02 | 1 | A11Y-04 | e2e | `npx playwright test tests/a11y.spec.ts --grep "skip links"` | ❌ W0 | ⬜ pending |
| 01-02-06 | 02 | 1 | A11Y-05 | manual | Axe/Lighthouse audit | N/A | ⬜ pending |
| 01-02-07 | 02 | 1 | A11Y-06 | e2e | `npx playwright test tests/a11y.spec.ts --grep "focus styles"` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `playwright.config.ts` — Playwright configuration
- [ ] `tests/scaffold.spec.ts` — stubs for FOUND-01, FOUND-06
- [ ] `tests/a11y.spec.ts` — stubs for FOUND-05, A11Y-01 through A11Y-06
- [ ] `npm init playwright@latest` — Playwright not yet installed

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| All text passes WCAG AA contrast | A11Y-05 | Contrast depends on rendered colors, best verified with Axe/Lighthouse | Run Lighthouse accessibility audit, verify all contrast ratios ≥ 4.5:1 for normal text |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
