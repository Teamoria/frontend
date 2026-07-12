# Teamoria Design System — Decision Fabric

> Source of truth for Teamoria web UI. Last revised: 2026-07-11.

## Product thesis

Teamoria is a multi-tenant B2B team operating system. It connects projects, tasks,
meetings, files, people, and permission-aware AI knowledge.

The interface has one job: turn scattered work signals into a clear, traceable
decision that a person can review and act on.

The core narrative is:

```text
source → understanding → evidence → decision → action
```

### Audience and role lens

- Company owner: “What needs my decision now?”
- Company manager: “What threatens delivery?”
- Company member: “What should I finish today?”
- Platform admin: “Is the platform, tenant base, and billing healthy?”

Do not use the old Company Admin / General Manager / Project Manager / Employee
labels as backend roles. API roles are `admin`, `company_owner`,
`company_manager`, and `company_member`.

## Visual direction

“Decision Fabric” is a calm operations room, not a glowing generic AI product.
Surfaces are quiet and structural; cobalt identifies commands, teal identifies
grounded intelligence, and amber identifies decisions that need attention.

The signature element is the Trace Rail: a thin line with meaningful nodes that
connects real sources, analysis, decisions, and actions. It appears only where a
relationship exists (AI citations, file processing, task history, meeting
decisions, or realtime state).

### Palette

| Role | Light | Dark |
|---|---:|---:|
| Canvas | `#F3F6F7` | `#0A1317` |
| Surface | `#FFFFFF` | `#111F25` |
| Raised surface | `#EEF3F5` | `#182A32` |
| Operational ink | `#102128` | `#E9F0F2` |
| Secondary text | `#4C626B` | `#ACC0C7` |
| Structural border | `#D7E1E4` | `#29404A` |
| Command cobalt | `#3158C7` | `#91A8FF` |
| Grounded-AI teal | `#0D7A73` | `#5CC7BE` |
| Decision amber | `#A8610A` | `#F2B866` |
| Danger | `#B33A45` | `#FF8F9A` |
| Success | `#167553` | `#6BD2A8` |

Colors must be consumed through semantic variables in
`src/styles/teamoria-next.css`, never hardcoded in a new page component.

## Typography

- Display and headings: Alexandria, 500–700.
- Arabic interface text: IBM Plex Sans Arabic, 400–700.
- Latin interface text: IBM Plex Sans, 400–700.
- IDs, dates, and tabular figures: IBM Plex Mono.

Headings are confident but restrained. Body copy stays at 16px minimum on mobile
and uses a 1.6–1.85 line height for Arabic.

## Shape, depth, and spacing

- 4px base spacing rhythm; common values: 8, 12, 16, 24, 32, 48.
- Controls: 9px radius and at least 44px high.
- Panels: 12px radius, 1px structural border, no default shadow.
- Composed canvases and major callouts: up to 16px radius.
- Shadows are reserved for floating menus, drawers, dialogs, and the marketing
  product canvas.
- Non-interactive cards do not lift on hover.

## Application shell

Desktop (≥1200px):

```text
┌───────────────────────────────────────────────┬──────────────┐
│ sticky command header                         │              │
├───────────────────────────────────────────────┤  role-aware  │
│                                               │  navigation  │
│ content / decisions / work                    │  + pulse     │
│                                               │  rail        │
└───────────────────────────────────────────────┴──────────────┘
```

The sidebar follows inline-start: right in Arabic and left in English. On smaller
screens it becomes a drawer opened by a visible 44px control. Page headers contain
one clear title, one descriptive sentence, and one primary action.

## Localization and RTL

- Arabic is the default, English remains available.
- `PreferencesProvider` owns language, `dir`, and theme.
- Use logical CSS properties (`inline`, `block`) for new code.
- User-generated content gets `dir="auto"`; emails and identifiers use `bdi` or
  isolated direction where needed.
- Dates, relative times, and numbers use `Intl` with the selected locale.
- Reverse directional arrows only; do not mirror neutral icons.
- A page is not considered Arabic-ready if only the shell is translated.

## Theme behavior

Supported preferences: `light`, `dark`, and `system`.

Light and dark tokens are designed as a pair. Dark mode is not an inversion: it
uses layered navy surfaces, lighter desaturated cobalt/teal, and separately tested
text/border contrast. The preference is persisted and applied before React mounts
to prevent a theme flash.

## Interaction principles

- One primary action per screen.
- Touch targets are at least 44×44px with at least 8px separation.
- Visible keyboard focus uses a 3px semantic ring.
- Loading states preserve layout and explain what is being loaded.
- Errors name the failed action and give the next recovery step.
- Empty states explain what will appear and how to create the first item.
- Destructive actions require confirmation or undo.
- Motion is 150–300ms, communicates state, and uses transform/opacity.
- `prefers-reduced-motion` disables non-essential motion.

## Realtime UX

Laravel Reverb has four visible states:

- connected: restrained success state;
- connecting: amber progress state;
- disconnected/failed: clear degraded state;
- not configured: neutral setup state.

AI Chat subscribes to private `chat.<user_id>` and `.ai.message.received`. Polling
is only a cancellable fallback, and stops immediately when the WebSocket event
arrives. Never show a permanent green “live” indicator if no connection was
actually established.

## AI and evidence

- AI answers distinguish assistant content from user content without excessive
  visual effects.
- Sources are first-class: titled, numbered, keyboard reachable, and shown near
  the claim they support.
- Any action proposed by AI is previewed and confirmed by a person before it
  creates or mutates work.
- Use teal for grounded context, not as a generic decorative accent.

## Content voice

Write from the user’s side of the screen with plain active verbs:

- “إنشاء مهمة” / “Create task”, not “Submit”.
- “تعذر تحميل المهام — أعد المحاولة”, not “Something went wrong”.
- “لا توجد ملفات بعد — ارفع أول ملف”, not a blank panel.

Do not claim integrations, customer counts, productivity percentages, security
certifications, or AI abilities that the current product cannot demonstrate.

## Accessibility floor

- WCAG AA: 4.5:1 for normal text, 3:1 for large text and UI graphics.
- Semantic headings and landmarks; one `h1` per page.
- All icon-only controls have an accessible name.
- `aria-current="page"` marks active navigation.
- Route changes update the document title and move focus to main content.
- Dialogs have a label, Escape route, focus containment, and mobile sheet layout.
- Color never carries status alone; pair it with text or an icon.
- Tables retain readable headers and get intentional horizontal scrolling.

## Anti-patterns

- Purple/pink “AI glow” as the main visual language.
- Glassmorphism on ordinary content cards.
- Unverified marketing metrics or fake customer logos.
- Emoji as structural icons.
- Raw hex colors in page components.
- Multiple shell variants with different information architecture.
- `dir="ltr"` on the application shell.
- Global `overflow-x: hidden` as a substitute for responsive layout.
- Hover-only actions or controls smaller than 44px.

## Implementation sources

- Foundations and compatibility layer: `src/styles/teamoria-next.css`
- Marketing surface: `src/pages/LandingPage.jsx` + `landing-next.css`
- Authentication surface: `src/components/AuthLayout.jsx` + `auth-next.css`
- Preferences: `src/lib/PreferencesContext.jsx`
- Realtime lifecycle: `src/lib/reverb.js` + `RealtimeContext.jsx`
- Shared shell: `src/components/app/AppShell.jsx` + `AppHeader.jsx`
