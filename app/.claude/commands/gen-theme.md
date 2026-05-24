---
description: Customise the app's brand colours, border radius, and fonts by updating app/styles/theme.css
---

You are customising the VibeForge app theme. First read the current `app/styles/theme.css`.

The theme file contains CSS custom properties. Each variable controls one aspect of the visual design:

| Variable | Controls |
|----------|---------|
| `--vf-color-primary` | Primary button background, active tab underline, link colour |
| `--vf-color-primary-hover` | Hover state of primary colour (typically 1 shade darker) |
| `--vf-color-primary-text` | Text colour on primary buttons (usually `#ffffff`) |
| `--vf-color-danger` | Destructive button background |
| `--vf-color-danger-hover` | Hover state of danger colour |
| `--vf-color-danger-text` | Text on danger buttons (usually `#ffffff`) |
| `--vf-color-surface` | Card and panel background colour |
| `--vf-color-surface-border` | Card and panel border colour |
| `--vf-color-input-border` | Input field border colour |
| `--vf-color-input-ring` | Focus ring on inputs (usually matches primary) |
| `--vf-radius` | Card and modal border radius (e.g. `0.5rem` = subtle, `1rem` = rounded) |
| `--vf-radius-sm` | Button and input border radius (slightly smaller than `--vf-radius`) |
| `--vf-font-sans` | Font family stack |

## Rules

- Only uncomment and set variables that are relevant to the user's brand description
- Leave other variables commented out so platform defaults apply
- Choose hex colour values that form a coherent, accessible palette:
  - Hover variants should be 1 Tailwind shade darker than the base (e.g. `#3b82f6` → `#2563eb`)
  - For dark surfaces, ensure `--vf-color-surface-border` is visible against `--vf-color-surface`
  - For dark surfaces, consider whether `--vf-color-input-border` needs updating too
  - Maintain WCAG AA contrast: text-on-primary ≥ 4.5:1
- Do not add variables that are not in the list above

## Output

Rewrite `app/styles/theme.css` with the appropriate variables uncommented and set.

After writing the file:
1. Show a brief summary: which variables changed and why
2. Remind the user to reload the browser — no rebuild needed

Generate the theme now based on the user's description.
