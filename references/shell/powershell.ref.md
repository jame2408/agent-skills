# Shell Notes: PowerShell

Use this file when a reference mentions “clear proxy” or “read content from file”.

## Clear Proxy (Optional)

If VCS CLI calls fail due to proxy/network issues:

```powershell
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:NO_PROXY = "*"
```

## Read Markdown from File into a Variable

```powershell
$body = Get-Content -Path "comment.md" -Raw -Encoding UTF8
```

## GitHub: Prefer `gh pr comment --body-file`

```powershell
gh pr comment <ID> --body-file comment.md
```

## GitLab: `glab api` POST note (preferred in this repo)

```powershell
$body = Get-Content -Path "comment.md" -Raw -Encoding UTF8

# Endpoint uses project inferred by glab via :fullpath
glab api projects/:fullpath/merge_requests/<MR_IID>/notes --method POST -f "body=$body"
```
