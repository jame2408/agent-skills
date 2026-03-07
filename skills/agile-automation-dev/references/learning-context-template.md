# Learning Context Template

每次開發迴圈的 Phase 4 完成後，依此範本產出學習筆記。此筆記連同累積的 Instinct 將作為下一輪迴圈 Phase 1 的 Context 輸入。

## 格式

```markdown
# 學習筆記 — [功能名稱] ([日期])

## 迴圈摘要
- 實例化需求：[一句話描述本次需求]
- 影響範圍：[修改的模組/檔案]
- 迴圈次數：第 N 輪

## 本輪 Instinct

### 新增

（以下為新萃取的 Instinct，每條一個 YAML 區塊）

---
id: [kebab-case 識別碼]
trigger: "[觸發情境]"
confidence: [0.3-0.9]
domain: [architecture|code-style|testing|security|workflow|debugging]
scope: [project|global]
---
# [Instinct 標題]
## 行動
[具體行動描述]
## 證據
- [來源觀察 1]
- [來源觀察 2]

### 更新

- `[instinct-id]`: 信心度 [舊值] → [新值]（原因：[驗證/矛盾描述]）

## 問題與解決
- 問題：[遭遇的問題]
- 解決：[如何解決]
- 對應 Instinct：`[instinct-id]`

## 下輪建議
- [對下一個開發迴圈的建議或注意事項]
```

## 使用方式

1. Phase 4 完成時，依上述格式填寫學習筆記
2. 新增的 Instinct 以 YAML 格式嵌入筆記中
3. 既有 Instinct 若有信心度變動，記錄於「更新」區段
4. 若使用者有下一個需求，將此筆記 + 累積 Instinct 附加到下一輪 Phase 1 的 Context 中
5. 多輪迴圈的 Instinct 持續累積，信心度隨驗證演化
