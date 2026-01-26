

# Page Transition Animations Implementation Plan

## Overview

Add smooth page transition animations when navigating between routes (Index, Leaderboard, NotFound) for a more polished user experience. The implementation will leverage the existing Tailwind animation utilities already defined in the codebase.

## Approach

Since the project already has well-defined animation keyframes (`fade-in`, `fade-out`, `scale-in`, etc.) in `tailwind.config.ts`, we will create a lightweight page transition wrapper component that applies these animations on route changes without adding new dependencies.

## Implementation Steps

### 1. Create a PageTransition Wrapper Component

Create a new component `src/components/PageTransition.tsx` that:
- Wraps page content with animation classes
- Triggers the `animate-fade-in` animation on mount
- Uses the existing `fade-in` keyframe with `translateY` for a subtle slide-up effect

```text
+----------------------------------+
|         PageTransition           |
|  +--------------------------+    |
|  |   opacity: 0 -> 1        |    |
|  |   translateY: 10px -> 0  |    |
|  |                          |    |
|  |   [ Page Content ]       |    |
|  |                          |    |
|  +--------------------------+    |
+----------------------------------+
```

### 2. Apply PageTransition to Each Page

Wrap the root element of each page component:
- `src/pages/Index.tsx` - Wrap the main container
- `src/pages/Leaderboard.tsx` - Wrap the main container
- `src/pages/NotFound.tsx` - Wrap the error display

### 3. Animation Configuration

Use the existing animation utilities with these properties:
- Duration: 300ms (already defined as `fade-in 0.3s ease-out`)
- Timing: `ease-out` for natural deceleration
- Transform: Subtle `translateY(10px)` slide-up effect

## Technical Details

### New File: `src/components/PageTransition.tsx`

```tsx
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  return (
    <div
      className={cn(
        'opacity-0 animate-fade-in',
        className
      )}
      style={{ animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}
```

### Page Modifications

Each page will import and use the `PageTransition` component:

**Index.tsx:**
```tsx
import { PageTransition } from '@/components/PageTransition';

// Wrap return statement
return (
  <PageTransition className="min-h-screen bg-gradient-to-b ...">
    {/* existing content */}
  </PageTransition>
);
```

**Leaderboard.tsx:**
```tsx
import { PageTransition } from '@/components/PageTransition';

// Wrap return statement
return (
  <PageTransition className="min-h-screen bg-background">
    {/* existing content */}
  </PageTransition>
);
```

**NotFound.tsx:**
```tsx
import { PageTransition } from '@/components/PageTransition';

// Wrap return statement  
return (
  <PageTransition className="flex min-h-screen items-center justify-center bg-muted">
    {/* existing content */}
  </PageTransition>
);
```

## Benefits

- **Zero new dependencies** - Uses existing Tailwind animations
- **Consistent with codebase** - Follows the same pattern used by FacultyCard and FacultyListCompact
- **Lightweight** - Simple wrapper component with minimal overhead
- **Smooth UX** - Subtle fade + slide animation provides polish without being distracting

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/components/PageTransition.tsx` | Create |
| `src/pages/Index.tsx` | Modify - wrap content |
| `src/pages/Leaderboard.tsx` | Modify - wrap content |
| `src/pages/NotFound.tsx` | Modify - wrap content |

