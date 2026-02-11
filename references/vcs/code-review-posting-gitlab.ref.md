# Code Review: GitLab MR Posting

Code Review Skill 在 **MR Mode (GitLab)** 發布留言時使用。詳見 `vcs-platform-commands.ref.md` 的 Platform Detection 與 Posting Comments 區塊。

---

## GitLab CLI Quick Reference

### Essential Commands

```bash
# View MR details
glab mr view <ID>
glab mr view <ID> -F json

# View diff
glab mr diff <ID>

# Cross-repo
glab mr view <ID> -R "group/namespace/project"
```

> If you hit proxy/network issues, clear proxy env vars based on your shell:
> - PowerShell: `{CONFIG_ROOT}/references/shell/powershell.ref.md`
> - bash/zsh: `{CONFIG_ROOT}/references/shell/bash.ref.md`

### API Queries

```bash
# Get MR changes
glab api projects/:fullpath/merge_requests/<ID>/changes

# List comments
glab api projects/:fullpath/merge_requests/<ID>/notes
```

---

## Posting MR Comments (Preferred: `glab api`)

Prepare `comment.md` with Markdown first.

### Option 1: `glab api` with `--raw-field` (Cross-shell, recommended)

Official options:
- `-f, --raw-field`: Add a **string** parameter (recommended for `body`)
- `-F, --field`: Add a parameter of inferred type (may treat numbers/booleans differently)
- `-X, --method`: Set HTTP method (default GET)

```bash
# bash/zsh
body="$(cat comment.md)"

glab api projects/:fullpath/merge_requests/<MR_IID>/notes --method POST -f "body=$body"
```

```powershell
# PowerShell
$body = Get-Content -Path "comment.md" -Raw -Encoding UTF8

glab api projects/:fullpath/merge_requests/<MR_IID>/notes --method POST -f "body=$body"
```

> Notes:
> - `:fullpath` placeholder is resolved from the current git repo.
> - Prefer `-f/--raw-field` for Markdown to avoid type inference surprises.

---

## Notes

- Prefer file-based authoring (`comment.md`) to keep Markdown code blocks intact.
- If you hit proxy/network issues, clear proxy env vars based on your shell (see shell refs).

---

## Batch Posting Multiple Comments (One issue per comment)

Use this mode when you want to post **N separate comments** (e.g. 2 Bugs + 3 Suggestions) so the author can reply and resolve them one-by-one.

### File Naming Convention (Recommended: scope by MR IID)

To avoid collisions across different reviews, create files under an MR-scoped directory:

- Directory: `comments/mr-<MR_IID>/`
- Files:
  - `comments/mr-<MR_IID>/bug-01.md`, `comments/mr-<MR_IID>/bug-02.md`, ...
  - `comments/mr-<MR_IID>/suggestion-01.md`, `comments/mr-<MR_IID>/suggestion-02.md`, ...

### Required: Unique Marker per Comment

At the top of each comment file, add a stable marker so a future re-review can locate it via API:

- Bug example (first line): `<!-- ai-code-review:gitlab-mr:<MR_IID>:bug-01 -->`
- Suggestion example (first line): `<!-- ai-code-review:gitlab-mr:<MR_IID>:suggestion-01 -->`

> Tip: Keep each file focused on exactly one issue.

### bash / zsh

```bash
MR_IID=<MR_IID>
dir="comments/mr-$MR_IID"

for f in "$dir"/bug-*.md "$dir"/suggestion-*.md; do
  [ -f "$f" ] || continue
  body="$(cat "$f")"
  glab api projects/:fullpath/merge_requests/$MR_IID/notes --method POST -f "body=$body"
done
```

### PowerShell

```powershell
$MR_IID = <MR_IID>
$dir = "comments\mr-$MR_IID"

Get-ChildItem "$dir\bug-*.md", "$dir\suggestion-*.md" | ForEach-Object {
  $body = Get-Content -Path $_.FullName -Raw -Encoding UTF8
  glab api projects/:fullpath/merge_requests/$MR_IID/notes --method POST -f "body=$body"
}
```
