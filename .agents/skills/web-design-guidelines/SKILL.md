---
name: web-design-guidelines
description: Practical web design guidance for building polished, responsive, accessible websites and web app interfaces. Use when creating, reviewing, or improving layouts, typography, visual hierarchy, component states, and responsive behavior.
---

# Web Design Guidelines

Use this skill when a task changes how a website or web app looks, reads, responds, or guides users.

## Core Checks

- Start with the actual user goal and make the primary action obvious.
- Use a clear visual hierarchy: one main heading, focused section headings, and concise supporting text.
- Keep spacing consistent with a small scale rather than one-off values.
- Use responsive constraints so content reflows cleanly from mobile to desktop.
- Make interactive elements visibly interactive, with hover, focus, active, disabled, loading, and error states where relevant.
- Preserve keyboard access and visible focus styles.
- Check color contrast for readable body text and controls.
- Use real UI affordances and icons instead of decorative labels where a familiar control exists.
- Avoid decorative clutter that does not support comprehension or task completion.

## Implementation Guidance

- Prefer the project's existing design tokens, components, icon library, and layout conventions.
- Define stable dimensions for fixed-format UI such as toolbars, grids, boards, and compact controls.
- Avoid text overlap by testing long labels, narrow screens, and dynamic content states.
- Use semantic HTML first, then ARIA only when native semantics are insufficient.
- Respect `prefers-reduced-motion` for nonessential animation.

## Review Before Finishing

- Verify mobile and desktop layouts.
- Confirm no horizontal scrolling appears unintentionally.
- Confirm primary workflows are usable without relying on hover.
- Run the project's formatter, lint, build, or visual checks when available.
