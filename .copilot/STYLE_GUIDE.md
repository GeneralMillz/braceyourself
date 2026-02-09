# Style Guide

## Code Style
- ES6 modules only.
- No external dependencies.
- Use JSDoc for type hints.
- Avoid circular dependencies.
- Prefer pure functions in /core modules.

## Naming
- camelCase for variables and functions.
- PascalCase for classes.
- kebab-case for filenames.

## File Structure
- Business logic → /core
- UI logic → /ui
- Helpers → /utils
- Templates → /templates
- Documentation → /docs

## UI Conventions
- Keep mobile interactions simple and touch-friendly.
- Use modals for focused tasks.
- Keep palette interactions consistent across devices.

## Template Structure
- JSON files must include size, colors, and grid data.
- Legacy templates must be adapted via templates.js.
