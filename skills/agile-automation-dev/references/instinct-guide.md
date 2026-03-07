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

## 記憶結晶化（Instinct → Test）

Instinct 是短期記憶，測試是長期記憶。當 Instinct 經過多輪驗證信心度夠高時，應將其「結晶」為自動化測試，寫進程式碼庫成為永久知識。

### 完整生命週期

```
觀察 / 經驗
    │ Phase 4 萃取
    ▼
Instinct (confidence: 0.3)
    │ 跨迴圈驗證
    ▼
Instinct (confidence: 0.7+)
    │ 結晶化
    ▼
Test (永久寫入程式碼庫)
```

另一條快速路徑：

```
Bug 發現 (Phase 3)
    │ 強制產出迴歸測試
    ▼
Test (直接成為長期記憶)
```

### 結晶條件

- 信心度 **≥ 0.7**
- 該 Instinct 的行動可以用測試表達（可驗證、可自動化）
- 尚未被結晶（`crystallized` 欄位不為 `true`）

### 結晶對照表

**architecture → 架構適應性測試 (Architecture Fitness Test)**

驗證架構約束永遠被遵守。

範例：
```
Instinct: "Controller 不得直接存取 Repository"
→ Test: 描換 Controller 層程式碼，驗證無直接 import Repository
```

**code-style → 約束測試 / Linter 規則**

將程式碼風格偏好固化為可執行的檢查。

範例：
```
Instinct: "Email 欄位必須使用 Value Object"
→ Test: 驗證 Domain Model 中 Email 型別不是 string
```

**testing → 共用測試輔助工具**

將測試模式寫入可複用的 helper。

範例：
```
Instinct: "外部 API 單元測試必須 Mock"
→ 建立 TestHelper.mockExternalApi() 共用方法
```

**security → 安全測試**

將安全實踐固化為自動化驗證。

範例：
```
Instinct: "所有 API 端點皆需輸入驗證"
→ Test: 描換所有 Controller，驗證每個都有 validation middleware
```

**debugging / workflow → 不結晶**

這類 Instinct 屬於操作流程知識，無法用測試表達，保留為 Instinct 即可。

### 結晶後的 Instinct 格式

```yaml
---
id: controller-no-direct-repo-access
trigger: "設計 Controller 層時"
confidence: 0.8
domain: architecture
scope: project
crystallized: true
test_file: "tests/architecture/controller-dependency-test.spec.ts"
---
# Controller 不得直接存取 Repository
## 行動
Controller 必須透過 Service 層存取資料，不得直接引用 Repository。
## 證據
- Phase 2 中直接存取導致循環依賴，重構後解決
- 第 3 輪迴圈再次驗證
## 結晶
- 測試檔案：`tests/architecture/controller-dependency-test.spec.ts`
- 結晶日期：2026-03-07
```

> 結晶後的 Instinct 不再參與信心度演化。測試套件會替你永遠記住這條知識。
