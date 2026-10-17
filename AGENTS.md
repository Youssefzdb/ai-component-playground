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

- AI generation calls the public OpenCode Free AI API directly from the browser (it allows CORS, no key); keep its client in src/lib/opencode.ts. Why: user-requested provider, no secrets involved.
- Generated code is compiled in a sandboxed iframe (Babel standalone + esm.sh import map + Tailwind CDN) built in src/lib/preview.ts. Why: instant preview with no server build.
