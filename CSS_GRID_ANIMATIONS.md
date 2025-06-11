# CSS Grid Reference Guide

## Part 1: Animation Capabilities

### Overview
CSS Grid's `grid-template-rows` and `grid-template-columns` properties are now animatable in all major browsers. This document provides examples and techniques for implementing smooth grid transitions.

### Core Concepts

1. **Animatable Properties**
   - `grid-template-columns`
   - `grid-template-rows`

2. **Implementation Requirements**
   - Must specify a transition on the grid container
   - All columns/rows must exist in both states (even if 0fr)
   - Units must be declared even for zero values

## Example 1: Expanding Sidebar

Create a sidebar that expands on hover:

```html
<div class="grid">
  <div class="left"></div>
  <div class="right"></div>
</div>
```

```css
.grid {
  display: grid;
  grid-template-columns: 48px auto;
  transition: 300ms;
}

/* Using :has() parent selector */
.grid:has(.left:hover) {
  grid-template-columns: 30% auto;
}

/* Alternative using CSS variables */
.grid {
  display: grid;
  transition: 300ms;
  grid-template-columns: var(--left, 48px) auto;
}

.grid:has(.left:hover) {
  --left: 30%;
}
```

## Example 2: Expanding Panels

Create panels that expand on hover with color transitions:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr; /* Specify each column individually */
  transition: 300ms;
}

.grid:has(.panel:hover) {
  /* Target specific column based on which panel is hovered */
  grid-template-columns: 0.5fr 2fr 0.5fr; /* When middle panel is hovered */
}

/* Also transition panel colors */
.panel {
  transition: background-color 300ms;
}

.panel:hover {
  background-color: var(--hover-color);
}
```

## Example 3: Adding Columns/Rows

Animate the appearance of a "new" column:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 0fr; /* Note: must include 0fr, not omit the column */
  transition: grid-template-columns 300ms;
}

.grid.expanded {
  grid-template-columns: 1fr 1fr 1fr;
}
```

## Important Tips

1. **All Columns Must Exist**
   - Don't use `display: none` for hidden columns
   - Always include the column with `0fr` sizing
   - Example: `grid-template-columns: 1fr 1fr 0fr` → `grid-template-columns: 1fr 1fr 1fr`

2. **Avoid `repeat()` Function**
   - The `repeat()` function can produce buggy transitions
   - Instead, define each column size individually
   - Example: Use `grid-template-columns: 1fr 1fr 1fr` instead of `grid-template-columns: repeat(3, 1fr)`

3. **Parent Selector**
   - Use `:has()` to target the grid container when a child is hovered
   - Example: `.grid:has(.column:hover)` targets the grid when any column is hovered

4. **CSS Variables**
   - CSS variables make transitions cleaner and more maintainable
   - Example: `grid-template-columns: var(--col1, 1fr) var(--col2, 1fr)`

## Browser Support

All three major browsers (Chrome, Firefox, Safari) now support animating CSS Grid properties. However, older versions of Android browser don't support Grid, and IE implemented a previous version of the specification that differs significantly.

## Part 2: Layout Implementation

### Basic Grid Layout Concepts

CSS Grid allows you to split a container into rows and columns and define how its children should fit inside. Instead of thinking about coordinates of individual elements, you think about the behavior of their parent container.

#### Traditional Approaches vs. Grid

**Absolute Positioning (Old Way):**
```css
#header {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 75px;
}
#sidebar {
  position: absolute;
  top: 75px;
  bottom: 0;
  left: 0;
  width: 350px;
}
#content {
  position: absolute;
  top: 75px;
  right: 0;
  bottom: 0;
  left: 350px;
}
```

**CSS Grid (New Way):**
```css
body {
  display: grid;
  grid-template-rows: 75px auto;
  grid-template-columns: 350px auto;
}
#header {
  grid-row: 1;
  grid-column: 1/3; /* spans columns 1 & 2 */
}
#sidebar {
  grid-row: 2;
  grid-column: 1;
}
#content {
  grid-row: 2;
  grid-column: 2;
}
```

### Using Named Grid Areas

Instead of using row and column numbers, you can create a visual ASCII-art-like layout using named areas:

```css
body {
  display: grid;
  grid-template-rows: 75px auto;
  grid-template-columns: 350px auto;
  grid-template-areas: 'header header'
                     'sidebar content';
}
#header {
  grid-area: header;
}
#sidebar {
  grid-area: sidebar;
}
#content {
  grid-area: content;
}
```

Rearranging elements becomes as simple as changing the grid-template-areas:

```css
/* Header on left, content spanning both rows */
body {
  grid-template-areas: 'header content'
                     'sidebar content';
}

/* Sidebar on right spanning both rows */
body {
  grid-template-areas: 'header sidebar'
                     'content sidebar';
}
```

### Responsive Design with Grid

For responsive designs, start with a linear mobile-first layout, then use Grid for larger resolutions:

```css
/* Mobile-first base layout */
body {
  display: block; /* linear layout for non-supporting browsers */
}

/* Desktop grid layout */
@media (min-width: 768px) {
  body {
    display: grid;
    grid-template-rows: 75px auto;
    grid-template-columns: 350px auto;
    grid-template-areas: 'header header'
                       'sidebar content';
  }
}
```

### Additional Grid Features

1. **Grid gaps** - Add spacing between cells:
   ```css
   body {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
     grid-gap: 10px;
   }
   ```

2. **Nested grids** - Create grids inside grid cells:
   ```css
   .grid-cell {
     display: grid;
     grid-template-columns: 1fr 1fr;
   }
   ```

3. **Repeat function** - Define multiple rows or columns at once:
   ```css
   .gallery {
     display: grid;
     grid-template-columns: repeat(3, 1fr);
   }
   ```

### Implementation Notes

1. When transitioning to Grid, consider progressive enhancement
2. For animations, note that some older browsers might not support them
3. Browser developer tools often show helpful grid lines to aid in visualization

## Part 3: Off-Canvas Sidebars with CSS Grid

### Traditional Approach Problems

Common off-canvas sidebar implementations typically use:
- `position: fixed` or `absolute` positioning
- Manual management of heights, widths, and z-index
- Media queries to adjust for different screen sizes
- JavaScript to handle toggling and transitions

These approaches require managing sizing in multiple places and can be difficult to maintain.

### Grid-Based Off-Canvas Technique

A more elegant approach uses overlapping grid items:

```css
.grid-container {
  display: grid;
  /* Define a sidebar area and content area */
  grid-template-columns: minmax(auto, 500px) 1fr;
  grid-template-areas: "sidebar content";
}

/* Sidebar stays in its grid area */
.sidebar {
  grid-area: sidebar;
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

/* Content spans both areas */
.content {
  grid-area: sidebar-start / sidebar-start / content-end / content-end;
  /* This makes content span from start of sidebar to end of content */
}

/* When sidebar is active */
.sidebar.active {
  transform: translateX(0);
}
```

### Benefits of this Approach

1. **Single source of truth** - Layout defined in one place (grid template)
2. **Automatic responsiveness** - Using `minmax()` prevents sidebar from going off-screen on mobile
3. **No fixed heights/widths** - Grid handles the sizing automatically
4. **Simpler maintenance** - Changes to the layout require updating fewer CSS rules

### Implementation Example

For our aiGM sliding panel, we could adapt this technique by having the sliding panel in its own grid area, but allowing the content to overlap that area when the panel is closed:

```css
.main-content {
  display: grid;
  grid-template-columns: minmax(auto, 450px) 250px 1fr 250px;
  grid-template-areas: "sliding player-info chat custom-user";
}

.sliding-panel {
  grid-area: sliding;
  transform: translateX(-100%);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

/* When closed, player-info+chat+custom span the sliding area too */
.player-info-panel, .chat-window-panel, .custom-user-panel {
  grid-column: sliding-start / custom-user-end;
}

/* When open, panels go back to their areas */
.main-content.sliding-panel-open .player-info-panel {
  grid-area: player-info;
}

.main-content.sliding-panel-open .chat-window-panel {
  grid-area: chat;
}

.main-content.sliding-panel-open .custom-user-panel {
  grid-area: custom-user;
}

.sliding-panel.open {
  transform: translateX(0);
}
```
