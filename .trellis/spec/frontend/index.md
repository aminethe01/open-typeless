# Frontend Development Guidelines

> Best practices for Electron renderer process development in open-typeless.

---

## Overview

The frontend (renderer process) provides:
- Floating window showing recording status
- Real-time transcription display (interim + final results)
- Settings/preferences UI (if needed)

---

## Guidelines Index

### Core Patterns

| Guide | Description | Priority |
|-------|-------------|----------|
| [IPC & Electron](./ipc-electron.md) | IPC communication, multi-window broadcast, tool windows | HIGH |
| [Window Lifecycle](./window-lifecycle.md) | Window visibility, state-driven show/hide, height adaptation | HIGH |
| [Directory Structure](./directory-structure.md) | React component organization | MEDIUM |
| [State Management](./state-management.md) | Context patterns, local/global state | MEDIUM |
| [React Pitfalls](./react-pitfalls.md) | Common bugs and how to avoid them | MEDIUM |

### Multi-Window Development

When developing multi-window Electron apps (main window + floating window):

**Vite Configuration**:
- Each window needs its own entry in `forge.config.ts` renderer array
- Dev server assigns different ports (5173, 5174, etc.)
- Must explicitly load correct HTML: `devUrl + '/floating.html'`

```typescript
// WRONG: Loads index.html (main window content)
floatingWindow.loadURL(FLOATING_WINDOW_VITE_DEV_SERVER_URL);

// CORRECT: Explicitly load floating.html
const devUrl = FLOATING_WINDOW_VITE_DEV_SERVER_URL.replace(/\/$/, '');
floatingWindow.loadURL(`${devUrl}/floating.html`);
```

**IPC Considerations**:
- See [IPC & Electron](./ipc-electron.md) for multi-window broadcast pattern
- See [IPC & Electron](./ipc-electron.md) for tool window pattern (focusable: false)

---

## Quick Reference

### IPC Communication

```typescript
// Renderer → Main
window.electron.ipcRenderer.invoke('channel-name', data)

// Main → Renderer (subscriptions)
window.electron.ipcRenderer.on('event-name', callback)
```

### Key UI States

| State | Display |
|-------|---------|
| Idle | Hidden or minimal indicator |
| Listening | "● Listening..." with animation |
| Processing | Show interim transcription |
| Complete | Final text (auto-hide after paste) |
| Error | Error message with retry option |

---

**Language**: All documentation is in **English**.
