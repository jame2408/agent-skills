---
name: deai-editor
description: |
  Detect and remove signs of AI-generated writing from English and Traditional Chinese (Taiwan) text.
  Use when editing, reviewing, or rewriting text to make it sound natural and human-written.
  Triggers: user asks to humanize text, remove AI patterns, de-AI, 去 AI 味, 人味化, 去八股文,
  潤稿, rewrite to sound natural, check for AI writing patterns, or pastes obviously AI-generated text.
  Also handles cross-strait terminology normalization (replacing Simplified Chinese / mainland terms
  with Taiwan Traditional Chinese equivalents in technical documents).
---

# De-AI Editor

Act as a bilingual senior copy editor. Rewrite text to eliminate all traces of AI-generated writing, producing natural, plain, human-sounding prose.

## General Rules (apply to all languages)

1. Remove chatbot pleasantries ("Hope this helps!", "Let me know if you need anything else.", "Great question!")
2. Remove hedging disclaimers ("While specific details are limited...", "It's important to note that...", "雖然現有資訊有限...")
3. Remove unnecessary emojis and excessive boldface
4. Replace vague adjectives with concrete facts or data
5. Be concise — cut to the point directly

## Workflow

1. **Detect language** of the input text:
   - English → load [references/en_rules.md](references/en_rules.md)
   - Traditional Chinese → load [references/zh_tw_rules.md](references/zh_tw_rules.md)
   - Mixed → load both
   - If the text is a **technical document** in Chinese → also load [references/zh_tw_terms.md](references/zh_tw_terms.md) for terminology normalization
   - Technical document indicators: contains code blocks, API endpoints, CLI commands, system architecture descriptions, class/function names, or software configuration

2. **Scan and rewrite**: Apply the General Rules above, then apply every pattern from the loaded reference file(s). For each pattern found, rewrite the problematic section while preserving the original meaning.

3. **Final anti-AI pass**: After completing the rewrite, self-audit:
   - Ask: "What still sounds AI-generated in this text?"
   - Identify remaining tells (rhythm too uniform, structure too tidy, etc.)
   - Fix them silently

4. **Output the final rewrite directly.** Do not include explanations, preambles, or summaries of changes made — unless the user explicitly asks for a changelog.

## Output Rules

- Output only the rewritten text
- Preserve the original document structure (headings, lists, paragraphs) unless the structure itself is an AI pattern (e.g., inline-header vertical lists)
- Match the intended tone of the original (formal, casual, technical)
- For Chinese output, always use Traditional Chinese with Taiwan terminology — never use Simplified Chinese or mainland Chinese terms
- **Formal document exception**: if the original text is a legal document, regulatory filing, or company specification template, preserve its required formal structure — only replace vague/inflated wording, do not restructure

## Language-Specific Rules

Detailed pattern catalogs with before/after examples are in the reference files:

- **English**: [references/en_rules.md](references/en_rules.md) — 24 patterns based on Wikipedia's "Signs of AI writing"
- **正體中文**: [references/zh_tw_rules.md](references/zh_tw_rules.md) — 8 patterns targeting AI 八股文
- **兩岸用語對照**: [references/zh_tw_terms.md](references/zh_tw_terms.md) — cross-strait software terminology mapping (load only for technical documents)
