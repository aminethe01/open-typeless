Check if the code you just wrote follows the frontend development guidelines.

Execute these steps:
1. Run `git status` to see modified files
2. Read `.trellis/spec/frontend/index.md` to understand which guidelines apply
3. Based on what you changed, read the relevant guideline files:
   - Component changes → `.trellis/spec/frontend/component-guidelines.md`
   - Hook changes → `.trellis/spec/frontend/hook-guidelines.md`
   - State changes → `.trellis/spec/frontend/state-management.md`
   - Type changes → `.trellis/spec/frontend/type-safety.md`
   - Any changes → `.trellis/spec/frontend/quality-guidelines.md`
   - IPC/Window changes → `.trellis/spec/frontend/ipc-electron.md`
4. Review your code against the guidelines
5. **Multi-Window Checklist** (if applicable):
   - [ ] IPC sends to correct window(s)? Use `broadcastToAllWindows()` if multiple windows need the data
   - [ ] Tool windows use `focusable: false`?
   - [ ] Tool windows use `showInactive()` instead of `show()`?
   - [ ] Vite dev URL explicitly loads correct HTML file?
6. **Window Lifecycle Checklist** (if applicable):
   - [ ] `show()` is idempotent? (no side effects when already visible)
   - [ ] Size reset happens BEFORE showing, not after hiding?
   - [ ] Hide happens BEFORE notifying renderer of hide-triggering state?
   - [ ] Height changes use debouncing to prevent jitter?
7. Report any violations and fix them if found
