# Instinct 指引

Instinct（本能）是從開發迴圈中萃取的原子化學習單元。本文件說明 Instinct 的完整生命週期。

## Instinct 結構

```yaml
---
id: kebab-case-identifier       # 唯一識別碼
trigger: "觸發情境描述"          # 何時適用
confidence: 0.5                  # 信心度 (0.3-0.9)
domain: architecture             # 領域標籤
scope: project                   # project 或 global
---
# Instinct 標題
## 行動
具體應採取的行動。
## 證據
- 觀察來源 1
- 觀察來源 2
```

## 信心度評分規則

### 初始信心度（依來源類型）

- 使用者明確修正 → **0.7**（使用者直接指出的偏好）
- 錯誤解決經驗 → **0.5**（一次驗證的解法）
- 觀察到的模式 → **0.3**（初次觀察，待驗證）
- 架構決策記錄 → **0.6**（經過思考的決定）

### 信心度演化（跨迴圈）

- 下一輪驗證成功 → **+0.1**
- 下一輪出現矛盾 → **-0.15**，並記錄矛盾證據
- 連續 3 輪未觸發 → **-0.05**（衰減，避免過時知識殘留）
- 上限 **0.9**，下限 **0.3**（低於 0.3 時標記為失效，不再注入 Context）

### 信心度語意

- **0.3**：試探性，僅作為參考
- **0.5**：中等信心，可作為預設行為
- **0.7**：強信心，應主動遵循
- **0.9**：近乎確定，視為專案慣例

## 領域標籤

- **architecture**：系統架構、設計模式、模組分層
- **code-style**：命名慣例、程式碼風格、格式偏好
- **testing**：測試策略、測試模式、覆蓋率
- **security**：安全實踐、輸入驗證、權限控制
- **workflow**：開發流程、工具使用、操作順序
- **debugging**：除錯技巧、問題診斷、日誌策略

## 範疇決策指引

### project 範疇（預設）

專案特定的慣例與偏好：
- 框架/語言特定慣例（如「使用 React Hooks」「採用 Django REST 模式」）
- 檔案結構偏好（如「測試放在 `__tests__/`」）
- 程式碼風格（如「偏好函數式風格」）
- 錯誤處理策略（如「使用 Result 型別處理錯誤」）

### global 範疇

跨專案通用的最佳實踐：
- 安全實踐（如「驗證使用者輸入」「清理 SQL」）
- 通用最佳實踐（如「先寫測試」「務必處理錯誤」）
- 工具偏好（如「修改前先搜尋」「寫入前先讀取」）
- Git 實踐（如「Conventional Commits」「小而聚焦的 commit」）

**原則**：不確定時，預設為 `project`。寧可晉升太慢，也不要汙染全域空間。

## 晉升機制（project → global）

當 Instinct 滿足以下所有條件時，建議晉升為 `global`：

1. 同一模式（依 `id` 或相似 `trigger`）在 **2 個以上專案** 出現
2. 每個實例的信心度 **≥ 0.8**
3. 領域屬於 global 友善清單（security / workflow / general-best-practices）

晉升時：
- 保留最高信心度
- 合併所有證據
- 標記為 `scope: global`

## 模式偵測指引

### 1. 使用者修正

使用者糾正了 Agent 的假設、選擇或做法。

**辨識方式**：
- 使用者說「不是這樣，應該...」
- 計畫被要求調整
- 程式碼被要求改用不同方式

**範例**：
```yaml
---
id: use-value-object-for-email
trigger: "處理 Email 欄位時"
confidence: 0.7
domain: code-style
scope: project
---
# 使用 Value Object 封裝 Email
## 行動
Email 不使用 string，改用 EmailAddress Value Object。
## 證據
- 使用者在 Phase 2 修正了直接使用 string 的做法
```

### 2. 錯誤解決

開發過程中遭遇問題，並找到有效的解決方案。

**辨識方式**：
- 測試失敗後的修正
- 建置錯誤的排除
- 執行時期問題的解法

**範例**：
```yaml
---
id: mock-external-api-in-unit-test
trigger: "撰寫涉及外部 API 的單元測試時"
confidence: 0.5
domain: testing
scope: project
---
# 單元測試中 Mock 外部 API
## 行動
使用 Mock/Stub 替代真實 API 呼叫，確保測試可重複且快速。
## 證據
- Phase 3 測試因外部 API 不穩定而失敗，改用 Mock 後通過
```

### 3. 重複工作流

跨步驟或跨迴圈重複出現的操作序列。

**辨識方式**：
- 相同的工具/步驟序列出現多次
- 每次開發都遵循的特定流程

### 4. 架構決策

經過權衡後做出的技術選型或設計決定。

**辨識方式**：
- 在多個方案中做出選擇
- 明確的取捨分析

## 合併規則

當新 Instinct 與既有 Instinct 相似時：
- `id` 相同 → 更新信心度與證據，不建立新條目
- `trigger` 高度相似但 `id` 不同 → 合併為一條，保留較高信心度
- `trigger` 部分重疊 → 保持獨立，但在證據中互相引用
