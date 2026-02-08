# Roadmap

Feature roadmap and planned improvements for Brace Yourself.

## Current Version: v2.0.0

Completed refactoring to modular architecture with comprehensive documentation.

---

## v2.1 — Enhanced UX

### Planned Features

- [ ] **Undo/Redo System**
  - Maintain action history stack
  - Keyboard shortcuts: Ctrl+Z, Ctrl+Shift+Z
  - Max 50 undo states

- [ ] **Clipboard Integration**
  - Paste grid data from clipboard
  - Paste images directly
  - Copy grid state for sharing

- [ ] **Grid Editing Tools**
  - Flood fill / bucket tool
  - Line drawing tool
  - Rectangle selection/fill
  - Mirror/flip operations

- [ ] **Design Variants**
  - Save multiple versions of same design
  - Compare side-by-side
  - Merge favorites from different versions

---

## v2.2 — Template Expansion

### New Template Packs (100 more templates)

- [ ] **Geometric Pack** (25)
  - Triangles, squares, stars, spirals
  - Minimalist geometric patterns

- [ ] **Nature Pack** (25)
  - Trees, mountains, clouds, water
  - Seasonal themes (autumn leaves, snowflakes)

- [ ] **Food Pack** (25)
  - Fruit, desserts, ice cream
  - Coffee, candy, pizza

- [ ] **Space Pack** (25)
  - Stars, planets, rockets
  - Constellations, UFOs

---

## v2.3 — Mobile & Responsive

### Mobile-First Improvements

- [ ] **Touch Gestures**
  - Pinch to zoom
  - Swipe to navigate
  - Long-press for context menu

- [ ] **Mobile Layout**
  - Vertical layout for small screens
  - Bottom navigation
  - Collapsible panels

- [ ] **Performance**
  - Optimize grid rendering for mobile
  - Reduce memory usage
  - Cache templates on device

---

## v2.4 — Collaboration & Sharing

### Social Features

- [ ] **Pattern Sharing**
  - Generate shareable links
  - QR codes for mobile
  - Social media integration (Pinterest, Instagram)

- [ ] **Community Hub** (External site)
  - Browse community-created patterns
  - Rate and favorite patterns
  - Comments and feedback

- [ ] **Pattern Discovery**
  - Trending patterns
  - "Most Liked" section
  - Similar pattern recommendations

---

## v3.0 — Advanced Features

### Major Additions

- [ ] **Symmetry Tools**
  - Mirror horizontal/vertical
  - Point symmetry
  - Radial symmetry (for circular patterns)

- [ ] **Gradient & Dithering**
  - Manual gradient creation
  - Dithering preview & adjustment
  - Pattern overlay blending

- [ ] **Batch Processing**
  - Convert multiple images at once
  - Apply template to directory of images
  - Export multiple formats

- [ ] **Custom Brush Library**
  - Create and save custom brushes
  - Stamp patterns onto grid
  - Brush size/shape options

- [ ] **Animation Preview**
  - Animate pattern transitions
  - Gradient loops
  - Color cycling

---

## v3.1 — Advanced Analytics

### Pattern Analysis

- [ ] **Thread Usage Calculator**
  - Estimate yardage per thread color
  - Cost estimate
  - Difficulty breakdown

- [ ] **Material Recommendations**
  - Suggest thread types for pattern
  - Weather resistance info
  - Sustainability scores

- [ ] **Pattern Metrics**
  - Repeat unit detection
  - Symmetry analysis
  - Color harmony scoring

- [ ] **Export Analytics**
  - Popular export formats
  - Most-used categories
  - User preferences

---

## v4.0 — AI-Powered (Long Term)

### Experimental ML Features

- [ ] **Generative Patterns**
  - Create patterns from text description
  - StyleGAN-based pattern generation
  - Variation suggestions

- [ ] **Pattern Recognition**
  - Identify patterns in uploaded photos
  - Similar pattern detection
  - Auto-categorization

- [ ] **Color Advisory**
  - Suggest colors based on image
  - Cultural color meaning
  - Accessibility contrast checker

---

## Infrastructure Improvements

### Planned Technical Work

#### Immediate (v2.1-2.2)
- [ ] Unit tests for core modules
- [ ] E2E tests with Cypress
- [ ] TypeScript migration (optional)
- [ ] Performance profiling

#### Medium-term (v2.3-2.4)
- [ ] Service Worker for offline support
- [ ] IndexedDB for template caching
- [ ] WebGL for faster grid rendering
- [ ] Virtual scrolling for template library

#### Long-term (v3.0+)
- [ ] Backend server for cloud sync
- [ ] Database for user accounts
- [ ] Real-time collaboration (WebSockets)
- [ ] Mobile apps (React Native)

---

## Quality Improvements

### Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Screen reader testing
- [ ] Keyboard navigation
- [ ] High contrast mode

### Documentation
- [ ] Video tutorials
- [ ] Interactive guide
- [ ] API documentation
- [ ] Community wiki

### Testing
- [ ] Unit test coverage (>80%)
- [ ] Integration tests
- [ ] Visual regression tests
- [ ] Accessibility audits

---

## Deprecation Timeline

### Legacy Format Support
- **v2.0 - v3.0**: Full support for legacy template format
- **v4.0**: Deprecated (will remove in v5.0)
- **v5.0+**: Modern format only

### Browser Support
- **Current**: Chrome 90+, Firefox 88+, Safari 14+
- **v3.0**: Drop IE11 support
- **v3.0**: Drop Safari <14 support
- **v4.0**: Drop Chrome <100 support

---

## Community Contributions

We welcome:
- Template designs
- Bug reports
- Feature suggestions
- Code improvements
- Translation support

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines (coming soon).

---

## Feedback & Voting

### How to Influence Priorities

1. **Open an Issue** on the GitHub repo
2. **Upvote** existing feature requests
3. **Comment** with use cases
4. **Join Discussions** about architecture

Top community requests:
- Pin favorite templates
- Custom grid backgrounds
- Layer/stacking system
- Export to PDF

---

## Notes

### Why No Undo/Redo Yet?

Current architecture would require:
- Full state snapshots per action
- History management complexity
- Increased memory usage

Worth doing, but waiting for architecture refactor.

### Why No Real-Time Collab?

Would require:
- Backend server
- Database
- Operational Transformation (OT)
- Real-time sync library

Better after v3.0 stabilization.

### Why Not Mobile App Yet?

We're assessing:
- React Native vs Flutter
- Shared code between web/mobile
- App store distribution

Web-first approach for now focuses on responsive design.

---

Last updated: Feb 2026
