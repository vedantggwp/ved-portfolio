# Feature Research

**Domain:** 3D Scrollytelling Developer Portfolio
**Researched:** 2026-03-08
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features visitors (recruiters, collaborators, founders) assume exist. Missing these = they leave or question competence.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Fast initial load (<3s) | Visitors bounce after 3s. A slow 3D site signals poor engineering, not ambition. | MEDIUM | Use code-splitting, lazy R3F canvas mount, compressed assets. Skeleton/loading state while WebGL initializes. |
| Mobile responsiveness | 50%+ of recruiter traffic is mobile. Broken mobile = instant disqualification. | HIGH | Not just responsive layout -- need a deliberate 2D CSS parallax fallback for mobile/low-GPU devices. R3F canvas should not load on mobile at all. |
| Smooth 60fps scroll on desktop | Janky scroll on a "premium" site destroys credibility. The scroll IS the product. | HIGH | Lenis + GSAP ScrollTrigger + mutable scroll store (never React state for animation values). Budget GPU time carefully. |
| Clear project showcases | Recruiters need to see what you built, why, and the outcome. 84% want working demos. | LOW | 3-5 projects with context (problem, approach, outcome), links to live demos/repos. Quality over quantity. |
| Contact information / CTA | Visitors who reach the end must be able to act. No contact = wasted impression. | LOW | Email link at the "floor" layer. No contact form (spam magnet). LinkedIn link optional. |
| prefers-reduced-motion support | WCAG 2.1 SC 2.3.3 requires it. Ved's portfolio promotes an accessibility product (NeuroEdge) -- hypocrisy to skip this. | MEDIUM | Disable all parallax, scroll-linked animations, and 3D transitions. Show static, well-designed version. Not a degraded experience -- a designed alternative. |
| Keyboard navigation | WCAG AA requirement. Screen reader users and power users expect it. | MEDIUM | Focus management across scroll sections, skip-to-content link, visible focus indicators, ARIA landmarks. |
| Screen reader compatibility | Accessibility product builder must have accessible portfolio. | MEDIUM | Semantic HTML for all content sections. ARIA labels on interactive 3D elements. Alt text strategy for visual-only content. |
| HTTPS + custom domain | Bare minimum professionalism signal. | LOW | Vercel handles this automatically. |
| Performant typography loading | FOUT/FOIT destroys first impression on a typography-heavy design. | LOW | Preload DM Serif Display + Inter. Use font-display: swap with size-adjust fallbacks. |

### Differentiators (Competitive Advantage)

Features that make visitors remember Ved's portfolio over the 100 others they saw this week.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Evolving 3D monolith as visual throughline | Creates a narrative arc visitors can feel. The monolith morphing from abstract to complex across sections proves "layered thinking" without saying it. No other portfolio does this. | HIGH | Custom GLSL vertex/fragment shaders. Morph progress tied to scroll position via uniforms. Noise-driven organic deformation. This is the hero differentiator -- invest heavily. |
| Depth-based scroll navigation | "Surface to floor" metaphor replaces generic top-to-bottom scroll. Creates the "slow down and explore" feeling. Maps to Ved's personality (layered, deep). | HIGH | Four conceptual layers (surface, mid-depth, deep, floor) with distinct visual treatments. Each layer transition has a "pressure change" -- ambient light shift, scroll resistance change, subtle audio cue. |
| Variable scroll physics per section | Each domain (strategy, AI, accessibility, dev) has its own "weight". Fluid sections scroll fast, dense sections resist. Visitors feel the content before reading it. | HIGH | GSAP ScrollTrigger with dynamic scrub values. Lenis velocity modulation per section. Subtle but impactful -- most visitors won't consciously notice but will feel it. |
| Scroll-reactive audio layer | Atmospheric synthesis that responds to scroll depth and velocity. Johannsson-inspired drones, not UI sound effects. Makes the experience immersive and cinematic. | HIGH | Tone.js oscillators + filters modulated by scroll position. Start muted. Invitation model: pulsing waveform icon that invites activation. Never autoplay. Audio enhances but is never required. |
| Cinematic lighting system | Warm amber key light that shifts across sections. Villeneuve-inspired lighting creates mood without being decorative. Every light change has narrative purpose. | MEDIUM | R3F lighting setup with scroll-driven color temperature and intensity shifts. Subtle enough to feel natural, distinct enough to mark section transitions. |
| Project-as-discovery framing | Projects aren't portfolio cards -- they're "discoveries" revealed through depth navigation. Visitors feel like they're uncovering work, not scrolling a list. | MEDIUM | Content design + reveal animations. Each project emerges from the depth layer with context about why it exists, not just what it does. |
| Deliberate mobile experience (not degraded) | Most 3D portfolios break on mobile or show a sad fallback. Ved's mobile version should be a consciously designed 2D parallax experience that still communicates depth and personality. | HIGH | Separate CSS parallax implementation with layered imagery, scroll-linked opacity/transform. Same content hierarchy, different execution. Not "sorry, use desktop." |
| Provocation text on surface layer | Opening with something uniquely Ved ("I don't build what's expected") instead of "Hi, I'm Ved, a full-stack developer." Hooks attention through confidence, not credentials. | LOW | Copywriting challenge, not a technical one. Must be authentic, not try-hard. Iterate during build, not bolted on at end. |
| Contact floor with earned intimacy | "You've gone deep. Most people don't." -- rewards visitors who scrolled the full journey. Creates emotional resonance at the conversion moment. | LOW | Copy + visual treatment at the final section. The depth metaphor pays off here. Simple but effective. |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but actively harm this specific portfolio.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Dark/light theme toggle | "Every modern site has one" | The site IS the dark theme. The warm-black-to-amber palette is the identity. A light mode would require re-designing every 3D lighting setup, shader, and visual treatment. It dilutes the cinematic atmosphere. | Commit fully to the dark palette. The design is the brand. |
| Tech stack badges/icons | "Show what you know" | Generic, overused, and tells recruiters nothing about capability. Every junior dev has React/Node badges. They signal "I follow templates" not "I think differently." | Demonstrate stack mastery through the site itself. The portfolio running on R3F + custom shaders IS the proof. |
| Blog/writing section | "Content builds authority" | Scope creep. A blog needs ongoing maintenance, dilutes the portfolio's single-purpose impact, and fights the narrative structure. | Link to external writing (Medium, dev.to) if needed. The portfolio is for impression, not content. |
| Particle effects / constellation backgrounds | "They look cool" | Overused in developer portfolios to the point of cliche. They signal "I followed a Three.js tutorial" not "I think about design." | The monolith IS the 3D element. One strong, evolving visual beats a thousand particles. |
| Loading screen with percentage | "Shows the site is doing something" | Draws attention to load time instead of managing it. Users don't care about your asset pipeline. | Fast initial paint with progressive enhancement. Show content immediately, load 3D in background. Skeleton states, not spinners. |
| Scroll hijacking (full-page snap sections) | "Creates a presentation feel" | Users hate losing scroll control. Accessibility nightmare. Breaks native scroll on mobile. Feels aggressive, not inviting. | Variable scroll physics (resistance, not hijacking). Guide the pace, don't steal the wheel. Lenis smooth scroll preserves user agency. |
| Cursor effects / custom cursor | "Interactive and unique" | Distracting, breaks accessibility (cursor is an OS-level affordance), doesn't work on touch devices, adds complexity for zero content value. | Let the 3D environment be the interactive element. The monolith responds to scroll, not cursor. |
| Project filtering/search/tags | "Let users find what they want" | This isn't a catalog. 3-5 curated projects don't need filtering. Adding it implies there's more content than there is and breaks the narrative flow. | Curate ruthlessly. The order IS the argument. |
| Contact form | "Professional sites have forms" | Spam magnet, requires backend/service, adds maintenance burden, and nobody prefers forms over email. | Direct email link. Clear, simple, no friction. |
| Chatbot / AI assistant | "Trendy and interactive" | Gimmicky on a portfolio. Takes attention from the actual content. Maintenance burden. Visitors want to see work, not talk to a bot. | Let the work speak. The experience of using the site is the conversation. |
| Background music autoplay | "Sets the mood immediately" | Violates web standards, annoys users, accessibility violation. Browsers block it anyway. | Opt-in audio with the pulsing waveform invitation. Reward curiosity, don't impose. |
| Analytics dashboard / visitor counter | "Know who's visiting" | Public vanity metrics are tacky. Detailed analytics are private. | Vercel Analytics for private insights. No public-facing metrics. |

## Feature Dependencies

```
[Lenis Smooth Scroll Setup]
    +--requires--> [GSAP ScrollTrigger Integration]
    |                  +--requires--> [Variable Scroll Physics]
    |                  +--requires--> [Section Transition Pressure Changes]
    |
    +--requires--> [Mutable Scroll Store (Zustand)]
                       +--required-by--> [Monolith Shader Uniforms]
                       +--required-by--> [Audio Scroll Reactivity]
                       +--required-by--> [Cinematic Lighting Shifts]

[R3F Canvas + Scene Setup]
    +--requires--> [Monolith Geometry + Custom Shaders]
    |                  +--enhances--> [Cinematic Lighting]
    |
    +--requires--> [WebGL Capability Detection]
                       +--triggers--> [Mobile CSS Parallax Fallback]

[Accessibility Scaffold]
    +--includes--> [prefers-reduced-motion Detection]
    |                  +--controls--> [All Animation Toggles]
    |                  +--controls--> [3D vs Static Rendering]
    |
    +--includes--> [Semantic HTML + ARIA Landmarks]
    |                  +--required-by--> [Screen Reader Support]
    |                  +--required-by--> [Keyboard Navigation]
    |
    +--includes--> [Skip-to-Content Link]

[Content Sections (DOM)]
    +--requires--> [Typography + Font Loading]
    +--requires--> [Responsive Layout System]
    +--enhances--> [Project-as-Discovery Framing]

[Audio Layer (Tone.js)]
    +--requires--> [User Gesture for AudioContext]
    +--requires--> [Scroll Store Connection]
    +--conflicts-with--> [prefers-reduced-motion] (must disable)
```

### Dependency Notes

- **Scroll Store requires Lenis:** Lenis provides the normalized scroll position and velocity that feeds into every scroll-reactive system (3D, audio, physics). It must be the first integration.
- **Monolith requires R3F + Scroll Store:** The shader uniforms (morph progress, deformation) are driven by scroll position. Both must exist before the monolith can respond.
- **Accessibility must be scaffolded first:** prefers-reduced-motion detection, semantic HTML, and ARIA landmarks should exist in the initial scaffold. Retrofitting accessibility into a complex animation system is exponentially harder.
- **Audio conflicts with reduced-motion:** When prefers-reduced-motion is active, audio should also be disabled (motion-triggered sound can cause discomfort for vestibular disorder sufferers).
- **Mobile fallback requires WebGL detection:** Must detect GPU capability early to decide between R3F canvas and CSS parallax paths. This is a fork, not a progressive enhancement.

## MVP Definition

### Launch With (v1)

Minimum viable portfolio -- enough to send to recruiters and make an impression.

- [ ] Lenis smooth scroll + GSAP ScrollTrigger integration -- the scroll feel IS the product
- [ ] R3F canvas with basic monolith geometry (can be simpler shaders initially) -- establishes the visual identity
- [ ] 4 content sections with project showcases (NeuroEdge, Springpod, FraudShieldAI, Scrollwise) -- the actual content recruiters need
- [ ] Depth-based navigation with section transitions -- the metaphor that makes this portfolio unique
- [ ] prefers-reduced-motion + keyboard nav + ARIA -- non-negotiable for someone selling accessibility
- [ ] Mobile CSS parallax fallback -- 50%+ traffic, must work
- [ ] Contact floor with email link -- conversion point
- [ ] Vercel deployment with custom domain -- ship it
- [ ] Lighthouse 90+ desktop -- performance is credibility

### Add After Validation (v1.x)

Features to layer in once the core experience is solid and deployed.

- [ ] Custom GLSL shaders for monolith morphing -- upgrade from basic geometry to the full evolving monolith vision
- [ ] Variable scroll physics per section -- adds the "weight" metaphor, but core experience works without it
- [ ] Cinematic lighting system with scroll-driven shifts -- enhances mood, not essential for v1
- [ ] Section "pressure change" transitions -- ambient light + scroll resistance changes between layers
- [ ] Provocation copy refinement -- iterate on surface-layer text based on real visitor reactions

### Future Consideration (v2+)

Features to defer until the portfolio is actively being used in job search.

- [ ] Scroll-reactive audio layer (Tone.js) -- highest complexity, lowest priority for recruiter impressions. Add when v1 is polished.
- [ ] Additional project showcases (5th, 6th project) -- only if new projects are genuinely stronger than current selection
- [ ] Advanced monolith states (per-section geometry variations) -- diminishing returns, pursue if time allows
- [ ] Scroll velocity-reactive visual effects (motion blur, chromatic aberration) -- polish, not priority

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Smooth scroll (Lenis + GSAP) | HIGH | MEDIUM | P1 |
| Project showcases with context | HIGH | LOW | P1 |
| Mobile CSS parallax fallback | HIGH | HIGH | P1 |
| Accessibility scaffold (a11y) | HIGH | MEDIUM | P1 |
| R3F canvas + basic monolith | HIGH | HIGH | P1 |
| Depth-based section navigation | HIGH | MEDIUM | P1 |
| Contact floor CTA | HIGH | LOW | P1 |
| Typography + font loading | MEDIUM | LOW | P1 |
| Custom GLSL monolith shaders | MEDIUM | HIGH | P2 |
| Cinematic lighting shifts | MEDIUM | MEDIUM | P2 |
| Variable scroll physics | MEDIUM | MEDIUM | P2 |
| Section pressure transitions | MEDIUM | MEDIUM | P2 |
| Provocation copy on surface | MEDIUM | LOW | P2 |
| Scroll-reactive audio (Tone.js) | LOW | HIGH | P3 |
| Advanced monolith geometry states | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch -- the portfolio is incomplete without these
- P2: Should have, add in v1.x -- elevates from "good portfolio" to "unforgettable experience"
- P3: Nice to have, future consideration -- impressive but diminishing returns on recruiter impact

## Competitor Feature Analysis

| Feature | Bruno Simon (3D Game) | Active Theory (3D Universe) | Typical R3F Portfolio | Ved's Approach |
|---------|----------------------|----------------------------|----------------------|----------------|
| 3D interaction model | Drive a jeep through portfolio | Navigate alien 3D world | Floating shapes behind text | Evolving monolith as narrative throughline |
| Scroll mechanic | Minimal (game controls) | Cursor/drag navigation | Basic smooth scroll | Depth-based scroll with variable physics |
| Content access | Discover by driving to items | Explore 3D environment | Scroll down a page | Layered depth reveals (surface to floor) |
| Mobile experience | Degraded (needs keyboard) | Limited fallback | Usually works but boring | Deliberate 2D parallax (designed, not degraded) |
| Audio | None | Ambient sounds | None | Scroll-reactive synthesis (opt-in) |
| Accessibility | Poor (game-based) | Poor (custom navigation) | Usually decent | WCAG AA compliant (must, given NeuroEdge) |
| Performance | Heavy (full 3D game) | Heavy (complex 3D) | Usually fine | Target Lighthouse 90+ with progressive enhancement |
| Personality expression | Playful, fun | Experimental, techy | Generic developer | Intense, magnetic, layered -- "dark warmth with sharp edges" |

## Sources

- [Awwwards 3D Websites](https://www.awwwards.com/websites/3d/) - competitive landscape
- [Codrops WebGL Scroll Tutorials](https://tympanus.net/codrops/2024/07/18/how-to-create-distortion-and-grain-effects-on-scroll-with-shaders-in-three-js/) - shader scroll techniques
- [W3C WCAG 2.1 SC 2.3.3](https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions.html) - animation accessibility requirements
- [W3C prefers-reduced-motion Technique](https://www.w3.org/WAI/WCAG21/Techniques/css/C39) - reduced motion implementation
- [Lenis GitHub](https://github.com/darkroomengineering/lenis) - smooth scroll library
- [Lenis + R3F Performance Discussion](https://github.com/darkroomengineering/lenis/discussions/431) - mobile performance issues
- [GSAP + R3F Performance Forum](https://gsap.com/community/forums/topic/43299-performance-issues-on-desktop-and-mobile-devices-using-gsap-with-react-three-fiber/) - integration performance
- [Pudding.cool Responsive Scrollytelling](https://pudding.cool/process/responsive-scrollytelling/) - mobile scrollytelling best practices
- [ProFy Portfolio Survey](https://profy.dev/article/portfolio-websites-survey) - what hiring managers actually look for
- [Three.js Forum - Scroll Shader Morphing](https://discourse.threejs.org/t/how-to-control-a-particle-morph-custom-shader-with-mouse-scroll-instead-of-automatic-animation/86338) - scroll-controlled geometry morphing

---
*Feature research for: 3D Scrollytelling Developer Portfolio*
*Researched: 2026-03-08*
