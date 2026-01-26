
## Improve Mobile UI Experience

### Overview
Redesign the mobile layout to feel cleaner and less overwhelming by reorganizing the header, simplifying navigation, and adding better spacing.

### Current Issues
- Header has too many buttons visible at once, causing them to wrap awkwardly on narrow screens
- Stats (faculty count, department count) appear cramped side-by-side
- Navigation buttons show both icons and text, consuming valuable horizontal space
- Overall information density is too high for comfortable mobile viewing

### Proposed Changes

#### 1. Header Reorganization

**Mobile Navigation (below 640px):**
- Keep only theme toggle and a hamburger menu icon visible
- Move Leaderboard, Recent Reviews (bell), and Admin Login into a dropdown/sheet menu
- Stack stats vertically on mobile

**Before:**
```
[Logo] FAST-NUCES Islamabad     [☀️][Leaderboard][🔔][Login]
Anonymous Faculty Review System
97 Faculty Members  12 Departments
```

**After (mobile):**
```
[Logo] FAST-NUCES Islamabad           [☀️][☰]
Anonymous Faculty Review System
97 Faculty Members
12 Departments
```

#### 2. Mobile Menu Sheet
Create a slide-out menu (using existing Sheet component) containing:
- Leaderboard link
- Recent Reviews button
- Admin Login/Logout
- Clean, touch-friendly spacing

#### 3. Stats Layout
- Stack vertically on mobile (flex-col on small screens)
- Use `flex-col sm:flex-row` pattern

#### 4. Improved Spacing
- Reduce header padding on mobile (`py-4` vs `py-6`)
- Add more breathing room between elements
- Slightly smaller font sizes for subtitles on mobile

#### 5. Faculty Card Refinements
- Ensure adequate touch targets
- Keep existing layout (already responsive)

### Files to Modify

| File | Change |
|------|--------|
| `src/components/Header.tsx` | Add mobile menu, reorganize buttons, stack stats |
| `src/components/MobileMenu.tsx` | New component for slide-out navigation |

### Technical Implementation

**Header.tsx changes:**
- Import `Sheet`, `SheetContent`, `SheetTrigger` from UI components
- Import `Menu` icon from lucide-react
- Add `useIsMobile` hook to detect screen size
- Conditionally render compact header on mobile
- Move action buttons into Sheet on mobile

**Stats section:**
```tsx
<div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4 text-sm font-mono">
```

**Mobile button area:**
```tsx
{/* Desktop buttons */}
<div className="hidden sm:flex items-center gap-2">
  {/* All existing buttons */}
</div>

{/* Mobile: only theme + menu */}
<div className="flex sm:hidden items-center gap-2">
  <Button variant="outline" size="icon" onClick={toggleTheme}>...</Button>
  <Sheet>
    <SheetTrigger asChild>
      <Button variant="outline" size="icon"><Menu /></Button>
    </SheetTrigger>
    <SheetContent>
      {/* Navigation items with proper spacing */}
    </SheetContent>
  </Sheet>
</div>
```

### Visual Result
- Cleaner header with only essential icons on mobile
- Easy-to-access slide-out menu for secondary actions
- Better vertical rhythm with stacked stats
- More breathing room throughout
- Maintains full functionality
