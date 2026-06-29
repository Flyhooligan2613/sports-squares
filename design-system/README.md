# SquareBoards Design System (SQDS)

**Project Titan Sprint 2.5** — the canonical design language for SquareBoards.

## Usage

All new features **must** import from SQDS. Do not introduce ad-hoc colors, spacing, or component styles outside this package.

```tsx
import { Button, Card, Badge, colors } from "@/design-system";
import "@/design-system/sqds.css";
```

Wrap your surface in `.sqds-root` (or use the provided layout) so CSS custom properties resolve correctly.

## Structure

| Path | Purpose |
|------|---------|
| `tokens/` | Colors, typography, spacing, radius, elevation, motion, sound, haptics |
| `components/` | Reusable UI primitives |
| `motion/` | Animation utilities and presets |
| `icons/` | Consistent icon exports (Lucide) |
| `sqds.css` | CSS custom properties + component styles |

## Documentation

Internal reference: [`/design-system`](/design-system)
