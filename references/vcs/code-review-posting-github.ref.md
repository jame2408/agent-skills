# Code Review: GitHub PR Posting

Code Review Skill 在 **PR Mode (GitHub)** 發布留言時使用。詳見 `vcs-platform-commands.ref.md` 的 Platform Detection 與 Posting Comments 區塊。

---

## GitHub CLI Quick Reference

### Essential Commands

```bash
# View PR details
gh pr view <ID>
gh pr view <ID> --json title,body,isDraft,state,url,repository

# View diff
gh pr diff <ID>

# Checkout branch
gh pr checkout <ID>

# Cross-repo
gh pr view <ID> -R owner/repo
```

---

## Posting PR Comments

### Option 1: GitHub CLI (Simplest)

```bash
# Post comment from stdin
gh pr comment <ID> --body-file comment.md

# Or from literal
gh pr comment <ID> --body "Your comment here"
```

> Use `--body-file` to avoid escaping issues with code blocks in Markdown.

### Option 2: GitHub REST API (PowerShell)

When `gh pr comment` is not sufficient (e.g., custom formatting, batch posting):

**Endpoint**: `POST /repos/{owner}/{repo}/issues/{issue_number}/comments`  
> Note: PRs use the Issues API; the PR number equals the issue number.

**Auth**: `Authorization: Bearer $env:GITHUB_TOKEN` or `$env:GH_TOKEN`

```powershell
# 1. Get repo owner/name from git remote or gh pr view
$repo = gh pr view <ID> --json repository -q '.repository.nameWithOwner'
# e.g. "owner/repo"

# 2. Read comment from file
$body = Get-Content -Path "comment.md" -Raw -Encoding UTF8

# 3. POST comment
$uri = "https://api.github.com/repos/$repo/issues/<ID>/comments"
Invoke-RestMethod `
    -Uri $uri `
    -Method POST `
    -Headers @{
        "Authorization" = "Bearer $env:GITHUB_TOKEN"
        "Accept" = "application/vnd.github.v3+json"
    } `
    -ContentType "application/json" `
    -Body (@{body = $body} | ConvertTo-Json)
```

### Markdown Code Blocks

Unlike GitLab + PowerShell, GitHub API accepts JSON body directly. No Here-String escaping issue when using `ConvertTo-Json` for the body. For complex Markdown with code blocks, use a file:

```powershell
$bodyContent = Get-Content -Path "comment.md" -Raw
$jsonBody = @{body = $bodyContent} | ConvertTo-Json
Invoke-RestMethod -Uri $uri -Method POST -Headers $headers -ContentType "application/json" -Body $jsonBody
```

---

## Variable Extraction

From `gh pr view <ID> --json repository,number`:

```powershell
$prJson = gh pr view <ID> --json repository,number | ConvertFrom-Json
$owner = $prJson.repository.owner.login
$repo = $prJson.repository.name
$prNumber = $prJson.number
# API URL: https://api.github.com/repos/$owner/$repo/issues/$prNumber/comments
```
