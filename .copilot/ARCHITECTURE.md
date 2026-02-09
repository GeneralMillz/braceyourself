# Architecture Overview

BraceYourself is organized into a clean, modular ES6 structure:

## Root
- index.html — main entry point
- app.js — global initialization
- app.css / print.css — styling
- imageWorker.js — Web Worker for image processing
- theme_soft_pastel.css — optional theme
- README.md — project overview

## /src
### /core (business logic)
- grid.js — grid creation, editing, rendering
- palette.js — color selection and management
- templates.js — template loading, legacy compatibility
- imageImporter.js — image → pattern conversion
- harmonizer.js — palette harmonization
- inspiration.js — idea generator
- difficulty.js — difficulty scaling
- export.js — export logic
- print.js — print formatting
- state.js — centralized application state
- storage.js — localStorage persistence
- keywords.js — keyword tagging
- guided.js — onboarding flow

### /ui (interface logic)
- welcome.js — welcome screen logic
- modals.js — modal dialogs
- mobileBar.js — mobile palette and UI adjustments

### /utils (helpers)
- colorUtils.js — color math and quantization helpers
- notifications.js — user alerts and feedback

## /templates
A large library of JSON templates organized by category:
- animals
- emojis
- flowers
- hearts
- turtles

## /docs
Contains project documentation:
- CASE_STUDY.md (referenced by Copilot)
- ARCHITECTURE.md
- MODULES.md
- ROADMAP.md
- UX.md
- TEMPLATES.md

The CASE_STUDY.md remains in /docs and is referenced by Copilot for context.
