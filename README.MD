
# Locus
Locus is the project that will allow people to work with corrabulation with amazing experince in interactive map
# Project structure

```text
Locus/
├── apps/
│   ├── web/                # Next.js frontend (Mapbox, Tailwind)
│   └── api/                # Node.js/Express or Go backend
├── packages/
│   ├── ui/                 # Shared React components
│   ├── utils/              # Shared helper functions (GeoJSON tools)
│   ├── types/              # Shared TypeScript interfaces (Deltas, CRDTs)
│   └── config/             # Shared ESLint, Prettier, and Tailwind configs
├── pnpm-workspace.yaml      # pnpm workspace definition
├── pnpm-lock.yaml
└── package.json
```
