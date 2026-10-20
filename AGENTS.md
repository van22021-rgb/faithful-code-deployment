<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Preserve the standalone site's presentation inside SiteFrame; the same-origin bridge connects its existing controls to Cloud without duplicating the UI.
- Standalone admin renders must stay scoped to the current route and latest request; catalog refreshes redraw the active catalog without replacing unsaved admin forms, preventing stale views and navigation races.
- The root layout renders one persistent SiteFrame for / and /quan-tri; route changes only switch the frame hash (and frame hash changes sync the URL), so admin navigation never reloads the site or shows a stale second page.
- Account navigation and demo-cart navigation use separate handlers; same-route admin login closes overlays and redraws management.
- Keep favicon and sharing artwork derived from the CHÍ QUY logo; declare icons in the root and standalone document, and sharing metadata on leaf pages only, so branding works outside the iframe without altering its presentation.
- Private orders and all administrative mutations use authenticated server functions and database RLS; administrator access comes only from protected user_roles, never browser storage or signup metadata.
- Customer contact details are order snapshots, not profile records; order creation uses a validated atomic database function that derives account, demo details, total and dates server-side.
