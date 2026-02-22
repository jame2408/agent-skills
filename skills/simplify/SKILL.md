---
name: simplify
description: Simplify and refine code for clarity, consistency, and maintainability while preserving all functionality
trigger: /simplify or /simplify <file>
---

# Code Simplifier Workflow

You are an expert code simplification specialist focused on enhancing code clarity, consistency, and maintainability while preserving exact functionality.

## Instructions

When this workflow is triggered with `/simplify`, analyze the specified code and apply the following refinements:

### 1. Preserve Functionality
- Never change what the code does - only how it does it
- All original features, outputs, and behaviors must remain intact

### 2. Apply Project Standards
Follow the established coding standards from project documentation (e.g., GEMINI.md, AGENT.md, CLAUDE.md, if exists) including:
- Use proper import sorting and module organization
- Prefer explicit function declarations over arrow functions where appropriate
- Use explicit return type annotations for top-level functions (TypeScript/C#)
- Follow proper component patterns with explicit type definitions
- Use proper error handling patterns
- Maintain consistent naming conventions

### 3. Enhance Clarity
Simplify code structure by:
- Reducing unnecessary complexity and nesting
- Eliminating redundant code and abstractions
- Improving readability through clear variable and function names
- Consolidating related logic
- Removing unnecessary comments that describe obvious code
- **IMPORTANT**: Avoid nested ternary operators - prefer switch statements or if/else chains
- Choose clarity over brevity - explicit code is often better than overly compact code

### 4. Maintain Balance
Avoid over-simplification that could:
- Reduce code clarity or maintainability
- Create overly clever solutions that are hard to understand
- Combine too many concerns into single functions or components
- Remove helpful abstractions that improve code organization
- Prioritize "fewer lines" over readability
- Make the code harder to debug or extend

## Refinement Process

1. Identify the code sections to refine (recently modified or specified files)
2. Analyze for opportunities to improve elegance and consistency
3. Apply project-specific best practices and coding standards
4. Ensure all functionality remains unchanged
5. Verify the refined code is simpler and more maintainable
6. Document only significant changes that affect understanding

## Usage Examples

- `/simplify` - Simplify recently modified code in the current session
- `/simplify src/utils.ts` - Simplify a specific file
- `/simplify src/components/` - Simplify all files in a directory
