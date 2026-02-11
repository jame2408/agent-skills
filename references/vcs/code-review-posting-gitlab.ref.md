# Code Review: GitLab MR Posting

Code Review Skill 在 **MR Mode (GitLab)** 發布留言時使用。詳見 `vcs-platform-commands.ref.md` 的 Platform Detection 與 Posting Comments 區塊。

---

## GitLab CLI Quick Reference

### Essential Commands

```bash
# View MR details (需先清除 Proxy)
$env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""; $env:NO_PROXY = "*"
glab mr view <ID>
glab mr view <ID> -F json

# View diff
glab mr diff <ID>

# Cross-repo
glab mr view <ID> -R "group/namespace/project"
```

### API Queries

```bash
# Get MR changes
glab api projects/:fullpath/merge_requests/<ID>/changes

# List comments
glab api projects/:fullpath/merge_requests/<ID>/notes
```

---

## PowerShell 發布 MR 留言（重要）

### 已知問題

使用 `glab mr note` 或 `glab api -X POST` 在 PowerShell 環境下可能遇到以下問題：

| 問題 | 原因 | 解決方案 |
|------|------|----------|
| Proxy 連線被拒絕 | 系統層級 Proxy 設定干擾 | 清除 `$env:HTTP_PROXY` 等變數 |
| Here-String 語法錯誤 | PowerShell `@"..."@` 解析問題 | 改用檔案方式 |
| glab JSON 解析失敗 | glab CLI 的 bug（`cannot unmarshal array`） | 改用 `Invoke-RestMethod` |
| POST 變成 GET | HTTP → HTTPS 重導向導致 | 直接使用 HTTPS |
| **Markdown 程式碼區塊格式錯誤** | **Here-String 中反引號 `` ` `` 是轉義字元，`` ``` `` 會變成 `` ` ``** | **必須使用檔案方式** |

### ⚠️ 重要：Markdown 程式碼區塊問題

**問題描述**：在 PowerShell Here-String `@"..."@` 中，反引號 `` ` `` 是轉義字元。

```powershell
# ❌ 錯誤：Here-String 中的 ``` 會被解析為單個 `
$comment = @"
```csharp
// 這段程式碼區塊會變成 `csharp ... `，格式錯誤
```
"@

# 結果：GitLab 顯示為 `csharp ... ` 而非程式碼區塊
```

**解決方案**：將留言內容寫入暫存檔案，再讀取發送。

### 正確的 PowerShell 指令模板（推薦）

```powershell
# 1. 清除 Proxy 環境變數
$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:NO_PROXY = "*"

# 2. 將留言內容寫入暫存檔案（保留 Markdown 格式）
# 注意：使用 Write 工具寫入檔案，而非 Here-String
# 檔案內容可包含 ```csharp 等程式碼區塊，不會被轉義

# 3. 讀取留言內容（從檔案）
$body = Get-Content -Path "comment.md" -Raw -Encoding UTF8

# 4. 使用 Invoke-RestMethod（必須用 HTTPS）
Invoke-RestMethod `
    -Uri "https://<GITLAB_HOST>/api/v4/projects/<PROJECT_PATH_ENCODED>/merge_requests/<MR_ID>/notes" `
    -Method POST `
    -Headers @{"PRIVATE-TOKEN" = $env:GITLAB_TOKEN} `
    -Form @{body = $body} `
    -NoProxy `
    -SkipCertificateCheck

# 5. 清理暫存檔案
Remove-Item -Path "comment.md" -Force
```

### 關鍵注意事項

1. **必須使用 HTTPS**：HTTP 會被重導向，導致 POST 變成 GET
2. **必須清除 Proxy**：設定 `$env:HTTP_PROXY = ""`
3. **必須加 `-NoProxy`**：避免 PowerShell 使用系統 Proxy
4. **必須加 `-SkipCertificateCheck`**：內部 GitLab 通常使用自簽憑證
5. **使用 `-Form` 而非 `-Body`**：避免 JSON 編碼問題
6. **⚠️ 含程式碼區塊的留言必須用檔案方式**：避免反引號轉義問題

### 變數提取邏輯

執行 `glab mr view <ID> -F json` 取得 MR 資訊後，提取以下變數：

```powershell
# 從 glab mr view 輸出提取
$mrJson = glab mr view <ID> -F json | ConvertFrom-Json

# <GITLAB_HOST> - 從 web_url 提取主機名
$gitlabHost = ([System.Uri]$mrJson.web_url).Host

# <PROJECT_PATH_ENCODED> - 從 references.full 提取並 URL encode
$projectPath = $mrJson.references.full -replace '!.*$', '' -replace '^/', ''
$projectPathEncoded = [System.Web.HttpUtility]::UrlEncode($projectPath)

# <MR_ID> - 直接使用 iid
$mrId = $mrJson.iid
```

或從 git remote 提取：

```powershell
# 從 git remote 取得 GitLab host
$remoteUrl = git remote get-url origin
$gitlabHost = ([System.Uri]$remoteUrl).Host
```

### 範例：發布 Code Review 留言（含程式碼區塊）

**Step 1**: 使用 Write 工具建立留言檔案 `mr_comment.md`：

````markdown
## 🐛 Bug - 問題描述

**檔案：** `SomeFile.cs`

問題說明...

```csharp
// 問題程式碼
if (patch == null)
{
    return null;  // ⚠️ 資料將被清空
}
```

### 建議
修正方式...

---
🤖 AI Code Review
````

**Step 2**: 執行 PowerShell 指令發布留言：

```powershell
$env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""; $env:NO_PROXY = "*"

$body = Get-Content -Path "mr_comment.md" -Raw -Encoding UTF8

Invoke-RestMethod `
    -Uri "https://<GITLAB_HOST>/api/v4/projects/<PROJECT_PATH_ENCODED>/merge_requests/<MR_ID>/notes" `
    -Method POST `
    -Headers @{"PRIVATE-TOKEN" = $env:GITLAB_TOKEN} `
    -Form @{body = $body} `
    -NoProxy `
    -SkipCertificateCheck

# 清理暫存檔
Remove-Item -Path "mr_comment.md" -Force
```

### 批次發布多則留言

```powershell
$env:HTTP_PROXY = ""; $env:HTTPS_PROXY = ""; $env:NO_PROXY = "*"

# 假設已用 Write 工具建立 mr_comment_1.md ~ mr_comment_5.md
for ($i = 1; $i -le 5; $i++) {
    $body = Get-Content -Path "mr_comment_$i.md" -Raw -Encoding UTF8
    
    Invoke-RestMethod `
        -Uri "https://<GITLAB_HOST>/api/v4/projects/<PROJECT_PATH_ENCODED>/merge_requests/<MR_ID>/notes" `
        -Method POST `
        -Headers @{"PRIVATE-TOKEN" = $env:GITLAB_TOKEN} `
        -Form @{body = $body} `
        -NoProxy `
        -SkipCertificateCheck
    
    Write-Host "Posted comment $i"
}

# 清理暫存檔
Remove-Item -Path "mr_comment_*.md" -Force
```
