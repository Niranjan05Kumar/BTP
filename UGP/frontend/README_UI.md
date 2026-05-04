Surface Mining Dashboard — UI Redesign Notes

Summary
- Redesigned dashboard UI with premium visual system: glassmorphism, soft shadows, rounded corners, and responsive 12-column layout.
- Added modular components: `TopNav`, `GlassCard`, `KpiCard`, `FiltersBar` and updated charts for improved aesthetics.

What changed
- Global design tokens (light/dark) and CSS in `src/style.css`.
- `TopNav` component (sticky, blurred background, theme toggle, avatar, notifications).
- `KpiCard` component with accent strip, trend indicator and mini sparkline.
- `FiltersBar` — compact inline filter controls plus Export and Live indicator.
- Charts updated: gradient area for production, rounded bars for shift production, horizontal utilization with color scale, donut downtime chart with center total.

Notes for finishing setup (optional Tailwind/Framer Motion/Lucide)
The UI is implemented using plain CSS tokens in `style.css`. If you'd like to migrate to Tailwind and install animation/icon libraries, run:

```bash
cd frontend
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npm install framer-motion lucide-react
```

Then adapt the Tailwind config to include the design tokens or convert `src/style.css` into `src/index.css` and include Tailwind directives.

Developer tips
- The theme respects the `data-theme` attribute on `<html>` and the app already toggles it from `App.jsx`.
- Charts use `recharts` (already in package.json).
- For production polish, consider integrating `framer-motion` for card hover lifts and `react-countup` for animated numbers.
