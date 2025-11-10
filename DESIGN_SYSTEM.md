# Investment Analyzer - Design System & UI Architecture

This document defines the design system, component architecture, and UX patterns for the application.

## Design Principles

### 1. Clarity Over Complexity
- Financial data should be easy to understand
- Avoid jargon without explanation
- Use visual hierarchies to guide attention
- Progressive disclosure of details

### 2. Trust & Credibility
- Show data sources clearly
- Indicate confidence levels
- Provide disclaimers
- Professional, clean aesthetics

### 3. Efficiency
- Common tasks should be 1-3 clicks
- Smart defaults
- Keyboard shortcuts
- Quick actions everywhere

### 4. Transparency
- Show methodology
- Explain calculations
- Indicate AI vs calculated data
- Display data freshness

---

## Color System

### Brand Colors
```css
--primary: hsl(221.2 83.2% 53.3%)      /* Blue - Trust, Stability */
--primary-hover: hsl(221.2 83.2% 48%)
--primary-foreground: hsl(210 40% 98%)
```

### Semantic Colors
```css
/* Success / Positive / Buy */
--success: hsl(142.1 76.2% 36.3%)      /* Green */
--success-light: hsl(142.1 76.2% 90%)
--success-foreground: hsl(355.7 100% 97.3%)

/* Warning / Hold / Neutral */
--warning: hsl(45.4 93.4% 47.5%)       /* Amber */
--warning-light: hsl(45.4 93.4% 90%)
--warning-foreground: hsl(26 83.3% 14.1%)

/* Destructive / Negative / Sell */
--destructive: hsl(0 84.2% 60.2%)      /* Red */
--destructive-light: hsl(0 84.2% 95%)
--destructive-foreground: hsl(210 40% 98%)

/* Information */
--info: hsl(199 89% 48%)               /* Sky Blue */
--info-light: hsl(199 89% 95%)
```

### Rating Color Scale
```css
/* For scores -100 to +100 */
--score-very-negative: hsl(0 84.2% 60.2%)    /* -100 to -60 */
--score-negative: hsl(14 91.9% 68.6%)        /* -60 to -30 */
--score-neutral: hsl(45.4 93.4% 47.5%)       /* -30 to +30 */
--score-positive: hsl(142.1 76.2% 55%)       /* +30 to +60 */
--score-very-positive: hsl(142.1 76.2% 36.3%)/* +60 to +100 */
```

### Neutral Colors
```css
--background: hsl(0 0% 100%)
--foreground: hsl(222.2 84% 4.9%)
--muted: hsl(210 40% 96.1%)
--muted-foreground: hsl(215.4 16.3% 46.9%)
--border: hsl(214.3 31.8% 91.4%)
--input: hsl(214.3 31.8% 91.4%)
```

---

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto',
             'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans',
             'Helvetica Neue', sans-serif;
```

### Type Scale
```css
--text-xs: 0.75rem;    /* 12px - Captions, labels */
--text-sm: 0.875rem;   /* 14px - Body small, helper text */
--text-base: 1rem;     /* 16px - Body text */
--text-lg: 1.125rem;   /* 18px - Large body, subtitles */
--text-xl: 1.25rem;    /* 20px - Section headings */
--text-2xl: 1.5rem;    /* 24px - Card titles */
--text-3xl: 1.875rem;  /* 30px - Page titles */
--text-4xl: 2.25rem;   /* 36px - Hero text */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.75; /* Large text blocks */
```

---

## Spacing System

### Base Unit: 4px
```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
--space-10: 2.5rem;  /* 40px */
--space-12: 3rem;    /* 48px */
--space-16: 4rem;    /* 64px */
```

### Usage Guidelines
- Tiny elements (icons, badges): space-1, space-2
- Component padding: space-4, space-6
- Section spacing: space-8, space-12
- Page margins: space-12, space-16

---

## Border Radius

```css
--radius-sm: 0.25rem;  /* 4px - Small elements */
--radius: 0.5rem;      /* 8px - Default */
--radius-md: 0.75rem;  /* 12px - Cards */
--radius-lg: 1rem;     /* 16px - Large cards */
--radius-xl: 1.5rem;   /* 24px - Feature elements */
--radius-full: 9999px; /* Fully rounded - Pills, avatars */
```

---

## Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

### Usage
- Cards: shadow-sm or shadow
- Dropdowns: shadow-md
- Modals: shadow-lg
- Feature elements: shadow-xl

---

## Component Architecture

### Atomic Design Structure

```
components/
├── ui/              # Atomic components (shadcn/ui)
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── badge.tsx
│   └── ...
├── charts/          # Chart components
│   ├── LineChart.tsx
│   ├── BarChart.tsx
│   ├── RadarChart.tsx
│   └── PieChart.tsx
├── analysis/        # Analysis-specific components
│   ├── ScoreCard.tsx
│   ├── StepCard.tsx
│   ├── RatingBadge.tsx
│   ├── MetricRow.tsx
│   └── ComparisonTable.tsx
├── layout/          # Layout components
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── Container.tsx
│   └── Section.tsx
├── forms/           # Form components
│   ├── CompanySearchForm.tsx
│   ├── FilterForm.tsx
│   └── SettingsForm.tsx
└── features/        # Feature-specific composites
    ├── AnalysisForm.tsx
    ├── AnalysisResults.tsx
    ├── EvaluationsList.tsx
    ├── Dashboard.tsx
    └── ComparisonView.tsx
```

---

## Key UI Components

### 1. Score Display

**Purpose**: Show numerical scores with visual context

```tsx
interface ScoreDisplayProps {
  score: number;        // -100 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showTrend?: boolean;
  previousScore?: number;
}

// Visual: Colored number with optional arrow
// +85 ↑ (very positive - dark green)
// -45 ↓ (negative - red)
```

**Variants**:
- Inline: Small, single line
- Card: Medium, with label
- Hero: Large, prominent display

---

### 2. Rating Badge

**Purpose**: Show buy/hold/sell recommendation

```tsx
interface RatingBadgeProps {
  rating: 'buy' | 'hold' | 'sell';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  confidence?: number; // 0-100
}

// Visual: Colored badge with icon
// [↑ BUY] (green)
// [− HOLD] (amber)
// [↓ SELL] (red)
```

---

### 3. Analysis Step Card

**Purpose**: Display results from one analysis step

```tsx
interface AnalysisStepCardProps {
  step: AnalysisStep;
  expanded?: boolean;
  onExpand?: () => void;
}

// Structure:
// ┌─────────────────────────────────────┐
// │ [Icon] Financial Statements    [+85]│
// │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
// │ Sentiment: POSITIVE ●               │
// │                                      │
// │ Strong balance sheet with...        │
// │                                      │
// │ Key Points:                         │
// │ • Low debt-to-equity ratio          │
// │ • Increasing cash reserves          │
// │ • Consistent revenue growth         │
// │                                      │
// │ [View Details]                      │
// └─────────────────────────────────────┘
```

**States**:
- Collapsed: Shows score and status
- Expanded: Shows full analysis
- Loading: Shows skeleton
- Error: Shows error message

---

### 4. Metric Row

**Purpose**: Display single financial metric

```tsx
interface MetricRowProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  comparison?: {
    value: number;
    label: string;
  };
  tooltip?: string;
}

// Visual:
// P/E Ratio        25.3x   ↑ vs Industry: 18.2x  [i]
```

---

### 5. Progress Indicator

**Purpose**: Show analysis progress

```tsx
interface ProgressIndicatorProps {
  total: number;
  completed: number;
  current?: string;
  steps?: Array<{
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
  }>;
}

// Visual:
// Analysis Progress: 3 / 6 completed
// [████████░░░░░░░░] 50%
// Currently analyzing: Market Sentiment
//
// ✓ Financial Statements
// ✓ Quarterly Results
// ⟳ Market Sentiment (in progress)
// ○ News Analysis
// ○ Analyst Reports
// ○ Competitive Positioning
```

---

### 6. Comparison Table

**Purpose**: Compare multiple companies side-by-side

```tsx
interface ComparisonTableProps {
  companies: Company[];
  metrics: Metric[];
  highlightBest?: boolean;
  sortable?: boolean;
}

// Visual:
// ┌──────────────┬─────────┬─────────┬─────────┐
// │ Metric       │ AAPL    │ MSFT    │ GOOGL   │
// ├──────────────┼─────────┼─────────┼─────────┤
// │ P/E Ratio    │ 28.5    │ 32.1    │ 25.3 ✓  │
// │ Revenue Grw  │ 15% ✓   │ 12%     │ 14%     │
// │ Profit Mrgn  │ 26.5%   │ 33.4% ✓ │ 27.5%   │
// └──────────────┴─────────┴─────────┴─────────┘
```

---

### 7. Timeline View

**Purpose**: Show evaluation history over time

```tsx
interface TimelineViewProps {
  evaluations: Evaluation[];
  companyId: number;
}

// Visual:
// 2024 ─●─────●─────●──────●─────> Now
//       │     │     │      │
//      BUY  HOLD  BUY   SELL
//      +75   +15  +55   -40
```

---

### 8. Chart Container

**Purpose**: Wrapper for all charts with consistent styling

```tsx
interface ChartContainerProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  error?: string;
  height?: number;
}

// Features:
// - Responsive sizing
// - Loading skeleton
// - Error state
// - Export button
// - Fullscreen option
```

---

## Page Layouts

### 1. Dashboard (Homepage)

```
┌─────────────────────────────────────────────────┐
│ Header                                    [User] │
├────────────┬────────────────────────────────────┤
│            │                                     │
│  Sidebar   │  Main Content Area                 │
│            │                                     │
│  • Home    │  ┌──────────────────────────────┐ │
│  • Search  │  │ Quick Analysis               │ │
│  • Watch   │  │ [Company Name]  [Analyze]    │ │
│  • History │  └──────────────────────────────┘ │
│            │                                     │
│            │  Recent Evaluations                │
│            │  ┌────┐ ┌────┐ ┌────┐            │
│            │  │Card│ │Card│ │Card│            │
│            │  └────┘ └────┘ └────┘            │
│            │                                     │
│            │  Watchlist                         │
│            │  [Company list...]                 │
│            │                                     │
└────────────┴────────────────────────────────────┘
```

---

### 2. Analysis Page

```
┌─────────────────────────────────────────────────┐
│ Header     [Apple Inc. (AAPL)]           [User] │
├────────────┬────────────────────────────────────┤
│            │ ┌────────────────────────────────┐│
│  Analysis  │ │ Overall Rating: BUY      +85   ││
│  Steps     │ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ││
│            │ │ Analysis Progress: 6/6 ✓       ││
│ ✓ Financial│ └────────────────────────────────┘│
│ ✓ Quarterly│                                    │
│ ✓ Sentiment│ ┌────────────────────────────────┐│
│ ✓ News     │ │ Financial Statements    +90    ││
│ ✓ Analysts │ │ POSITIVE ●                     ││
│ ✓ Compete  │ │ Strong balance sheet...        ││
│            │ │ [Expand]                        ││
│ [Update]   │ └────────────────────────────────┘│
│ [Export]   │                                    │
│            │ ┌────────────────────────────────┐│
│            │ │ Quarterly Results       +75    ││
│            │ │ POSITIVE ●                     ││
│            │ │ Beat estimates...              ││
│            │ └────────────────────────────────┘│
│            │                                    │
│            │ [More cards...]                    │
│            │                                    │
└────────────┴────────────────────────────────────┘
```

---

### 3. Comparison Page

```
┌─────────────────────────────────────────────────┐
│ Header     Compare: AAPL vs MSFT vs GOOGL [User]│
├──────────────────────────────────────────────────┤
│                                                  │
│  [Select Companies]  [Add]  [Export]             │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Overall Rating                             │ │
│  │ ──────────────────────────────────────────│ │
│  │ AAPL: BUY (+85) ████████░░                │ │
│  │ MSFT: BUY (+70) ███████░░░                │ │
│  │ GOOGL: HOLD (+25) ██████░░░░              │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Radar Chart                                │ │
│  │         Financials                         │ │
│  │            /|\                             │ │
│  │           / | \                            │ │
│  │  Risk ───────── Growth                     │ │
│  │           \ | /                            │ │
│  │            \|/                             │ │
│  │         Valuation                          │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │ Metric          AAPL    MSFT    GOOGL      │ │
│  │ ─────────────────────────────────────────  │ │
│  │ P/E Ratio       28.5    32.1    25.3 ✓    │ │
│  │ Market Cap      2.8T ✓  2.5T    1.7T      │ │
│  │ Revenue Growth  15% ✓   12%     14%       │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## Interaction Patterns

### 1. Progressive Disclosure
- Show summary by default
- "View Details" expands full information
- Breadcrumbs for navigation context
- Tooltips for explanations

### 2. Optimistic Updates
- Show expected state immediately
- Update with real data when available
- Show loading only for slow operations
- Revert on error with notification

### 3. Contextual Actions
- Actions appear on hover
- Quick actions in cards
- Bulk actions with selection
- Keyboard shortcuts

### 4. Feedback Patterns
- Toast for transient messages
- Modal for important confirmations
- Inline validation
- Progress indicators for long operations

---

## Responsive Breakpoints

```css
/* Mobile First Approach */
@media (min-width: 640px)  { /* sm - Small tablet */ }
@media (min-width: 768px)  { /* md - Tablet */ }
@media (min-width: 1024px) { /* lg - Desktop */ }
@media (min-width: 1280px) { /* xl - Large desktop */ }
@media (min-width: 1536px) { /* 2xl - Extra large */ }
```

### Layout Changes by Breakpoint

**Mobile (< 640px)**:
- Single column layout
- Collapsible sidebar (drawer)
- Stack all cards vertically
- Simplified charts
- Bottom navigation bar

**Tablet (640px - 1024px)**:
- Two column where appropriate
- Persistent sidebar
- Side-by-side comparison limited to 2
- Full-featured charts

**Desktop (> 1024px)**:
- Three column layouts
- Full sidebar with labels
- Up to 4 companies in comparison
- Rich interactive charts
- Keyboard shortcuts enabled

---

## Accessibility Guidelines

### Color Contrast
- All text meets WCAG AA standard (4.5:1)
- Important elements meet AAA (7:1)
- Don't rely solely on color
- Use icons + color for status

### Keyboard Navigation
- Tab through all interactive elements
- Escape closes modals/dropdowns
- Enter/Space activates buttons
- Arrow keys for lists/menus

### Screen Readers
- Semantic HTML (header, nav, main, section)
- ARIA labels for icons
- ARIA live regions for dynamic content
- Skip links to main content

### Focus Indicators
- Visible focus ring (2px solid)
- High contrast focus indicators
- Focus trap in modals
- Logical focus order

---

## Animation & Transitions

### Duration
```css
--duration-fast: 150ms;    /* Hover states */
--duration-normal: 300ms;  /* Most transitions */
--duration-slow: 500ms;    /* Page transitions */
```

### Easing
```css
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

### Usage
- Button hover: fast + ease-out
- Card hover: normal + ease-out
- Modal open: normal + ease-out
- Page transition: slow + ease-in-out
- Skip animations for prefers-reduced-motion

---

## Loading States

### Skeleton Screens
```tsx
// Replace content with placeholder
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4" />
  <div className="h-4 bg-muted rounded w-1/2 mt-2" />
</div>
```

### Spinners
- Small: 16px (inline)
- Medium: 24px (buttons)
- Large: 48px (page loading)

### Progress Bars
- Determinate: Show percentage
- Indeterminate: Show activity
- Multi-step: Show steps

---

## Error States

### Error Hierarchy
1. **Inline**: Field-level validation errors
2. **Banner**: Page-level errors (dismissible)
3. **Modal**: Critical errors requiring action
4. **Toast**: Transient error notifications

### Error Messages
```tsx
// Good: Specific and actionable
"Company not found. Please check the ticker symbol."

// Bad: Vague and unhelpful
"An error occurred."
```

---

## Data Freshness Indicators

```tsx
// Show when data was last updated
<Badge variant="outline" className="text-xs">
  Updated 5 minutes ago
</Badge>

// Color coding
// < 5 min: green
// 5-30 min: amber
// > 30 min: red
// > 24 hours: gray "Stale data"
```

---

## Implementation Checklist

### For Each New Component
- [ ] Follows naming convention (PascalCase)
- [ ] Has TypeScript props interface
- [ ] Includes prop documentation
- [ ] Supports all sizes (sm, md, lg)
- [ ] Has hover/focus/active states
- [ ] Supports dark mode
- [ ] Is keyboard accessible
- [ ] Has loading state
- [ ] Has error state
- [ ] Is mobile responsive
- [ ] Has Storybook story (if applicable)
- [ ] Has unit tests

### For Each New Page
- [ ] Has proper title/meta tags
- [ ] Has loading skeleton
- [ ] Has error boundary
- [ ] Has empty state
- [ ] Is keyboard navigable
- [ ] Is screen reader friendly
- [ ] Works on mobile
- [ ] Works in dark mode
- [ ] Has proper layout structure
- [ ] Follows responsive breakpoints

---

## Future Enhancements

### Advanced Visualizations
- 3D charts for complex data
- Interactive financial statements
- Animated transitions between states
- Real-time data streaming

### Personalization
- Customizable dashboard
- Saved layouts
- Color scheme preferences
- Metric preferences

### Advanced Interactions
- Drag-and-drop reordering
- Inline editing
- Collaborative features
- Voice commands

---

This design system should evolve as the application grows. Update this document when adding new patterns or making design decisions.
