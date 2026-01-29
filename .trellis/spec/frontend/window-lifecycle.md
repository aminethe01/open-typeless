# Window Lifecycle Management

> Best practices for managing Electron window visibility and state.

---

## Overview

Electron windows have a lifecycle that must be carefully managed to avoid visual glitches. This document covers patterns for:

- Show/hide timing
- State-driven visibility
- Height/size adaptation
- Avoiding visual artifacts

---

## Window Visibility States

```
┌─────────────┐     create()      ┌─────────────┐
│   null      │ ──────────────▶   │   hidden    │
│ (no window) │                   │  (created)  │
└─────────────┘                   └─────────────┘
                                        │
                    show()              │ show()
                  ┌─────────────────────┘
                  │
                  ▼
            ┌─────────────┐
            │   visible   │ ◀──── Status changes while visible
            │  (active)   │       (stay visible, no re-setup)
            └─────────────┘
                  │
                  │ hide()
                  ▼
            ┌─────────────┐
            │   hidden    │
            │  (ready)    │
            └─────────────┘
```

---

## Idempotent show() Pattern

### Problem

When `show()` has side effects (like resetting size), calling it multiple times causes visual glitches.

### Solution

Guard side effects with visibility check:

```typescript
class WindowManager {
  private currentHeight: number = MIN_HEIGHT;

  show(): void {
    if (!this.window) {
      this.create();
    }

    // CRITICAL: Only perform setup when transitioning to visible
    const wasVisible = this.window?.isVisible() ?? false;
    if (!wasVisible) {
      // First-time setup for this visibility session
      this.resetHeightSync();
      this.clearPreviousContent();
    }

    this.window?.showInactive();
  }

  hide(): void {
    this.window?.hide();
    // Reset tracking variables (not window size - it's hidden anyway)
    this.currentHeight = MIN_HEIGHT;
  }
}
```

---

## Height Adaptation Pattern

For windows that resize based on content (like ASR floating window):

### Architecture

```
Renderer Process                    Main Process
┌─────────────────┐                ┌─────────────────┐
│ Content changes │                │ Window Manager  │
│       │         │                │       │         │
│       ▼         │                │       │         │
│ Measure height  │   IPC call     │       │         │
│ (scrollHeight)  │ ─────────────▶ │ setContentHeight│
│                 │                │       │         │
│                 │                │       ▼         │
│                 │                │ Calculate target│
│                 │                │ height + bounds │
│                 │                │       │         │
│                 │                │       ▼         │
│                 │                │ setBounds()     │
└─────────────────┘                └─────────────────┘
```

### Key Points

1. **Measure in Renderer**: Use `requestAnimationFrame` to ensure DOM is rendered
2. **Debounce in Main**: Ignore small changes (< 4px) to prevent jitter
3. **Expand Upward**: For bottom-positioned windows, adjust Y coordinate to keep bottom edge fixed

```typescript
// Main process
setContentHeight(contentHeight: number): void {
  const targetHeight = Math.min(CHROME_HEIGHT + contentHeight, MAX_HEIGHT);

  // Debounce: ignore small changes
  if (Math.abs(targetHeight - this.currentHeight) < DEBOUNCE_THRESHOLD) {
    return;
  }

  // Expand upward (bottom edge fixed)
  const newY = screenHeight - targetHeight - BOTTOM_OFFSET;

  this.window.setBounds({
    x: bounds.x,
    y: newY,  // Y decreases as height increases
    width: WIDTH,
    height: targetHeight,
  });

  this.currentHeight = targetHeight;
}
```

---

## State-Driven Visibility

When window visibility is controlled by application state:

### Pattern

```typescript
sendStatus(status: Status): void {
  // Determine visibility based on status
  const shouldBeVisible = ['connecting', 'listening', 'processing'].includes(status);
  const shouldHide = status === 'idle';

  if (shouldBeVisible) {
    this.show();  // Idempotent - safe to call multiple times
  }

  if (shouldHide) {
    this.hide();  // Hide BEFORE notifying renderer
    return;       // Skip renderer notification
  }

  // Only notify renderer if window will remain visible
  this.window.webContents.send('status', status);
}
```

### Why Hide Before Notify?

```
WRONG order (notify then hide):
1. Send 'idle' to renderer
2. Renderer re-renders (removes content)
3. User sees empty/shrunk window (visual bounce!)
4. Window hides

CORRECT order (hide then skip notify):
1. Window hides immediately
2. User sees nothing (window is gone)
3. No notification needed - renderer state doesn't matter when hidden
```

---

## Common Pitfalls

### 1. Side Effects in show()

```typescript
// BAD: Side effect runs every call
show(): void {
  this.resetHeight();  // Runs even if already visible!
  this.window?.show();
}

// GOOD: Guard with visibility check
show(): void {
  if (!this.window?.isVisible()) {
    this.resetHeight();
  }
  this.window?.show();
}
```

### 2. Resizing Hidden Window

```typescript
// BAD: Resize while hidden (may not apply)
hide(): void {
  this.window?.hide();
  this.window?.setBounds({ height: MIN_HEIGHT });  // Might not work!
}

// GOOD: Resize before showing
show(): void {
  if (!this.window?.isVisible()) {
    this.resetHeightSync();  // Resize while still hidden but about to show
  }
  this.window?.showInactive();
}
```

### 3. Notifying Hidden Windows

```typescript
// BAD: Send state to hidden window
if (status === 'idle') {
  this.window.webContents.send('status', status);  // Causes re-render
  this.hide();  // User sees the re-render!
}

// GOOD: Skip notification when hiding
if (status === 'idle') {
  this.hide();
  return;  // Renderer state doesn't matter when hidden
}
```

---

## Checklist for Window Management

- [ ] `show()` is idempotent (no side effects when already visible)
- [ ] Size reset happens BEFORE showing, not after hiding
- [ ] Hide happens BEFORE notifying renderer of hide-triggering state
- [ ] Height changes use debouncing to prevent jitter
- [ ] Upward expansion keeps bottom edge fixed for bottom-positioned windows
- [ ] Visibility check guards all setup operations

---

**Language**: All documentation must be written in **English**.
