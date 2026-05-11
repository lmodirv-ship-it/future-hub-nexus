---
name: No destructive operations on managed sites
description: Bulk operations from HN-Dev Control Hub must never delete or overwrite existing content in the 19 other projects
type: constraint
---
FORBIDDEN on any managed site (the 19 projects controlled from HN-Dev):
- Deleting files
- Removing existing code blocks, imports, components, routes
- Overwriting files in a way that drops existing content
- Renaming or moving files
- Replacing existing logic

ALLOWED:
- Creating brand new files (e.g. public/ads.txt if missing)
- Appending new entries to arrays (e.g. adding a script to head.scripts[])
- Adding new routes/components without touching existing ones
- Read-only operations (commit history, health checks, analytics tracking)

**Why:** User explicitly forbade any change/deletion. We only ADD improvements across all sites simultaneously from the HN-Dev control hub. Breaking this trust risks losing weeks of work across 20 production projects.

**How to apply:** Before any github.functions.ts operation on a managed repo, ensure the change is purely additive. The current `installAdSense` already follows this (creates ads.txt only if missing, appends to scripts[] array without removing entries). All future bulk tools must follow the same pattern: check-then-append, never replace.
