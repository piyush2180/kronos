# Responsive Design Audit

Mobile UI audit and responsive layout fixes applied across the Kronos codebase.

## Audited Pages

- Dashboard (`src/pages/Dashboard.jsx`)
- Play Page (`src/pages/PlayPage.jsx`)
- Local Play (`src/pages/LocalPage.jsx`)
- Analysis (`src/pages/AnalysisPage.jsx`)
- Puzzles (`src/components/Puzzles.jsx`)
- Position Editor (`src/components/PositionEditor.jsx`)
- Profile (`src/components/Profile.jsx`)
- About (`src/pages/AboutPage.jsx`)
- Research Lab (`src/components/research/*`, `src/pages/ResearchLabPage.jsx`)

---

## Issues Fixed

### A. Navigation & Settings
- **Issue:** Header tabs and profile dropdown overflowed or were inaccessible below `1024px`.
- **Fix:** Added media queries and a sliding drawer menu for mobile/tablet viewports in `index.css` and `App.jsx`.

### B. Chessboard Layouts
- **Issue:** Rigid grids with `calc(100vh - 56px)` caused boards and move lists to clip on small screens.
- **Fix:** `.game-split-grid` stacks columns vertically below `1024px`. Move lists capped at `280px` height on mobile.

### C. Evaluation Bar
- **Issue:** Hardcoded `44px` width squeezed the board area on mobile.
- **Fix:** Scales to `20px` on mobile. HUD uses `min(70vh, 680px)` constraints.

### D. Research Lab
- **Issue:** 3-column layout was unreadable on tablet and broken on mobile.
- **Fix:**
  - **Tablet:** Sidebar collapsed to icons-only (`64px`), metadata panel moved below workspace.
  - **Mobile:** Replaced panels with bottom tab bar navigation.

### E. Card Layouts
- **Issue:** Dashboard and About page cards overflowed due to high minimum widths.
- **Fix:** Reduced grid minimum width to `280px`. Profile metrics flow to 2 columns on mobile.

---

## Remaining Limitations

All layouts scale cleanly to `320px` wide. No remaining overflow issues. A potential future enhancement: native pinch-to-zoom prevention during drag-and-drop moves on specific mobile browsers.
