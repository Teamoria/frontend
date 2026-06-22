# Teamoria Frontend

React frontend for Teamoria built with Vite. The app includes a landing page, authentication screens, password reset flow, and a dashboard mockup.

## Tech Stack

- React
- Vite
- CSS

## Pages

- `/` - Landing page
- `#/signin` - Sign in
- `#/signup` - Sign up
- `#/reset-password` - Password reset
- `#/dashboard` - Dashboard

## Getting Started

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```text
src/
  components/
  pages/
  App.jsx
  main.jsx
  styles.css
```

## Notes

- Routing is hash-based and handled in `src/App.jsx`.
- Build output is generated in `dist/` and is ignored by Git.
- Dependencies in `node_modules/` are ignored by Git.
