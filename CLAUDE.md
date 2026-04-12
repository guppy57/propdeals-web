# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check and build for production (tsc -b && vite build)
pnpm lint         # Run ESLint
pnpm typecheck    # Type-check without emitting (tsc --noEmit)
pnpm format       # Format all TS/TSX files with Prettier
pnpm preview      # Preview the production build
```

## Adding shadcn/ui Components

```bash
npx shadcn@latest add <component-name>
```

Components are placed in `src/components/ui/`. Import them via the `@/components/ui/` alias.

## Architecture

- **React 19** + **TypeScript** + **Vite 7** SPA
- **Tailwind CSS v4** (configured via `@tailwindcss/vite` plugin, not a `tailwind.config` file — theme tokens live in `src/index.css` under `@theme inline`)
- **shadcn/ui** with the `radix-mira` style and `mist` base color; uses CSS variables for theming (light/dark defined in `src/index.css`)
- **Geist Variable** is the sole font, loaded via `@fontsource-variable/geist`
- `@/` path alias resolves to `src/`

The entry point is `src/main.tsx`, which wraps the app in `ThemeProvider` (from `src/components/theme-provider.tsx`) for dark mode support before rendering `App`.

Theming: dark mode is toggled by adding the `.dark` class to the DOM. All color tokens are OKLCH values defined in `:root` and `.dark` blocks in `src/index.css`.
