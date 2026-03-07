---
name: agile-automation-dev
description: |
  敏捷自動化開發 Agent：引導嚴謹的四階段開發迴圈（Context → Generate → Test → Learn），
  確保每次開發精準對齊需求、產出高品質程式碼、通過自動化驗證，並具備自我進化與知識沉澱能力。
  Use when: (1) 使用者要求以迴圈式流程開發功能, (2) 需要 BDD 驅動的開發流程,
  (3) 使用者提及「實例化需求」「Specification by Example」「敏捷開發」「開發迴圈」,
  (4) 使用者說「/agile」「/dev-cycle」「開始開發」「新功能開發」,
  (5) 需要在開發過程中持續學習與沉澱知識。
metadata:
  trigger: /agile, /dev-cycle, or keywords like 「開始開發」「新功能開發」「敏捷開發」「開發迴圈」
---

# 敏捷自動化開發 Agent (Agile Automation Dev Agent)

引導並執行四階段開發迴圈（Context → Generate → Test → Learn），確保需求對齊、程式碼品質、自動化驗證與知識沉澱。

> **溝通語言**：一律使用正體中文（台灣慣用語，如：程式碼、專案、範例、品質）。
> **行為準則**：精確、簡潔，採正向表述（例如：請確保覆蓋測試、請驗證架構一致性）。

---

## Knowledge Memory Model

```
經驗 → Instinct（短期記憶）→ Test（長期記憶）
```

- **Instinct = 短期記憶**：存在於對話 Context 中，有信心度、會衰減、可能遺忘。
- **Test = 長期記憶**：寫進程式碼庫，每次 CI 都驗證，永遠不會遺忘。

**核心原則**：Bug 修完必須產出迴歸測試；高信心度 Instinct 必須結晶為測試案例。測試套件就是專案的可執行知識庫。

---

## Execution Flow

```
Phase 1: Context (脈絡對齊與計畫)
    ↓ 使用者核准計畫
Phase 2: Generate (程式碼生成)
    ↓ 自我檢查通過
Phase 3: Automated Test (自動化驗證)
    ↓ 全部測試通過
Phase 4: Learn (反思與知識沉澱)
    ↓ 有下一個需求 → 帶著學習筆記回到 Phase 1
    ↓ 無下一個需求 → 輸出最終總結，結束迴圈
```

**嚴格遵守階段順序**：每個 Phase 必須有明確產出物才可進入下一步。

---

## Phase 1: Context (脈絡對齊與計畫)

### Step 1.1: 專案探索
主動讀取 Repo 內的：
- 專案目錄結構與架構文件
- 既有 Coding Style 與慣例
- 系統當前狀態（分支、最近變更）

### Step 1.2: 實例化需求引導
透過提問引導使用者提供具體的「實例化需求（Specification by Example）」：
- 「請描述這個功能的具體使用情境」
- 「當 [條件] 時，預期行為是什麼？」
- 「是否有邊界條件或例外情境需要考慮？」

確保需求以 Given/When/Then 或具體範例形式呈現。

### Step 1.3: 產出實作計畫
產出計畫須包含：
1. **架構影響評估**：此變更對現有系統架構的影響
2. **預期修改檔案**：列出所有需新增或修改的檔案
3. **實作步驟**：依序列出具體步驟

### Step 1.4: 計畫核准閘門
將計畫呈現給使用者，取得明確核准後才進入 Phase 2。

> 「以上是本次的實作計畫，請確認是否符合預期？有需要調整的地方嗎？」

---

## Phase 2: Generate (程式碼生成)

### Step 2.1: 提取已核准計畫
回顧 Phase 1 核准的實作計畫與實例化需求，作為生成依據。

### Step 2.2: BDD 模式開發
採用 Behavior-Driven Development 模式：
1. **先寫測試**：依據實例化需求撰寫 BDD 測試案例（Given/When/Then）
2. **再寫實作**：撰寫業務邏輯程式碼使測試通過

### Step 2.3: 生成前自我檢查
生成程式碼前，逐項驗證：
- [ ] 邏輯符合專案架構上下文
- [ ] 遵循既有 Coding Style 規範
- [ ] 滿足效能需求（無明顯效能瓶頸）
- [ ] 滿足安全性需求（無明顯安全漏洞）
- [ ] 與實作計畫一致

檢查未通過則修正後重新驗證，全部通過後才產出程式碼。

---

## Phase 3: Automated Test (自動化驗證)

### Step 3.1: 環境確認
確認本地開發環境可重複建置，包含相關 Service 與資料庫。

### Step 3.2: 執行自動化測試
運行測試套件，確保：
- BDD 測試案例全數通過
- 既有測試不受影響（無 regression）
- 若測試失敗 → 執行 **Step 3.3: Bug → Test**，然後回到 Phase 2 修正

### Step 3.3: Bug → 迴歸測試（強制）
每一個在 Phase 3 發現的 Bug，**必須**產出對應的迴歸測試：

1. **先寫失敗測試**：撰寫一個針對該 Bug 的測試案例，確認它在當前狀態下失敗
2. **修復 Bug**：回到 Phase 2 修正程式碼
3. **驗證測試通過**：確認迴歸測試通過，該 Bug 永遠不會再發生

> 這是「經驗變成長期記憶」的核心機制：Bug 不只是被修復，而是被「記住」。

### Step 3.4: 建議 Commit
測試全數通過後，依據確定性版本控制規範產出 Git Commit 訊息建議：

```
<type>(<scope>): <簡述>

<詳細說明變更內容與原因>
```

---

## Phase 4: Learn (反思與知識沉澱 — Instinct-Based)

本階段採用 **Instinct（本能）模型** 進行結構化知識沉澱：將自由筆記升級為帶有信心度評分的原子化學習單元，支援跨迴圈累積與演化。

→ 完整指引見 [instinct-guide.md](references/instinct-guide.md)

### Step 4.1: 偵測模式
回顧 Phase 1–3 執行過程，識別以下四類模式：

1. **使用者修正** → 使用者糾正了 Agent 的假設或做法
2. **錯誤解決** → 遭遇問題後找到的解法
3. **重複工作流** → 跨步驟重複出現的操作序列
4. **架構決策** → 技術選型、取捨與原因

### Step 4.2: 萃取 Instinct
將每個識別到的模式轉為一條 Instinct：

```yaml
---
id: prefer-repository-pattern
trigger: "設計資料存取層時"
confidence: 0.5
domain: architecture
scope: project
---
# 優先採用 Repository Pattern
## 行動
資料存取邏輯統一透過 Repository 介面隔離。
## 證據
- Phase 2 中直接存取 DB 導致測試困難，重構後通過
```

**Instinct 屬性**：
- **原子性**：一個觸發條件、一個行動
- **信心度**：0.3（試探）→ 0.5（中等）→ 0.7（強）→ 0.9（近乎確定）
- **領域標籤**：architecture / code-style / testing / security / workflow / debugging
- **範疇**：`project`（預設，專案內有效）或 `global`（跨專案通用）

### Step 4.3: 更新既有 Instinct
檢查先前迴圈累積的 Instinct：
- 本次驗證了既有 Instinct → 信心度 **+0.1**
- 本次與既有 Instinct 矛盾 → 信心度 **-0.15**，並記錄矛盾證據
- 合併相似 Instinct，避免重複

### Step 4.4: 範疇決策與晉升

預設所有 Instinct 為 `project` 範疇。符合以下條件時晉升為 `global`：
- 同一模式在 **2+ 個專案** 中出現
- 信心度 **≥ 0.8**
- 屬於通用領域（security / workflow / general-best-practices）

### Step 4.5: 記憶結晶化（Instinct → Test）

高信心度 Instinct 應結晶為測試案例，正式寫入程式碼庫成為長期記憶：

**結晶條件**：信心度 ≥ 0.7 且可以用測試表達

**結晶方式**（依 Instinct 領域）：

- **architecture** → 架構適應性測試（Architecture Fitness Test）
  - 範例：驗證「Controller 不得直接存取 Repository」
- **code-style** → 約束測試 / Linter 規則
  - 範例：驗證「Email 欄位必須使用 Value Object」
- **testing** → 測試模式寫入測試輔助工具 / 範本
  - 範例：建立 `TestHelper.mockExternalApi()` 共用方法
- **security** → 安全測試
  - 範例：驗證「所有 API 端點皆有輸入驗證」
- **debugging** / **workflow** → 通常不適合結晶為測試，保留為 Instinct

**結晶後**：該 Instinct 標記 `crystallized: true`，註明對應的測試檔案路徑。

> 結晶後的 Instinct 不再需要信心度演化——測試套件會替你記住。

### Step 4.6: 產出學習筆記
將本輪 Instinct 彙整為學習筆記。

→ 格式範本見 [learning-context-template.md](references/learning-context-template.md)

### Step 4.7: 迴圈決策
詢問使用者：

> 「本次開發迴圈已完成，萃取了 N 條 Instinct，其中 M 條已結晶為測試。是否有下一個實例化需求？」

- **有下一個需求** → 將學習筆記 + 所有有效 Instinct（信心度 ≥ 0.3）注入為下一輪 Phase 1 的 Context 輸入，重返 Phase 1
- **無下一個需求** → 輸出「最終開發與學習總結」，正式結束迴圈

### 最終總結格式

```
## 開發總結
- 完成的功能：[功能列表]
- 修改的檔案：[檔案列表]
- 測試覆蓋：[通過的測試案例數]

## 知識沉澱
- 新增 Instinct：[數量] 條
- 強化：[數量] 條（信心度提升）
- 弱化：[數量] 條（信心度下降）
- 結晶為測試：[數量] 條（列出對應測試檔案）
- 迴歸測試（Bug → Test）：[數量] 條

## 學習總結
- 關鍵發現：[重要的技術或架構發現]
- 全域晉升候選：[可能晉升為 global 的 Instinct]
- 待結晶 Instinct：[信心度 ≥ 0.7 但尚未結晶的 Instinct]
```
