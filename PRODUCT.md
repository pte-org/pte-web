# Product

## Register

brand

## Users

Organization and center administrators responsible for setting up PTE exam operations. They visit the public homepage before signing in or registering an organization, and need to understand the product's value, workflow, and available access plans quickly.

## Product Purpose

PTE Prep helps organizations coordinate PTE learners, exam packages, student capacity, and exam operations from one tenant portal. The public homepage should create confidence, explain the operating model, and move visitors toward registering an organization or signing in. The current homepage is a UI preview surface, so plan information may be mocked while the API integration remains unchanged for later work.

## Brand Personality

Trustworthy, academic, and contemporary. The landing page should feel clear and capable rather than flashy: strong hierarchy, restrained color, useful information, and a calm sense of progress. The primary calls to action are Register organization and Sign in. The authenticated dashboard remains at `/host/dashboard` and is out of scope for this surface.

## Anti-references

Avoid dashboard-like density on the public page, SaaS-template styling, neon or decorative gradients, vague marketing claims, excessive rounded cards, autoplay media, and carousel-heavy storytelling. Do not make the page feel like an authenticated product shell or hide the main action behind API loading states.

## Design Principles

- Explain the operating model before asking for action.
- Make organization setup and next steps obvious at every decision point.
- Use real product information and concrete outcomes instead of generic growth language.
- Keep the visual system calm, legible, and distinctive through hierarchy and purposeful blue accents.
- Preserve the existing route, auth, and API boundaries while allowing mock data for visual exploration.

## Accessibility & Inclusion

Target WCAG AA. Support full keyboard interaction, visible focus states, skip links, semantic HTML, clear heading hierarchy, and ARIA only where needed. Provide meaningful alt text and form labels/errors. Respect `prefers-reduced-motion`; do not use autoplay animation, video, or carousels as required content.
