---
name: vercel-react-best-practices
description: Best practices for React applications deployed on Vercel, including routing, rendering, environment variables, performance, accessibility, and production readiness. Use when building, reviewing, or fixing React, Next.js, or Vercel-hosted frontend projects.
---

# Vercel React Best Practices

Use this skill when working on React applications that run on Vercel, especially Next.js apps or static React builds deployed through Vercel.

## Project Fit

- Follow the framework already present in the repository.
- Prefer existing components, hooks, data-fetching patterns, and styling conventions.
- Keep environment-specific behavior behind documented environment variables.
- Do not expose server-only secrets to client bundles.

## React Practices

- Keep components focused and composable.
- Use controlled state only where the UI needs it; derive values when possible.
- Avoid unnecessary effects for synchronous derived data.
- Handle loading, empty, error, and success states for async flows.
- Add accessible labels, keyboard support, and visible focus states for interactive controls.

## Vercel And Next.js Practices

- Use server components, server actions, API routes, or client components according to the app's existing architecture.
- Keep client components as small as practical when using Next.js App Router.
- Use framework image, font, routing, metadata, and caching APIs when already adopted by the project.
- Choose static rendering, server rendering, or revalidation based on data freshness needs.
- Validate production behavior with `npm run build` when available.

## Performance Checks

- Avoid shipping large client-side dependencies for simple UI behavior.
- Lazy-load heavy below-the-fold features where it improves initial load.
- Reserve dimensions for images and media to reduce layout shift.
- Keep forms and navigation responsive during async work.

## Deployment Readiness

- Confirm required environment variables are documented or already configured.
- Avoid hardcoded local URLs in production code.
- Make error paths useful without leaking internal details.
- Run the repo's lint, test, and build commands when available and relevant.
